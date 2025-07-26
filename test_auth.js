const fetch = require('node-fetch');

async function testAuth() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('Testing authentication endpoints...\n');
  
  // Test 1: Check auth status without session
  console.log('1. Testing /auth/me without session:');
  try {
    const res = await fetch(`${baseUrl}/auth/me`, {
      credentials: 'include'
    });
    console.log(`   Status: ${res.status}`);
    const data = await res.json();
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('\n2. Testing /user/display-name without session:');
  try {
    const res = await fetch(`${baseUrl}/user/display-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ display_name: 'TestUser' })
    });
    console.log(`   Status: ${res.status}`);
    const data = await res.json();
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('\nTest completed. Check the server logs for more details.');
}

testAuth(); 