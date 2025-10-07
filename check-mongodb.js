const { exec } = require('child_process');
const os = require('os');

console.log('Checking MongoDB installation and status...\n');

function checkMongoInstallation() {
  return new Promise((resolve) => {
    exec('mongod --version', (error, stdout) => {
      if (error) {
        console.log('MongoDB is not installed');
        resolve(false);
      } else {
        console.log('MongoDB is installed');
        console.log(`   Version: ${stdout.split('\n')[0]}`);
        resolve(true);
      }
    });
  });
}

function checkMongoService() {
  return new Promise((resolve) => {
    const platform = os.platform();
    let command;
    
    switch (platform) {
      case 'win32':
        command = 'sc query MongoDB';
        break;
      case 'darwin':
        command = 'brew services list | grep mongodb';
        break;
      case 'linux':
        command = 'systemctl is-active mongod';
        break;
      default:
        command = 'ps aux | grep mongod';
    }
    
    exec(command, (error, stdout) => {
      if (error || !stdout.includes('running') && !stdout.includes('started') && !stdout.includes('active')) {
        console.log('MongoDB service is not running');
        resolve(false);
      } else {
        console.log('MongoDB service is running');
        resolve(true);
      }
    });
  });
}

function checkMongoConnection() {
  return new Promise((resolve) => {
    exec('mongosh --eval "db.runCommand({ping: 1})" --quiet', (error) => {
      if (error) {
        exec('mongo --eval "db.runCommand({ping: 1})" --quiet', (error2) => {
          if (error2) {
            console.log('Cannot connect to MongoDB');
            resolve(false);
          } else {
            console.log('✅ MongoDB connection successful');
            resolve(true);
          }
        });
      } else {
        console.log('MongoDB connection successful');
        resolve(true);
      }
    });
  });
}

function showInstallationInstructions() {
  const platform = os.platform();
  
  console.log('\nMongoDB Installation Instructions:\n');
  
  switch (platform) {
    case 'win32':
      console.log('Windows:');
      console.log('1. Download MongoDB Community Server from:');
      console.log('   https://www.mongodb.com/try/download/community');
      console.log('2. Run the MSI installer');
      console.log('3. Choose "Complete" installation');
      console.log('4. Install as Windows Service');
      console.log('5. Start service: net start MongoDB');
      break;
      
    case 'darwin':
      console.log('macOS (using Homebrew):');
      console.log('1. brew tap mongodb/brew');
      console.log('2. brew install mongodb-community');
      console.log('3. brew services start mongodb/brew/mongodb-community');
      break;
      
    case 'linux':
      console.log('Linux (Ubuntu/Debian):');
      console.log('1. wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -');
      console.log('2. echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list');
      console.log('3. sudo apt-get update');
      console.log('4. sudo apt-get install -y mongodb-org');
      console.log('5. sudo systemctl start mongod');
      break;
      
    default:
      console.log('Please visit https://docs.mongodb.com/manual/installation/ for installation instructions');
  }
  
  console.log('\nAlternative: Use MongoDB Atlas (Cloud)');
  console.log('1. Sign up at https://www.mongodb.com/atlas');
  console.log('2. Create a free cluster');
  console.log('3. Get connection string');
  console.log('4. Update MONGODB_URI in .env file');
}

async function main() {
  const isInstalled = await checkMongoInstallation();
  
  if (!isInstalled) {
    showInstallationInstructions();
    return;
  }
  
  const isServiceRunning = await checkMongoService();
  const canConnect = await checkMongoConnection();
  
  if (!isServiceRunning || !canConnect) {
    console.log('\nTry starting MongoDB:');
    const platform = os.platform();
    
    switch (platform) {
      case 'win32':
        console.log('   net start MongoDB');
        break;
      case 'darwin':
        console.log('   brew services start mongodb/brew/mongodb-community');
        break;
      case 'linux':
        console.log('   sudo systemctl start mongod');
        break;
    }
  }
  
  console.log('\nOnce MongoDB is running, start the app with: npm run dev');
}

main().catch(console.error);