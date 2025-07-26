const fetch = require('node-fetch');

async function testMobileCompatibility() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('Testing mobile browser compatibility with token-based auth...\n');
  
  // Test 1: Check mobile debug endpoint
  console.log('1. Testing /debug/mobile endpoint:');
  try {
    const res = await fetch(`${baseUrl}/debug/mobile`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/96.0.4664.45 Mobile/15E148 Safari/604.1'
      }
    });
    console.log(`   Status: ${res.status}`);
    const data = await res.json();
    console.log(`   Mobile Detection:`, {
      isIOS: data.isIOS,
      isAndroid: data.isAndroid,
      isMobile: data.isMobile,
      isSafari: data.isSafari,
      isChrome: data.isChrome,
      isIOSSafari: data.isIOSSafari,
      isIOSChrome: data.isIOSChrome
    });
    console.log(`   Session:`, {
      hasSession: data.hasSession,
      sessionID: data.sessionID
    });
    console.log(`   Cookies:`, {
      present: data.cookies === 'present',
      count: data.cookieCount
    });
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('\n2. Testing session endpoint with mobile user agent:');
  try {
    const res = await fetch(`${baseUrl}/debug/session`, {
      credentials: 'include',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/96.0.4664.45 Mobile/15E148 Safari/604.1',
        'Cache-Control': 'no-cache'
      }
    });
    console.log(`   Status: ${res.status}`);
    const data = await res.json();
    console.log(`   Session Data:`, data);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('\n3. Testing display name endpoint with mobile user agent (should fail without auth):');
  try {
    const res = await fetch(`${baseUrl}/user/display-name`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/96.0.4664.45 Mobile/15E148 Safari/604.1',
        'Cache-Control': 'no-cache'
      },
      credentials: 'include',
      body: JSON.stringify({ display_name: 'TestUser' })
    });
    console.log(`   Status: ${res.status}`);
    const data = await res.json();
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('\n4. Testing display name endpoint with fake mobile token (should fail):');
  try {
    const res = await fetch(`${baseUrl}/user/display-name`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/96.0.4664.45 Mobile/15E148 Safari/604.1',
        'Cache-Control': 'no-cache',
        'x-mobile-token': 'fake-token-123'
      },
      credentials: 'include',
      body: JSON.stringify({ display_name: 'TestUser' })
    });
    console.log(`   Status: ${res.status}`);
    const data = await res.json();
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('\n5. Testing mobile fallback endpoint:');
  try {
    const res = await fetch(`${baseUrl}/auth/mobile-fallback`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/96.0.4664.45 Mobile/15E148 Safari/604.1',
        'Cache-Control': 'no-cache'
      },
      credentials: 'include',
      body: JSON.stringify({ 
        email: 'test@example.com',
        userId: 1
      })
    });
    console.log(`   Status: ${res.status}`);
    const data = await res.json();
    console.log(`   Response:`, data);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('\nTest completed. Check the server logs for mobile-specific handling.');
  console.log('\nNext steps:');
  console.log('1. Test on actual iPhone with Chrome/Safari');
  console.log('2. Check browser console for mobile token usage');
  console.log('3. Verify that display name can be set successfully');
}

testMobileCompatibility(); 