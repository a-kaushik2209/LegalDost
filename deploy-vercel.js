#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('⚡ LegalDost Vercel Deployment Script');
console.log('=====================================\n');

// Function to run commands
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Function to check if Vercel CLI is installed
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI is installed\n');
  } catch (error) {
    console.log('📦 Installing Vercel CLI...');
    runCommand('npm install -g vercel', 'Installing Vercel CLI');
  }
}

// Function to check environment variables
function checkEnvVars() {
  console.log('🔍 Checking environment variables...');
  
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'GEMINI_API_KEY'
  ];
  
  const envFile = '.env.local';
  let envContent = '';
  
  if (fs.existsSync(envFile)) {
    envContent = fs.readFileSync(envFile, 'utf8');
  } else if (fs.existsSync('.env')) {
    envContent = fs.readFileSync('.env', 'utf8');
  }
  
  const missing = [];
  requiredEnvVars.forEach(varName => {
    if (!envContent.includes(varName) && !process.env[varName]) {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    console.log('⚠️  Missing environment variables:');
    missing.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n📝 You\'ll need to set these in Vercel dashboard after deployment');
  } else {
    console.log('✅ Environment variables look good');
  }
  console.log('');
}

// Main deployment function
async function deployToVercel() {
  try {
    console.log('🚀 Starting Vercel deployment process...\n');
    
    // Step 1: Check Vercel CLI
    checkVercelCLI();
    
    // Step 2: Check environment variables
    checkEnvVars();
    
    // Step 3: Install dependencies
    runCommand('npm run install-all', 'Installing all dependencies');
    
    // Step 4: Fix build issues
    if (fs.existsSync('fix-build-issues.js')) {
      runCommand('node fix-build-issues.js', 'Fixing build issues');
    }
    
    // Step 5: Build the project
    runCommand('npm run build', 'Building the project');
    
    // Step 6: Deploy to Vercel
    console.log('🚀 Deploying to Vercel...');
    console.log('📝 Follow the prompts to configure your deployment\n');
    
    try {
      execSync('vercel --prod', { stdio: 'inherit' });
      console.log('\n🎉 Deployment completed successfully!');
    } catch (error) {
      console.log('\n📋 If this is your first deployment, run:');
      console.log('   vercel');
      console.log('   (Follow the setup prompts)');
      console.log('   Then run: vercel --prod');
    }
    
    console.log('\n📋 Next steps:');
    console.log('1. Set environment variables in Vercel dashboard');
    console.log('2. Test your live application');
    console.log('3. Configure custom domain (optional)');
    console.log('\n🔗 Vercel Dashboard: https://vercel.com/dashboard');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Check if user wants to set environment variables
function showEnvVarInstructions() {
  console.log('\n🔧 Environment Variables Setup:');
  console.log('================================');
  console.log('After deployment, set these in Vercel dashboard:');
  console.log('');
  console.log('MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/legaldost');
  console.log('JWT_SECRET = your_super_secure_jwt_secret_minimum_32_characters');
  console.log('GEMINI_API_KEY = your_gemini_api_key_here');
  console.log('NODE_ENV = production');
  console.log('CLIENT_URL = https://your-app-name.vercel.app');
  console.log('');
  console.log('📍 Go to: Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('');
}

// Run deployment
deployToVercel().then(() => {
  showEnvVarInstructions();
});