# Railway Deployment Guide

## Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/bruteosaur)

## Project Info

- **Project ID**: `563aebfa-dd5e-4b49-98cc-912882d0f826`
- **Environment**: `production` (85dd1e8a-4e8f-4bea-a527-2f6fce47bc9b)
- **Services Created**:
  - Backend API: `144b7cf0-6607-4f25-bcdb-8e7f75706556`
  - Admin Panel: `0b768c44-6d6f-476c-b742-b6721994f5ad`
  - Frontend: `a8d66316-0442-489c-a0d7-2354f115510a`

## Manual Setup Steps

### 1. Access Railway Dashboard

Visit: https://railway.app/project/563aebfa-dd5e-4b49-98cc-112882d0f826

### 2. Add MongoDB Database

1. Click "+ New"
2. Select "Database" → "Add MongoDB"
3. Wait for provisioning
4. Copy the `MONGO_URL` connection string

### 3. Configure Backend API Service

Service ID: `144b7cf0-6607-4f25-bcdb-8e7f75706556`

1. Click on "backend-api" service
2. Go to "Settings" → "Source"
3. Connect GitHub:
   - Repository: `jashmhta/BruteOsaurXminer.com`
   - Branch: `main`
   - Root Directory: `backend`
4. Go to "Settings" → "Deploy"
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT --workers 2`
5. Go to "Variables" and add:
   ```
   MONGO_URL=${{MongoDB.MONGO_URL}}
   DB_NAME=miners_production
   PORT=${{PORT}}
   ADMIN_EMAIL=mjash028@gmail.com
   ADMIN_USERNAME=mjash028@gmail.com
   ADMIN_PASSWORD=Iforgotpass8869@
   ADMIN_PASSWORD_HASH=$2b$12$umPOE.ueb8h98p95vJCJFeZpeJgEc9Ie0PqPNrANYFYGnA4/VxSYW
   SESSION_SECRET=3chdPqI9PB5hDFVyJrBWbyG0J3_xgW3VH0NppmpN-z_RpXwl9v2s3qQ7eO1Ohuw2OhiaraXQJbZl2e0lXoSeFw
   JWT_SECRET=HD5OfDJWGL8iNlxaVC9ciigoY3jNDG9VNWPAILb2U4l43ewibUwzfbSPDP1eLz53d19wYGLHMM-fm9DLvYgZLA
   WC_PROJECT_ID=7e2c7eff2063014dc8d71be203efd44e
   RPC_ETH_URL=https://rpc.ankr.com/eth
   RPC_POLYGON_URL=https://polygon-rpc.com
   RPC_BSC_URL=https://bsc-dataseed.binance.org
   ENABLE_CORS=true
   ENABLE_RATE_LIMITING=true
   MAX_REQUESTS_PER_MINUTE=60
   ENABLE_SECURITY_HEADERS=true
   REQUEST_TIMEOUT=30
   MAX_CONTENT_LENGTH=1048576
   USE_TESTNET=false
   ```
6. Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Copy the URL (e.g., `backend-api-production-xxxx.up.railway.app`)

### 4. Configure Admin Panel Service

Service ID: `0b768c44-6d6f-476c-b742-b6721994f5ad`

1. Click on "admin-panel" service
2. Go to "Settings" → "Source"
3. Connect GitHub:
   - Repository: `jashmhta/BruteOsaurXminer.com`
   - Branch: `main`
   - Root Directory: `backend`
4. Go to "Settings" → "Deploy"
   - Start Command: `python3 admin_server.py`
5. Go to "Variables" and add (same as backend)
6. Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Copy the URL

### 5. Configure Frontend Service

Service ID: `a8d66316-0442-489c-a0d7-2354f115510a`

1. Click on "frontend" service
2. Go to "Settings" → "Source"
3. Connect GitHub:
   - Repository: `jashmhta/BruteOsaurXminer.com`
   - Branch: `main`
   - Root Directory: `frontend`
4. Go to "Settings" → "Build"
   - Build Command: `yarn install && yarn build`
5. Go to "Settings" → "Deploy"
   - Start Command: `npx serve -s build -l $PORT`
6. Go to "Variables" and add:
   ```
   REACT_APP_BACKEND_URL=https://<backend-api-url-from-step-3>
   REACT_APP_WALLETCONNECT_PROJECT_ID=7e2c7eff2063014dc8d71be203efd44e
   REACT_APP_PUBLIC_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   GENERATE_SOURCEMAP=false
   NODE_ENV=production
   ```
7. Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - This will be your main app URL

### 6. Update Frontend Environment Variable

After backend URL is generated:
1. Go back to Frontend service → Variables
2. Update `REACT_APP_BACKEND_URL` with the backend API domain
3. Redeploy frontend

### 7. Update CORS Settings

After frontend URL is generated:
1. Go to Backend API service → Variables
2. Add/Update:
   ```
   CORS_ORIGINS=https://<frontend-url>
   ALLOWED_ORIGINS=https://<frontend-url>
   ```
3. Redeploy backend

## Environment Variables Required

### Backend & Admin
- `MONGO_URL` - MongoDB connection string (from Railway MongoDB plugin)
- `DB_NAME` - Database name (miners_production)
- `ADMIN_EMAIL` - Admin email
- `ADMIN_USERNAME` - Admin username
- `ADMIN_PASSWORD` - Admin plaintext password
- `ADMIN_PASSWORD_HASH` - Bcrypt hash of password
- `SESSION_SECRET` - Random 64-char string
- `JWT_SECRET` - Random 64-char string
- `WC_PROJECT_ID` - WalletConnect project ID
- `RPC_*_URL` - Blockchain RPC endpoints
- `CORS_ORIGINS` - Frontend URL
- `ALLOWED_ORIGINS` - Frontend URL

### Frontend
- `REACT_APP_BACKEND_URL` - Backend API URL
- `REACT_APP_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID
- `REACT_APP_PUBLIC_URL` - Frontend URL
- `GENERATE_SOURCEMAP` - false (for production)

## Custom Domain (Optional)

For each service:
1. Go to service → Settings → Networking
2. Click "Custom Domain"
3. Add your domain (requires DNS configuration)

## Monitoring

- View logs: Click service → "Deployments" → Latest deployment → "View Logs"
- View metrics: Click service → "Metrics"
- Check status: All services should show "Active" in green

## Troubleshooting

### Service won't start
- Check logs in Deployments tab
- Verify all environment variables are set
- Ensure MongoDB is connected

### Frontend can't reach backend
- Verify `REACT_APP_BACKEND_URL` matches backend domain
- Check CORS settings in backend
- Ensure backend domain is generated and public

### MongoDB connection failed
- Verify `MONGO_URL` variable is referencing MongoDB service
- Check MongoDB service is running
- Ensure database plugin is provisioned

## Cost Estimate

With $5 Railway credit:
- MongoDB: ~$5/month
- Backend API: ~$5/month
- Admin Panel: ~$5/month  
- Frontend: ~$5/month

**Total: ~$20/month** (credit covers ~1 week)

Consider:
- Reducing to 2 services (combine admin with backend)
- Using free MongoDB Atlas instead
- Optimizing resource usage

## Alternative: Railway CLI Deployment

```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# Login
railway login

# Link project
railway link -p 563aebfa-dd5e-4b49-98cc-112882d0f826

# Deploy
railway up
```

## Support

Railway Dashboard: https://railway.app/project/563aebfa-dd5e-4b49-98cc-112882d0f826
Railway Docs: https://docs.railway.app
