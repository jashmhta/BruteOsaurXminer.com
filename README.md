# Bruteosaur - Crypto Wallet Validator Platform

A full-stack web application for cryptocurrency wallet validation and BIP39 seed phrase verification. Features React frontend with WalletConnect integration and FastAPI backend with MongoDB.

**Live Site**: https://bruteosaur.duckdns.org  
**Admin Panel**: https://admin.bruteosaur.duckdns.org  
**API**: https://api.bruteosaur.duckdns.org

---

## Tech Stack

### Frontend
- **Framework**: React 18 with Create React App
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: React Context + Hooks
- **Wallet Integration**: WalletConnect v2
- **Testing**: Playwright (E2E), Jest (Unit)
- **Build Tool**: Webpack (via CRA)

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: MongoDB (motor async driver)
- **Authentication**: JWT + bcrypt
- **Blockchain**: web3.py, eth-account, bip-utils
- **Admin Server**: Flask-based dashboard
- **API Docs**: Auto-generated OpenAPI/Swagger

### Infrastructure
- **Hosting**: Azure VM (Ubuntu 22.04)
- **Reverse Proxy**: Caddy v2 (auto-SSL with Let's Encrypt)
- **DNS**: DuckDNS (dynamic DNS)
- **Process Management**: systemd
- **Database**: MongoDB 7.x (local instance)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Azure VM (Virginia)                    │
│                    172.206.32.165 (private)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Caddy (Reverse Proxy + SSL)                             │ │
│  │ Ports: 80 (HTTP→HTTPS), 443 (HTTPS)                    │ │
│  └──────┬────────────────┬────────────────┬────────────────┘ │
│         │                │                │                   │
│    bruteosaur      api.bruteosaur   admin.bruteosaur        │
│    .duckdns.org    .duckdns.org     .duckdns.org            │
│         │                │                │                   │
│         ▼                ▼                ▼                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Frontend │    │ Backend  │    │  Admin   │              │
│  │ (React)  │    │ (FastAPI)│    │ (Flask)  │              │
│  │ Port 3000│    │ Port 8001│    │ Port 8000│              │
│  └──────────┘    └─────┬────┘    └─────┬────┘              │
│                        │                │                     │
│                        └────────┬───────┘                     │
│                                 │                             │
│                          ┌──────▼──────┐                     │
│                          │  MongoDB    │                     │
│                          │  Port 27017 │                     │
│                          │  (localhost)│                     │
│                          └─────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites
- **Node.js** 18+ and **Yarn** 1.22+
- **Python** 3.10+ with **pip**
- **MongoDB** 7.x
- **Caddy** 2.x (for production)

### Development Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd miners
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your credentials (see Configuration section)

# Start MongoDB (if not running)
mongod --dbpath ./data/db --fork --logpath mongodb.log

# Run development server
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Or run admin server
python admin_server.py
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
yarn install

# Create .env file
cp .env.example .env
# Edit .env with backend URL

# Start development server
yarn start
```

Visit http://localhost:3000

#### 4. Run Tests
```bash
# Frontend unit tests
cd frontend && yarn test

# E2E tests (all tests)
yarn e2e

# E2E tests (headed mode - visible browser)
yarn e2e:headed

# E2E tests (specific test file)
npx playwright test e2e/auth.spec.js

# E2E tests (interactive UI mode)
yarn e2e:ui
```

---

## Production Deployment

### Server Requirements
- Ubuntu 22.04 LTS (or similar)
- 2+ CPU cores, 4GB+ RAM
- Public IP with ports 80/443 open

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Yarn
sudo npm install -g yarn

# Install Python 3.10+
sudo apt install -y python3 python3-pip python3-venv

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy

# Install serve (for frontend)
sudo npm install -g serve
```

### Step 2: Clone and Configure

```bash
# Clone repository
cd /home/azureuser
git clone <repository-url> miners
cd miners

# Backend configuration
cd backend
cp .env.example .env
nano .env  # Edit with production values

# Generate secure secrets (run in Python)
python3 -c "import secrets; print(secrets.token_urlsafe(64))"  # For SESSION_SECRET
python3 -c "import secrets; print(secrets.token_urlsafe(64))"  # For JWT_SECRET

# Hash admin password (run in Python)
python3 -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto'); print(pwd_context.hash('YOUR_PASSWORD'))"

# Install Python dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend configuration
cd ../frontend
cp .env.example .env
nano .env  # Set REACT_APP_BACKEND_URL to your API domain

# Install and build
yarn install
yarn build
```

### Step 3: Setup DuckDNS (Dynamic DNS)

```bash
# Create DuckDNS update script
mkdir -p /home/azureuser/miners/duckdns
nano /home/azureuser/miners/duckdns/duck.sh
```

Add this content (replace `YOUR_TOKEN` and domains):
```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=bruteosaur,api,admin&token=YOUR_TOKEN&ip=" | curl -k -o /home/azureuser/miners/duckdns/duck.log -K -
```

```bash
# Make executable
chmod +x /home/azureuser/miners/duckdns/duck.sh

# Add to crontab (runs every 5 minutes)
crontab -e
# Add line: */5 * * * * /home/azureuser/miners/duckdns/duck.sh >/dev/null 2>&1
```

### Step 4: Create systemd Services

#### MongoDB Service
```bash
sudo nano /etc/systemd/system/mongodb.service
```
```ini
[Unit]
Description=MongoDB Database Server
After=network.target

[Service]
Type=forking
User=mongodb
Group=mongodb
ExecStart=/usr/bin/mongod --config /etc/mongod.conf
PIDFile=/var/run/mongodb/mongod.pid
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

#### Backend API Service
```bash
sudo nano /etc/systemd/system/miners-backend.service
```
```ini
[Unit]
Description=Miners Backend API
After=network.target mongodb.service

[Service]
Type=simple
User=azureuser
WorkingDirectory=/home/azureuser/miners/backend
Environment="PATH=/home/azureuser/miners/backend/venv/bin:/usr/bin:/usr/local/bin"
ExecStart=/home/azureuser/miners/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

#### Admin Server Service
```bash
sudo nano /etc/systemd/system/miners-admin.service
```
```ini
[Unit]
Description=Miners Admin Server
After=network.target mongodb.service

[Service]
Type=simple
User=azureuser
WorkingDirectory=/home/azureuser/miners/backend
Environment="PATH=/home/azureuser/miners/backend/venv/bin:/usr/bin:/usr/local/bin"
ExecStart=/home/azureuser/miners/backend/venv/bin/python3 admin_server.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

#### Frontend Service
```bash
sudo nano /etc/systemd/system/miners-frontend.service
```
```ini
[Unit]
Description=Miners Frontend
After=network.target

[Service]
Type=simple
User=azureuser
WorkingDirectory=/home/azureuser/miners/frontend
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/serve -s build -l 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Step 5: Configure Caddy

```bash
sudo nano /etc/caddy/Caddyfile
```
```caddyfile
bruteosaur.duckdns.org {
    reverse_proxy localhost:3000
    encode gzip zstd
    header {
        Cache-Control "public, max-age=31536000, immutable" @static
        Cache-Control "public, max-age=3600" @html
    }
    @static {
        path *.js *.css *.jpg *.jpeg *.png *.gif *.ico *.woff *.woff2 *.ttf *.svg
    }
    @html {
        path *.html /
    }
}

api.bruteosaur.duckdns.org {
    reverse_proxy localhost:8001
}

admin.bruteosaur.duckdns.org {
    reverse_proxy localhost:8000
}
```

### Step 6: Start All Services

```bash
# Enable and start MongoDB
sudo systemctl enable mongodb
sudo systemctl start mongodb

# Enable and start application services
sudo systemctl enable miners-backend miners-admin miners-frontend caddy
sudo systemctl start miners-backend miners-admin miners-frontend caddy

# Check status
sudo systemctl status mongodb miners-backend miners-admin miners-frontend caddy
```

### Step 7: Verify Deployment

```bash
# Check service logs
sudo journalctl -u miners-backend -f
sudo journalctl -u miners-admin -f
sudo journalctl -u miners-frontend -f

# Test endpoints
curl https://api.bruteosaur.duckdns.org/health
curl https://admin.bruteosaur.duckdns.org/
curl https://bruteosaur.duckdns.org/

# Check MongoDB
mongosh
> use miners_production
> show collections
> db.users.countDocuments()
```

---

## Configuration

### Backend Environment Variables

Key variables in `backend/.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DB_NAME` | Database name | `miners_production` |
| `ADMIN_USERNAME` | Admin login username | `admin@example.com` |
| `ADMIN_PASSWORD` | Admin plaintext password | `SecurePass123!` |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of password | `$2b$12$...` |
| `SESSION_SECRET` | Flask session encryption key | `urlsafe-64-char-string` |
| `JWT_SECRET` | JWT token signing key | `urlsafe-64-char-string` |
| `WC_PROJECT_ID` | WalletConnect project ID | Get from [WalletConnect Cloud](https://cloud.walletconnect.com) |
| `RPC_ETH_URL` | Ethereum RPC endpoint | `https://rpc.ankr.com/eth` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://yourdomain.com` |

### Frontend Environment Variables

Key variables in `frontend/.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | Backend API URL | `https://api.yourdomain.com` |
| `REACT_APP_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | Same as backend `WC_PROJECT_ID` |
| `REACT_APP_PUBLIC_URL` | Frontend public URL | `https://yourdomain.com` |
| `GENERATE_SOURCEMAP` | Generate source maps | `false` (for production) |

---

## Project Structure

```
miners/
├── backend/
│   ├── server.py              # FastAPI main application
│   ├── admin_server.py        # Flask admin dashboard
│   ├── utils.py               # Shared utilities
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables (gitignored)
│   └── .env.example           # Environment template
│
├── frontend/
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── Layout.jsx    # App layout wrapper
│   │   │   └── ErrorBoundary.jsx
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities (cn helper)
│   │   ├── utils/            # Logger, helpers
│   │   ├── App.js            # Root component
│   │   └── index.js          # Entry point
│   ├── e2e/                  # Playwright E2E tests
│   ├── package.json          # Node dependencies
│   ├── .env                  # Environment variables (gitignored)
│   └── .env.example          # Environment template
│
├── tests/                    # Python unit tests (empty)
├── duckdns/                  # DuckDNS update script
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

---

## API Documentation

Once running, visit:
- **Swagger UI**: https://api.bruteosaur.duckdns.org/docs
- **ReDoc**: https://api.bruteosaur.duckdns.org/redoc

### Key Endpoints

#### Authentication
- `POST /register` - Register new user
- `POST /login` - Login user (returns JWT)
- `GET /profile` - Get user profile (requires JWT)

#### Wallet Validation
- `POST /validate-wallet` - Submit wallet for validation
- `GET /validations/{user_id}` - Get user's validations
- `GET /validations/stats` - Get validation statistics

#### Admin
- `GET /admin/users` - List all users
- `GET /admin/validations` - List all validations
- `POST /admin/export/excel` - Export data to Excel
- `POST /admin/export/pdf` - Export data to PDF

---

## Maintenance

### Update Application

```bash
# Pull latest changes
cd /home/azureuser/miners
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart miners-backend miners-admin

# Update frontend
cd ../frontend
yarn install
yarn build
sudo systemctl restart miners-frontend
```

### View Logs

```bash
# Application logs
sudo journalctl -u miners-backend -n 100 -f
sudo journalctl -u miners-admin -n 100 -f
sudo journalctl -u miners-frontend -n 100 -f

# MongoDB logs
sudo journalctl -u mongodb -n 100 -f

# Caddy logs
sudo journalctl -u caddy -n 100 -f
```

### Backup Database

```bash
# Create backup
mongodump --db miners_production --out /home/azureuser/backups/$(date +%Y%m%d)

# Restore backup
mongorestore --db miners_production /home/azureuser/backups/20251002/miners_production
```

### Clean Database (Development Only)

```bash
# Connect to MongoDB
mongosh

# Switch to database
use miners_production

# Drop all collections
db.users.deleteMany({})
db.wallet_validations.deleteMany({})
db.logs.deleteMany({})

# Or drop entire database
db.dropDatabase()
```

---

## Security Considerations

### Production Checklist

- ✅ Use strong, unique passwords for admin accounts
- ✅ Generate random SESSION_SECRET and JWT_SECRET (64+ characters)
- ✅ Use bcrypt for password hashing (already implemented)
- ✅ Enable HTTPS with valid SSL certificates (Caddy auto-handles)
- ✅ Set CORS to specific domains only (no wildcards in production)
- ✅ Keep .env files out of version control (.gitignore configured)
- ✅ Use environment variables for all secrets
- ✅ Enable rate limiting (configured in backend)
- ✅ Bind MongoDB to localhost only (127.0.0.1)
- ✅ Keep dependencies updated (regularly run `pip install -U` / `yarn upgrade`)
- ✅ Monitor logs for suspicious activity
- ⚠️ Set up firewall (UFW) to block unnecessary ports
- ⚠️ Enable fail2ban for SSH protection
- ⚠️ Set up automated backups
- ⚠️ Implement log rotation

### Firewall Setup

```bash
# Install UFW
sudo apt install -y ufw

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check service status and logs
sudo systemctl status miners-backend
sudo journalctl -u miners-backend -n 50

# Check if ports are in use
sudo lsof -i :8001  # Backend
sudo lsof -i :8000  # Admin
sudo lsof -i :3000  # Frontend

# Kill process on port
sudo kill -9 $(sudo lsof -t -i:8001)
```

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongodb

# Test connection
mongosh
```

### SSL Certificate Issues

```bash
# Check Caddy logs
sudo journalctl -u caddy -n 100

# Restart Caddy
sudo systemctl restart caddy

# Test Caddy config
sudo caddy validate --config /etc/caddy/Caddyfile
```

### E2E Tests Failing

```bash
# Update Playwright browsers
cd frontend
npx playwright install

# Run in headed mode to see what's happening
yarn e2e:headed

# Run specific test file
npx playwright test e2e/auth.spec.js --headed

# Check test debug logs
npx playwright show-report
```

### CORS Errors in Browser

1. Check `ALLOWED_ORIGINS` in `backend/.env` includes your frontend domain
2. Check `CORS_ORIGINS` matches `ALLOWED_ORIGINS`
3. Restart backend: `sudo systemctl restart miners-backend`

---

## License

Proprietary - All rights reserved

---

## Support

For issues and questions:
- Check logs: `sudo journalctl -u miners-backend -f`
- Review API docs: https://api.bruteosaur.duckdns.org/docs
- Test with curl: `curl -X POST https://api.bruteosaur.duckdns.org/register -H "Content-Type: application/json" -d '{"username":"test","email":"test@example.com","password":"Test123!"}'`

---

**Last Updated**: October 2025  
**Version**: 1.0.0
