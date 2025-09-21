# 🚀 **Vercel Frontend-Only Deployment (Recommended)**

## **Strategy: Deploy Frontend to Vercel + Backend to Railway/Render**

This is the fastest and most reliable approach for your LegalDost app.

### **Step 1: Deploy Frontend to Vercel**

```bash
# Navigate to client directory
cd client

# Deploy frontend only
vercel --prod

# Follow prompts:
# Project name: legaldost-frontend
# Directory: ./
```

### **Step 2: Deploy Backend to Railway (Free & Fast)**

1. **Go to [railway.app](https://railway.app)**
2. **Connect GitHub repo**
3. **Select your LegalDost repository**
4. **Set environment variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
5. **Deploy automatically**

### **Step 3: Update Frontend API URL**

Update `client/.env`:
```env
REACT_APP_API_URL=https://your-railway-app.railway.app
GENERATE_SOURCEMAP=false
```

### **Step 4: Redeploy Frontend**
```bash
cd client
vercel --prod
```

## **Alternative: Deploy Backend to Render**

1. **Go to [render.com](https://render.com)**
2. **Connect GitHub repo**
3. **Create new Web Service**
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. **Set environment variables**
7. **Deploy**

## **🎯 Quick Commands**

```bash
# Frontend (Vercel)
cd client
vercel --prod

# Update API URL in client/.env
# Then redeploy
vercel --prod
```

**This approach is much more reliable and faster!**