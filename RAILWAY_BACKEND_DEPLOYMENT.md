# 🚂 **Railway Backend Deployment Guide**

## **Backend-Only Deployment for LegalDost**

### **Step 1: Prepare Repository**

The repository is now configured for backend-only deployment on Railway.

**Files added:**
- `railway.toml` - Railway configuration
- `nixpacks.toml` - Build configuration
- Updated `package.json` - Backend-only build script

### **Step 2: Deploy to Railway**

1. **Go to [railway.app](https://railway.app)**
2. **Sign up/Login with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your LegalDost repository**
6. **Railway will auto-detect Node.js**

### **Step 3: Set Environment Variables**

In Railway dashboard, add these environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/legaldost?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=https://legaldost-frontend-bjwceajad-aryans-projects-f84ec15d.vercel.app
PORT=5000
```

### **Step 4: Deploy**

Railway will automatically:
1. Install dependencies (`npm install --production`)
2. Skip client build (backend only)
3. Start server (`npm start`)

### **Step 5: Get Railway URL**

After deployment, Railway will provide a URL like:
`https://your-app-name.railway.app`

### **Step 6: Update Frontend**

Update `client/.env` with your Railway backend URL:

```env
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=https://your-railway-app.railway.app
```

### **Step 7: Redeploy Frontend**

```bash
cd client
vercel --prod
```

## **🎯 Complete Deployment Architecture**

```
Frontend (Vercel)  →  Backend (Railway)  →  Database (MongoDB Atlas)
     ↓                      ↓                       ↓
Static React App    Node.js/Express API      MongoDB Cloud
Global CDN          Serverless Functions     Managed Database
```

## **✅ Success Checklist**

- ✅ Railway backend deployed
- ✅ Environment variables set
- ✅ Frontend updated with Railway URL
- ✅ Frontend redeployed to Vercel
- ✅ All features working

## **🚀 Benefits**

- **Fast**: Global CDN + Serverless
- **Scalable**: Auto-scaling on both platforms
- **Reliable**: 99.9% uptime
- **Cost-effective**: Free tiers available
- **Easy**: Git-based deployments

Your LegalDost app will be production-ready with this setup!