@echo off
echo 🚀 MongoDB Setup for Windows
echo.

echo Checking if MongoDB is installed...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB is not installed
    echo.
    echo 📖 Please install MongoDB Community Server:
    echo 1. Go to: https://www.mongodb.com/try/download/community
    echo 2. Download Windows MSI installer
    echo 3. Run installer and choose "Complete" installation
    echo 4. Install as Windows Service
    echo.
    echo 🌐 Alternative: Use MongoDB Atlas (cloud)
    echo 1. Sign up at: https://www.mongodb.com/atlas
    echo 2. Create free cluster
    echo 3. Update MONGODB_URI in .env file
    echo.
    pause
    exit /b 1
)

echo ✅ MongoDB is installed

echo.
echo Checking MongoDB service status...
sc query MongoDB | find "RUNNING" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB service is not running
    echo 💡 Starting MongoDB service...
    net start MongoDB
    if %errorlevel% neq 0 (
        echo ❌ Failed to start MongoDB service
        echo 💡 Try running as Administrator or check Windows Services
        pause
        exit /b 1
    )
    echo ✅ MongoDB service started
) else (
    echo ✅ MongoDB service is already running
)

echo.
echo 🎉 MongoDB is ready!
echo 🚀 You can now run: npm run dev
echo.
pause