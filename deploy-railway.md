# 🚂 **Quick Railway Deployment Steps**

## **Current Status:**
✅ **Frontend deployed:** https://legaldost-frontend-bjwceajad-aryans-projects-f84ec15d.vercel.app
⏳ **Backend:** Ready for Railway deployment

## **Deploy Backend to Railway (5 minutes):**

### **1. Go to Railway**
- Visit: https://railway.app
- Click "Login with GitHub"

### **2. Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your LegalDost repository
- Railway will detect Node.js automatically

### **3. Set Environment Variables**
In Railway dashboard → Variables tab, add:

```
NODE_ENV = production
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/legaldost
JWT_SECRET = your_super_secure_jwt_secret_minimum_32_characters
GEMINI_API_KEY = your_gemini_api_key_here
CLIENT_URL = https://legaldost-frontend-bjwceajad-aryans-projects-f84ec15d.vercel.app
```

### **4. Deploy**
- Railway will automatically build and deploy
- Wait 2-3 minutes for deployment
- Copy your Railway app URL (e.g., `https://legaldost-production.railway.app`)

### **5. Update Frontend**
Replace the Railway URL in `client/.env`:
```env
REACT_APP_API_URL=https://your-railway-app.railway.app
```

### **6. Redeploy Frontend**
```bash
cd client
vercel --prod
```

## **🎉 Done!**
Your full-stack LegalDost app will be live with:
- Frontend: Vercel (Global CDN)
- Backend: Railway (Auto-scaling)
- Database: MongoDB Atlas (Cloud)

**Total deployment time: ~10 minutes**
**Monthly cost: $0 (free tiers)**