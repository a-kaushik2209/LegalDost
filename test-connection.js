const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...\n');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log(`URI: ${process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected Successfully!');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    const testCollection = conn.connection.db.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('Test write operation successful');
    
    await testCollection.deleteOne({ test: 'connection' });
    console.log('Test delete operation successful');
    
    console.log('\nDatabase is ready for the application!');
    
    await mongoose.connection.close();
    console.log('Connection closed');
    
  } catch (error) {
    console.error('MongoDB connection failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('authentication failed')) {
      console.log('\nuthentication issue - check your credentials:');
      console.log('   1. Verify username and password in MongoDB Atlas');
      console.log('   2. Make sure password special characters are URL encoded');
      console.log('   3. Check if IP address is whitelisted (0.0.0.0/0 for development)');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\ Network issue - check your connection:');
      console.log('   1. Verify cluster URL is correct');
      console.log('   2. Check internet connection');
      console.log('   3. Try different network if behind firewall');
    }
    
    console.log('\n📖 For help, check: https://docs.mongodb.com/atlas/troubleshoot-connection/');
    process.exit(1);
  }
};

connectDB();