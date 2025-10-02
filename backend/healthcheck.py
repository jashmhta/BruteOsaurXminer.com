#!/usr/bin/env python3
import asyncio
import os
import sys

import requests
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()


async def check_system():
    print("=" * 60)
    print("BRUTEOSAUR SYSTEM HEALTH CHECK")
    print("=" * 60)

    all_checks_passed = True

    # 1. MongoDB Connection
    print("\n[1] MongoDB Connection...")
    try:
        mongo_uri = os.getenv("MONGO_URL", "mongodb://localhost:27017")
        client = AsyncIOMotorClient(mongo_uri)
        await client.admin.command("ping")
        db = client[os.getenv("DB_NAME", "miners_production")]
        users_count = await db.users.count_documents({})
        print(f"    ✓ MongoDB connected (DB: {os.getenv('DB_NAME')})")
        print(f"    ✓ Users collection: {users_count} documents")
        client.close()
    except Exception as e:
        print(f"    ✗ MongoDB connection failed: {e}")
        all_checks_passed = False

    # 2. Main API Server
    print("\n[2] Main API Server (Port 8001)...")
    try:
        resp = requests.get("http://localhost:8001/api/", timeout=5)
        if resp.status_code == 200:
            print("    ✓ API server online")
            print(f"    ✓ Response: {resp.json()}")
        else:
            print(f"    ✗ API server returned status {resp.status_code}")
            all_checks_passed = False
    except Exception as e:
        print(f"    ✗ API server not responding: {e}")
        all_checks_passed = False

    # 3. Admin Dashboard
    print("\n[3] Admin Dashboard (Port 8000)...")
    try:
        resp = requests.get("http://localhost:8000/", timeout=5)
        if resp.status_code == 200 and "html" in resp.text.lower():
            print("    ✓ Admin dashboard online")
        else:
            print(f"    ✗ Admin dashboard returned status {resp.status_code}")
            all_checks_passed = False
    except Exception as e:
        print(f"    ✗ Admin dashboard not responding: {e}")
        all_checks_passed = False

    # 4. Environment Variables
    print("\n[4] Environment Configuration...")
    required_vars = [
        "MONGO_URL",
        "DB_NAME",
        "ADMIN_EMAIL",
        "WC_PROJECT_ID",
        "JWT_SECRET",
    ]
    missing_vars = []
    for var in required_vars:
        if os.getenv(var):
            print(f"    ✓ {var} is set")
        else:
            print(f"    ✗ {var} is missing")
            missing_vars.append(var)
            all_checks_passed = False

    # 5. RPC Configuration
    print("\n[5] Blockchain RPC Configuration...")
    rpcs = {
        "Ethereum": os.getenv("RPC_ETH_URL", "https://eth.llamarpc.com"),
        "Polygon": os.getenv("RPC_POLYGON_URL", "https://polygon-rpc.com"),
        "BSC": os.getenv("RPC_BSC_URL", "https://bsc-dataseed.binance.org"),
    }
    for chain, url in rpcs.items():
        print(f"    ✓ {chain}: {url}")

    # 6. File Integrity
    print("\n[6] Critical Files...")
    critical_files = [
        "/home/azureuser/miners/backend/server.py",
        "/home/azureuser/miners/backend/admin_server.py",
        "/home/azureuser/miners/backend/utils.py",
        "/home/azureuser/miners/backend/.env",
    ]
    for file_path in critical_files:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"    ✓ {os.path.basename(file_path)} ({size:,} bytes)")
        else:
            print(f"    ✗ {os.path.basename(file_path)} is missing")
            all_checks_passed = False

    # Summary
    print("\n" + "=" * 60)
    if all_checks_passed:
        print("✓ ALL CHECKS PASSED - SYSTEM IS HEALTHY")
        print("=" * 60)
        return 0
    else:
        print("✗ SOME CHECKS FAILED - REVIEW ERRORS ABOVE")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(check_system())
    sys.exit(exit_code)
