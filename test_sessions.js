const fs = require('fs');
const path = require('path');

// Load sessions from file
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading sessions:', error);
  }
  return {};
}

// Test loading sessions
const sessions = loadSessions();
console.log('Total sessions loaded:', Object.keys(sessions).length);
console.log('All session IDs:', Object.keys(sessions));
console.log('Dummy profiles found:', Object.keys(sessions).filter(key => key.startsWith('dummy_player_')));

// Check dummy profile data
const dummyProfiles = Object.keys(sessions).filter(key => key.startsWith('dummy_player_'));
dummyProfiles.forEach(profileId => {
  const profile = sessions[profileId];
  console.log(`\n${profileId}:`);
  console.log(`  Cash: $${profile.cash}`);
  console.log(`  Net Worth: $${profile.cash + profile.investments.total}`);
  console.log(`  Passive Income: $${profile.passiveIncome.total}`);
  console.log(`  Total Decisions: ${profile.totalDecisions}`);
}); 