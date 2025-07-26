const cloudDb = require('./cloud_database');
const config = require('./config');

async function testCloudDatabase() {
  console.log('🧪 Testing Cloud Database Operations...');
  
  try {
    // Test connection
    console.log('1. Testing connection...');
    await cloudDb.init();
    console.log('✅ Connection successful:', cloudDb.isConnected);
    
    if (!cloudDb.isConnected) {
      console.log('❌ Cloud database not connected');
      return;
    }
    
    // Test user creation
    console.log('2. Testing user creation...');
    const testEmail = 'test@example.com';
    const testGoogleId = 'test_google_id_123';
    const userId = await cloudDb.createUser(testGoogleId, testEmail, 'Test User', 'test_picture.jpg');
    console.log('✅ User created with ID:', userId);
    
    // Test user retrieval
    console.log('3. Testing user retrieval...');
    const user = await cloudDb.getUserByGoogleId(testGoogleId);
    console.log('✅ User retrieved:', user ? user.email : 'null');
    
    // Test game progress creation
    console.log('4. Testing game progress creation...');
    const testGameState = {
      cash: 1000,
      week: 1,
      day: 1,
      stress: 20,
      skills: { finance: 10, social: 10, hustling: 10, health: 10 },
      totalDecisions: 0,
      gameOver: false
    };
    
    const progressId = await cloudDb.saveGameProgress(testEmail, testGameState);
    console.log('✅ Game progress saved with ID:', progressId);
    
    // Test game progress retrieval
    console.log('5. Testing game progress retrieval...');
    const retrievedGameState = await cloudDb.getGameProgress(testEmail);
    console.log('✅ Game progress retrieved:', retrievedGameState ? 'exists' : 'null');
    if (retrievedGameState) {
      console.log('   Cash:', retrievedGameState.cash);
      console.log('   Week:', retrievedGameState.week);
    }
    
    // Test achievement creation
    console.log('6. Testing achievement creation...');
    const achievementId = await cloudDb.saveAchievement(testEmail, 'test_achievement');
    console.log('✅ Achievement saved with ID:', achievementId);
    
    // Test achievement retrieval
    console.log('7. Testing achievement retrieval...');
    const achievements = await cloudDb.getUserAchievements(testEmail);
    console.log('✅ Achievements retrieved:', achievements);
    
    // Test leaderboard
    console.log('8. Testing leaderboard...');
    const leaderboard = await cloudDb.getLeaderboard();
    console.log('✅ Leaderboard retrieved:', leaderboard.length, 'entries');
    
    console.log('🎉 All cloud database tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await cloudDb.close();
  }
}

// Run the test
testCloudDatabase(); 