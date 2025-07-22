const { OAuth2Client } = require('google-auth-library');
const config = require('./config');

console.log('=== Google OAuth Configuration Test ===');
console.log('Client ID:', config.google.clientId);
console.log('Client Secret:', config.google.clientSecret ? '***SET***' : '***NOT SET***');
console.log('Redirect URI:', config.google.redirectUri);

// Test OAuth client creation
try {
  const googleClient = new OAuth2Client(config.google.clientId);
  console.log('✅ OAuth client created successfully');
  
  // Test the client ID format
  if (config.google.clientId.includes('.apps.googleusercontent.com')) {
    console.log('✅ Client ID format looks correct');
  } else {
    console.log('❌ Client ID format may be incorrect');
  }
  
} catch (error) {
  console.log('❌ Error creating OAuth client:', error.message);
}

console.log('\n=== Troubleshooting Steps ===');
console.log('1. Go to Google Cloud Console → APIs & Services → OAuth consent screen');
console.log('2. Make sure the app is configured (not in testing mode)');
console.log('3. Add your email to test users if in testing mode');
console.log('4. Check that the OAuth 2.0 Client ID is enabled');
console.log('5. Verify Authorized JavaScript origins includes: http://localhost:5173');
console.log('6. Verify Authorized redirect URIs includes: http://localhost:3001/auth/google/callback'); 