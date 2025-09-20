#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting LegalDost...\n');

// Check MongoDB connection
function checkMongoDB() {
  return new Promise((resolve) => {
    exec('mongosh --eval "db.runCommand({ping: 1})" --quiet', (error) => {
      if (error) {
        // Try alternative mongo command
        exec('mongo --eval "db.runCommand({ping: 1})" --quiet', (error2) => {
          resolve(!error2);
        });
      } else {
        resolve(true);
      }
    });
  });
}

async function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');
  
  // Check MongoDB
  const mongoRunning = await checkMongoDB();
  if (!mongoRunning) {
    console.log('⚠️  MongoDB is not running or not installed');
    console.log('📖 Please check SETUP.md for MongoDB installation guide');
    console.log('💡 Quick fixes:');
    console.log('   - Windows: net start MongoDB');
    console.log('   - macOS: brew services start mongodb/brew/mongodb-community');
    console.log('   - Linux: sudo systemctl start mongod');
    console.log('   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas\n');
  } else {
    console.log('✅ MongoDB is running');
  }
  
  // Check .env file
  if (!fs.existsSync('.env')) {
    console.log('⚠️  .env file not found');
    console.log('💡 Please create .env file with your configuration');
    console.log('📖 Check .env.example or README.md for required variables\n');
  } else {
    console.log('✅ Environment file found');
  }
  
  return mongoRunning;
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  const install = spawn('npm', ['run', 'install-all'], { stdio: 'inherit' });
  
  install.on('close', async (code) => {
    if (code === 0) {
      await checkPrerequisites();
      startApp();
    } else {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  checkPrerequisites().then(() => {
    startApp();
  });
}

function startApp() {
  console.log('\n🔧 Starting development servers...');
  console.log('📊 Backend API: http://localhost:5000');
  console.log('🌐 Frontend App: http://localhost:3000');
  console.log('📝 The app will retry MongoDB connection automatically\n');
  
  const dev = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
  
  dev.on('close', (code) => {
    console.log(`\n👋 Application stopped with code ${code}`);
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    dev.kill('SIGINT');
    process.exit(0);
  });
}