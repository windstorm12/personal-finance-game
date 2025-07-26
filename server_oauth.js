const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { OAuth2Client } = require('google-auth-library');
const config = require('./config');
const db = require('./database');
const fs = require('fs');
const path = require('path');
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

// Ensure uploads directory exists
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = process.env.PORT || config.server.port;

// CORS configuration
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://personal-finance-site-5cac.vercel.app',
  'https://personal-finance-site-5cac-lmkeffo9c-windstorms-projects.vercel.app',
  'https://web-production-d1067.up.railway.app',
  'https://web-production-d1067.up.railway.app/',
  'https://web-production-d1067.up.railway.app/auth',
  'https://web-production-d1067.up.railway.app/auth/google',
  'https://web-production-d1067.up.railway.app/auth/google/callback'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
      console.log('Origin not allowed:', origin);
      return callback(new Error('CORS not allowed'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Session configuration optimized for all iOS browsers
app.use(session({
  secret: config.server.sessionSecret,
  resave: true, // Changed to true for better mobile compatibility
  saveUninitialized: true, // Changed to true for better mobile compatibility
  proxy: true, // Required for Railway deployment
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Always use 'lax' for better mobile compatibility
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: process.env.NODE_ENV === 'production' ? '.railway.app' : undefined,
    httpOnly: false, // Changed to false for better mobile compatibility
    path: '/'
  },
  name: 'sid' // Use a shorter session name for mobile
}));

// Token-based authentication for mobile devices
const mobileTokens = new Map(); // In production, use Redis or database

// Generate mobile token
function generateMobileToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Enhanced session middleware for mobile compatibility
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /iPad|iPhone|iPod|Android/.test(userAgent);
  
  // For mobile devices, check for token-based authentication
  if (isMobile) {
    const mobileToken = req.headers['x-mobile-token'] || req.body.mobileToken;
    if (mobileToken && mobileTokens.has(mobileToken)) {
      const userData = mobileTokens.get(mobileToken);
      console.log('Mobile token authentication found:', userData.email);
      
      // Create session from token
      req.session.userId = userData.userId;
      req.session.email = userData.email;
      req.session.user = userData.user;
    }
  }
  
  next();
});

// Debug middleware to log session and auth status with mobile detection
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isMobile = isIOS || isAndroid;
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent);
  const isIOSSafari = isIOS && isSafari;
  const isIOSChrome = isIOS && isChrome;
  
  console.log('Request:', {
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
    sessionID: req.sessionID,
    hasSession: !!req.session,
    userId: req.session?.userId,
    cookies: req.headers.cookie ? 'present' : 'missing',
    userAgent: userAgent.substring(0, 100),
    isIOS,
    isAndroid,
    isMobile,
    isSafari,
    isChrome,
    isIOSSafari,
    isIOSChrome
  });
  
  // Add mobile-specific headers for better compatibility
  if (isMobile) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
});

app.use(express.json());

// Debug logging for auth routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    origin: req.headers.origin,
    session: req.session,
    cookies: req.cookies
  });
  next();
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, 'client', 'dist');
  app.use(express.static(clientBuildPath));
}

// Download endpoint for CSV files
app.get('/download-csv', (req, res) => {
  const filePath = path.join(__dirname, 'game_progress.csv');
  res.download(filePath, (err) => {
    if (err) {
      console.log('Download error:', err);
      res.status(404).send('File not found or error downloading.');
    }
  });
});

// Upload endpoint for CSV files
app.post('/upload-csv', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, 'game_progress.csv');
  fs.rename(tempPath, targetPath, (err) => {
    if (err) {
      console.error('Error saving uploaded file:', err);
      return res.status(500).send('Error saving file.');
    }
    res.send('File uploaded and saved as game_progress.csv');
  });
});

// HTML upload form for CSV
app.get('/upload-csv-form', (req, res) => {
  res.send(`
    <html>
      <body>
        <h2>Upload game_progress.csv</h2>
        <form action="/upload-csv" method="post" enctype="multipart/form-data">
          <input type="file" name="file" accept=".csv" required />
          <button type="submit">Upload</button>
        </form>
      </body>
    </html>
  `);
});

// Google OAuth client
const oauth2Client = new OAuth2Client(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri
);

// Fallback endpoint for mobile browsers when session fails
app.post('/auth/mobile-fallback', async (req, res) => {
  const { email, userId } = req.body;
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /iPad|iPhone|iPod|Android/.test(userAgent);
  
  console.log('Mobile fallback auth attempt:', { email, userId, isMobile });
  
  if (!isMobile) {
    return res.status(403).json({ error: 'This endpoint is only for mobile browsers' });
  }
  
  if (!email || !userId) {
    return res.status(400).json({ error: 'Email and userId are required' });
  }
  
  try {
    // Verify user exists
    const user = await db.getUserById(userId);
    if (!user || user.email !== email) {
      return res.status(401).json({ error: 'Invalid user credentials' });
    }
    
    // Create a temporary session
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.display_name || user.name,
      picture: user.picture,
      display_name: user.display_name || null
    };
    
    // Force session save
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('Mobile fallback session save error:', err);
          reject(err);
        } else {
          console.log('Mobile fallback session saved successfully');
          resolve();
        }
      });
    });
    
    res.json({ 
      success: true, 
      user: req.session.user,
      message: 'Mobile fallback authentication successful'
    });
    
  } catch (error) {
    console.error('Mobile fallback auth error:', error);
    res.status(500).json({ error: 'Mobile fallback authentication failed' });
  }
});

// Auth endpoints
app.post('/auth/google', async (req, res) => {
  try {
    console.log('Google auth request received:', {
      body: req.body,
      headers: req.headers,
      origin: req.headers.origin
    });
    
    const { token } = req.body;
    if (!token) {
      console.log('No token provided in request');
      return res.status(400).json({ error: 'Token is required' });
    }
    
    // Verify the token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: config.google.clientId
    });
    
    const payload = ticket.getPayload();
    console.log('Auth payload:', payload);

    // Look up or create user
    let user = await db.getUserByGoogleId(payload.sub);
    if (!user) {
      console.log('Creating new user for Google ID:', payload.sub);
      // Create new user
      const userId = await db.createUser(payload.sub, payload.email, payload.name, payload.picture);
      console.log('User created with ID:', userId);
      
      // Try to get the user by ID, fallback to Google ID if that fails
      try {
        user = await db.getUserById(userId);
        if (!user) {
          console.log('Failed to get user by ID, trying Google ID...');
          user = await db.getUserByGoogleId(payload.sub);
        }
      } catch (err) {
        console.error('Error getting user by ID:', err.message);
        user = await db.getUserByGoogleId(payload.sub);
      }
      
      if (!user) {
        throw new Error('Failed to create or retrieve user');
      }
    } else {
      console.log('Updating existing user:', user.email);
      // Update existing user
      await db.updateUser(payload.sub, payload.email, payload.name, payload.picture);
    }

    // Set session data
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.display_name || user.name,
      picture: user.picture,
      display_name: user.display_name || null
    };

    // Force session save for mobile browsers
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          reject(err);
        } else {
          console.log('Session saved successfully:', {
            sessionID: req.sessionID,
            userId: req.session.userId,
            email: req.session.email
          });
          resolve();
        }
      });
    });

    // Set additional headers for mobile browsers
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /iPad|iPhone|iPod|Android/.test(userAgent);
    
    if (isMobile) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // Generate mobile token for mobile devices
    let mobileToken = null;
    if (isMobile) {
      mobileToken = generateMobileToken();
      mobileTokens.set(mobileToken, {
        userId: user.id,
        email: user.email,
        user: req.session.user
      });
      console.log('Generated mobile token for user:', user.email);
    }

    res.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.display_name || user.name,
        email: user.email,
        picture: user.picture,
        display_name: user.display_name || null
      },
      mobileToken: mobileToken // Include token for mobile devices
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ error: 'Authentication failed', details: error.message });
  }
});

// Auth check middleware
const requireAuth = (req, res, next) => {
  console.log('Auth check:', {
    path: req.path,
    sessionID: req.sessionID,
    hasSession: !!req.session,
    sessionKeys: req.session ? Object.keys(req.session) : [],
    userId: req.session?.userId,
    email: req.session?.email,
    cookies: req.headers.cookie ? 'present' : 'missing',
    hasMobileToken: !!req.headers['x-mobile-token']
  });

  // Check if we have a valid session
  if (req.session && req.session.email && req.session.userId) {
    console.log('Authentication successful via session for user:', req.session.email);
    return next();
  }

  // Check if we have a valid mobile token
  const mobileToken = req.headers['x-mobile-token'];
  if (mobileToken && mobileTokens.has(mobileToken)) {
    const userData = mobileTokens.get(mobileToken);
    console.log('Authentication successful via mobile token for user:', userData.email);
    
    // Create session from token
    req.session.userId = userData.userId;
    req.session.email = userData.email;
    req.session.user = userData.user;
    
    return next();
  }

  // No valid authentication found
  console.log('No valid authentication found');
  return res.status(401).json({ error: 'Authentication required' });
};

// Mobile debug endpoint to check mobile browser compatibility
app.get('/debug/mobile', (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isMobile = isIOS || isAndroid;
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent);
  const isIOSSafari = isIOS && isSafari;
  const isIOSChrome = isIOS && isChrome;
  
  res.json({
    userAgent: userAgent.substring(0, 200),
    isIOS,
    isAndroid,
    isMobile,
    isSafari,
    isChrome,
    isIOSSafari,
    isIOSChrome,
    sessionID: req.sessionID,
    hasSession: !!req.session,
    sessionData: req.session ? {
      userId: req.session.userId,
      email: req.session.email,
      hasUser: !!req.session.user
    } : null,
    cookies: req.headers.cookie ? 'present' : 'missing',
    cookieCount: req.headers.cookie ? req.headers.cookie.split(';').length : 0,
    headers: {
      origin: req.headers.origin,
      referer: req.headers.referer,
      accept: req.headers.accept,
      'accept-language': req.headers['accept-language']
    }
  });
});

// Debug endpoint to check session status
app.get('/debug/session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    hasSession: !!req.session,
    sessionData: req.session ? {
      userId: req.session.userId,
      email: req.session.email,
      user: req.session.user ? {
        id: req.session.user.id,
        email: req.session.user.email,
        name: req.session.user.name,
        hasDisplayName: !!req.session.user.display_name,
        displayName: req.session.user.display_name
      } : null
    } : null,
    cookies: req.headers.cookie ? 'present' : 'missing',
    headers: {
      origin: req.headers.origin,
      referer: req.headers.referer,
      userAgent: req.headers['user-agent']
    }
  });
});

// Auth status endpoint
app.get('/auth/me', (req, res) => {
  if (!req.session || !req.session.email) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.user);
});

// Endpoint to set/update display_name
app.post('/user/display-name', requireAuth, async (req, res) => {
  console.log('Display name request:', {
    userId: req.session.userId,
    email: req.session.email,
    body: req.body,
    userAgent: req.headers['user-agent']?.substring(0, 100),
    hasMobileToken: !!req.headers['x-mobile-token']
  });

  const { display_name } = req.body;
  if (!display_name || typeof display_name !== 'string' || display_name.length < 2 || display_name.length > 32) {
    return res.status(400).json({ error: 'Display name must be 2-32 characters.' });
  }
  
  try {
    await db.setDisplayName(req.session.userId, display_name);
    console.log('Display name updated successfully for user:', req.session.email);
    
    // Update session
    req.session.user.name = display_name;
    req.session.user.display_name = display_name;
    
    // Update mobile token if it exists
    const mobileToken = req.headers['x-mobile-token'];
    if (mobileToken && mobileTokens.has(mobileToken)) {
      const tokenData = mobileTokens.get(mobileToken);
      tokenData.user.name = display_name;
      tokenData.user.display_name = display_name;
      mobileTokens.set(mobileToken, tokenData);
      console.log('Updated mobile token with new display name');
    }
    
    // Force session save for mobile browsers
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('Session save error after display name update:', err);
          reject(err);
        } else {
          console.log('Session saved successfully after display name update');
          resolve();
        }
      });
    });

    // Set additional headers for mobile browsers
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /iPad|iPhone|iPod|Android/.test(userAgent);
    
    if (isMobile) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    
    res.json({ success: true, display_name });
  } catch (err) {
    console.error('Display name update error:', err);
    res.status(500).json({ error: 'Failed to update display name.' });
  }
});

// Logout endpoint
app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

// Game endpoints (require authentication)
app.post('/start', requireAuth, async (req, res) => {
  try {
    let gameState = await db.getGameProgress(req.session.email);
    const user = await db.getUserById(req.session.userId);
    if (!gameState || gameState.gameOver) { // Always reset if gameOver
      gameState = getInitialState();
      const nextScenario = getNextScenario(gameState);
      gameState.currentScenario = nextScenario;
      await db.saveGameProgress(req.session.email, gameState);
    }
    // Sync to sessions.json
    if (user && user.email) syncGoogleUserToSessionsJson(user.email, gameState);
    res.json({
      state: gameState,
      scenario: gameState.currentScenario
    });
  } catch (error) {
    console.error('[START] Error:', error);
    res.status(500).json({ error: 'Failed to start game', details: error.message });
  }
});

app.get('/next-scenario', requireAuth, async (req, res) => {
  try {
    console.log('[NEXT-SCENARIO] User:', req.session.email);
    let gameState = await db.getGameProgress(req.session.email);
    console.log('[NEXT-SCENARIO] Loaded gameState:', JSON.stringify(gameState));
    const user = await db.getUserById(req.session.userId);
    if (!gameState) {
      console.error('[NEXT-SCENARIO] No game in progress for user:', req.session.email);
      return res.status(400).json({ error: 'No game in progress' });
    }
    const updatedState = progressTime(gameState);
    const nextScenario = getNextScenario(updatedState);
    updatedState.currentScenario = nextScenario;
    console.log('[NEXT-SCENARIO] Saving updatedState:', JSON.stringify(updatedState));
    await db.saveGameProgress(req.session.email, updatedState);
    // Sync to sessions.json
    if (user && user.email) syncGoogleUserToSessionsJson(user.email, updatedState);
    res.json({
      state: updatedState,
      scenario: nextScenario
    });
  } catch (error) {
    console.error('[NEXT-SCENARIO] Error:', error);
    res.status(500).json({ error: 'Failed to continue game', details: error.message });
  }
});

app.post('/choose-action', requireAuth, async (req, res) => {
  try {
    console.log('[CHOOSE-ACTION] User:', req.session.email, 'Body:', req.body);
    let gameState = await db.getGameProgress(req.session.email);
    console.log('[CHOOSE-ACTION] Loaded gameState:', JSON.stringify(gameState));
    const user = await db.getUserById(req.session.userId);
    if (!gameState) {
      console.error('[CHOOSE-ACTION] No game in progress for user:', req.session.email);
      return res.status(400).json({ error: 'No game in progress' });
    }
    if (!gameState.currentScenario) {
      console.error('[CHOOSE-ACTION] No current scenario for user:', req.session.email);
      return res.status(400).json({ error: 'No current scenario' });
    }
    const choice = gameState.currentScenario.choices.find(c => c.id === req.body.choiceId);
    if (!choice) {
      console.error('[CHOOSE-ACTION] Invalid choiceId:', req.body.choiceId, 'for user:', req.session.email);
      return res.status(400).json({ error: 'Invalid choice' });
    }
    const updatedState = applyChoiceEffects(gameState, choice);
    updatedState.completedScenarios.push(gameState.currentScenario.id);
    updatedState.scenarioHistory.push({
      scenario: gameState.currentScenario.title,
      choice: choice.text,
      day: gameState.day,
      week: gameState.week
    });
    updatedState.currentScenario = null;
    const { newAchievements, updatedState: achievementState } = checkAchievements(updatedState);
    for (const achievement of newAchievements) {
      await db.saveAchievement(req.session.email, achievement.id);
    }
    console.log('[CHOOSE-ACTION] Saving achievementState:', JSON.stringify(achievementState));
    await db.saveGameProgress(req.session.email, achievementState);
    // Sync to sessions.json
    if (user && user.email) syncGoogleUserToSessionsJson(user.email, achievementState);
    res.json({
      state: achievementState,
      choice: choice,
      message: `You chose: ${choice.text}`,
      newAchievements: newAchievements
    });
  } catch (error) {
    console.error('[CHOOSE-ACTION] Error:', error);
    res.status(500).json({ error: 'Failed to make choice', details: error.message });
  }
});

app.post('/train-skill', requireAuth, async (req, res) => {
  try {
    const { skill, timeSpent } = req.body;
    let gameState = await db.getGameProgress(req.session.email);
    
    if (!gameState) {
      return res.status(400).json({ error: 'No game in progress' });
    }
    
    const updatedState = { ...gameState };
    updatedState.skills[skill] = Math.min(100, updatedState.skills[skill] + (timeSpent * 5));
    updatedState.stress = Math.min(100, updatedState.stress + (timeSpent * 2));
    
    // Save progress
    await db.saveGameProgress(req.session.email, updatedState);
    
    res.json({
      state: updatedState,
      skillGained: timeSpent * 5
    });
  } catch (error) {
    console.error('Train skill error:', error);
    res.status(500).json({ error: 'Failed to train skill' });
  }
});

// Leaderboard
app.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await db.getLeaderboard();
    
    // Sort by net worth
    const sortedLeaderboard = leaderboard
      .sort((a, b) => b.netWorth - a.netWorth)
      .slice(0, 20) // Top 20
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
    
    res.json(sortedLeaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Achievements
app.get('/achievements', requireAuth, async (req, res) => {
  try {
    const userAchievements = await db.getUserAchievements(req.session.email);
    const gameState = await db.getGameProgress(req.session.email);
    
    if (!gameState) {
      return res.status(400).json({ error: 'No game in progress' });
    }
    
    const allAchievements = Object.values(ACHIEVEMENTS).map(achievement => ({
      ...achievement,
      unlocked: userAchievements.includes(achievement.id),
      progress: getAchievementProgress(achievement, gameState)
    }));
    
    res.json({
      unlocked: allAchievements.filter(a => a.unlocked),
      all: allAchievements,
      progress: gameState.achievements.progress,
      totalUnlocked: userAchievements.length,
      totalAchievements: Object.keys(ACHIEVEMENTS).length
    });
  } catch (error) {
    console.error('Achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

// Game logic functions
function getInitialState() {
  return {
    // Resources
    cash: 1000,
    stress: 0,
    day: 1,
    week: 1,
    
    // Skills (0-100)
    skills: {
      finance: 10,
      social: 10,
      hustling: 10,
      health: 10
    },
    
    // Inventory/Assets
    assets: ['Phone'],
    
    // Passive Income System
    passiveIncome: {
      investments: 0,
      rentalIncome: 0,
      dividends: 0,
      sideBusiness: 0,
      royalties: 0,
      total: 0
    },
    investments: {
      stocks: 0,
      bonds: 0,
      realEstate: 0,
      crypto: 0,
      total: 0
    },
    
    // Debt System
    debts: {
      creditCards: [],
      studentLoans: [],
      carLoans: [],
      personalLoans: [],
      medicalDebt: [],
      paydayLoans: []
    },
    creditScore: 0, // Start at 0
    totalDebt: 0,
    monthlyDebtPayments: 0,
    
    // Progress tracking
    completedScenarios: [],
    totalDecisions: 0,
    successfulDecisions: 0,
    
    // Achievement System
    achievements: {
      unlocked: [],
      progress: {
        totalEarnings: 0,
        debtFreeWeeks: 0,
        maxSkillLevel: 0,
        consecutiveGoodDecisions: 0,
        investmentValue: 0,
        stressFreeWeeks: 0,
        millionaireWeeks: 0,
        skillMasterWeeks: 0
      }
    },
    
    // Current state
    currentScenario: null,
    scenarioHistory: []
  };
}

// Add/Update investment return rates
const INVESTMENT_RETURN_RATES = {
  stocks: 0.10, // 10% annual
  bonds: 0.05,
  realEstate: 0.08,
  crypto: 0.15,
  business: 0.12,
  // add more as needed
};

function payDownDebt(state) {
  let cash = state.cash;
  if (!state.debts) return state;
  // Pay credit cards first
  for (const debtType of ['creditCards', 'studentLoans', 'carLoans', 'personalLoans', 'medicalDebt', 'paydayLoans']) {
    if (!state.debts[debtType]) continue;
    for (const debt of state.debts[debtType]) {
      if (debt.amount > 0 && cash > 0) {
        const payAmount = Math.min(debt.amount, cash);
        debt.amount -= payAmount;
        cash -= payAmount;
        if (debt.amount <= 0) debt.status = 'paid';
      }
    }
  }
  // Remove paid debts
  for (const debtType of Object.keys(state.debts)) {
    state.debts[debtType] = state.debts[debtType].filter(d => d.amount > 0);
  }
  // Update totalDebt and monthlyDebtPayments
  let totalDebt = 0, monthlyDebtPayments = 0;
  for (const type of Object.keys(state.debts)) {
    for (const d of state.debts[type]) {
      totalDebt += d.amount;
      monthlyDebtPayments += d.monthlyPayment || 0;
    }
  }
  state.totalDebt = totalDebt;
  state.monthlyDebtPayments = monthlyDebtPayments;
  state.cash = cash;
  return state;
}

function progressTime(state) {
  const newState = { ...state };
  newState.cash = typeof newState.cash === 'number' && isFinite(newState.cash) ? newState.cash : 0;
  newState.income = typeof newState.income === 'number' && isFinite(newState.income) ? newState.income : 0;
  // Add weekly income
  newState.cash += newState.income;
  // Add passive income from investments (daily)
  let passiveIncome = 0;
  if (newState.investments) {
    for (const [type, amount] of Object.entries(newState.investments)) {
      if (type === 'total' || !amount || amount <= 0) continue;
      const rate = INVESTMENT_RETURN_RATES[type] || 0;
      passiveIncome += amount * (rate / 365);
    }
  }
  passiveIncome = Math.round(passiveIncome);
  newState.cash += passiveIncome;
  if (!newState.passiveIncome) newState.passiveIncome = {};
  newState.passiveIncome.total = passiveIncome;
  // Auto-pay debt if any
  payDownDebt(newState);
  
  // Track high stress streak
  if (typeof newState.highStressStreak !== 'number') newState.highStressStreak = 0;
  if (newState.stress > 70) {
    newState.highStressStreak++;
  } else {
    newState.highStressStreak = 0;
  }

  // Stress impact on daily life
  if (newState.cash < 10000) {
    // Nerfed penalties for early game (scaled up)
    if (newState.stress > 90) {
      newState.cash = Math.max(0, newState.cash - 8); // Instead of -5
      // No job/income loss
    } else if (newState.stress > 80) {
      newState.cash = Math.max(0, newState.cash - 8); // Instead of -2
    } else if (newState.stress > 60) {
      newState.cash = Math.max(0, newState.cash - 4); // Instead of -1
    } else if (newState.stress > 40) {
      newState.cash = Math.max(0, newState.cash - 2); // Instead of -0.5
    }
  } else {
    // Full penalties for late game
    if (newState.stress > 90) {
      newState.cash = Math.max(0, newState.cash - 100);
      // No job/income loss
    } else if (newState.stress > 80) {
      newState.cash = Math.max(0, newState.cash - 50);
    } else if (newState.stress > 60) {
      newState.cash = Math.max(0, newState.cash - 20);
    } else if (newState.stress > 40) {
      newState.cash = Math.max(0, newState.cash - 10);
    }
  }

  // Long-term high stress penalty
  if (newState.highStressStreak > 14) {
    // Apply major penalty once per week of high stress
    if (!newState.lastHighStressPenaltyWeek || newState.lastHighStressPenaltyWeek !== newState.week) {
      newState.cash = Math.max(0, Math.floor(newState.cash * 0.8)); // Lose 20% of cash
      newState.totalDebt = Math.floor(newState.totalDebt * 1.05); // Increase debt by 5%
      newState.lastHighStressPenaltyWeek = newState.week;
    }
  }
  // Reduce natural stress decay
  const stressDecay = newState.skills.health > 30 ? 3 : 1;
  newState.stress = Math.max(0, newState.stress - stressDecay);
  
  // Progress day/week
  newState.day++;
  if (newState.day > 7) {
    newState.day = 1;
    newState.week++;
  }
  
  return newState;
}

function applyChoiceEffects(state, choice) {
  const newState = { ...state };

  // Track previous debt for credit score logic
  const prevDebt = newState.totalDebt || 0;
  const prevCash = newState.cash || 0;

  // Default cash effect to 0 if undefined
  const cashEffect = typeof choice.effects.cash === 'number' ? choice.effects.cash : 0;
  // Calculate new cash after choice
  const cashAfter = newState.cash + cashEffect;
  if (cashAfter >= 0) {
    newState.cash = cashAfter;
  } else {
    // Overspent: set cash to 0, add the difference as credit card debt
    const debtAmount = Math.abs(cashAfter);
    newState.cash = 0;
    // Only go bankrupt if totalDebt exceeds 1 million
    const maxTotalDebt = 1e6; // $1 million
    if ((newState.totalDebt || 0) + debtAmount <= maxTotalDebt) {
      const debt = {
        id: Date.now().toString(),
        amount: debtAmount,
        originalAmount: debtAmount,
        interestRate: 0.18,
        monthlyPayment: Math.round(debtAmount * 0.03),
        dueDate: (newState.week || 1) + 4,
        type: 'Credit Card',
        status: 'active'
      };
      if (!newState.debts) newState.debts = { creditCards: [], studentLoans: [], carLoans: [], personalLoans: [], medicalDebt: [], paydayLoans: [] };
      newState.debts.creditCards.push(debt);
      newState.totalDebt = (newState.totalDebt || 0) + debtAmount;
      newState.monthlyDebtPayments = (newState.monthlyDebtPayments || 0) + debt.monthlyPayment;
    } else {
      // Too much debt: set game over flag
      newState.gameOver = true;
      newState.gameOverReason = 'You have gone bankrupt! Your debt exceeded $1,000,000.';
      newState.totalDebt = maxTotalDebt;
      newState.monthlyDebtPayments = 0;
    }
  }

  // Clamp totalDebt and monthlyDebtPayments to valid ranges
  if (isNaN(newState.totalDebt) || !isFinite(newState.totalDebt) || newState.totalDebt < 0) newState.totalDebt = 0;
  if (isNaN(newState.monthlyDebtPayments) || !isFinite(newState.monthlyDebtPayments) || newState.monthlyDebtPayments < 0) newState.monthlyDebtPayments = 0;
  newState.totalDebt = Math.min(newState.totalDebt, 1e9);
  newState.monthlyDebtPayments = Math.min(newState.monthlyDebtPayments, 1e7);

  // Apply stress effects
  newState.stress = Math.max(0, Math.min(100, newState.stress + choice.effects.stress));

  // Apply skill effects
  if (choice.effects.skills) {
    Object.entries(choice.effects.skills).forEach(([skill, modifier]) => {
      newState.skills[skill] = Math.max(0, Math.min(100, newState.skills[skill] + modifier));
    });
  }

  // Apply income effect
  if (typeof choice.effects.income === 'number' && isFinite(choice.effects.income)) {
    newState.income = (typeof newState.income === 'number' && isFinite(newState.income) ? newState.income : 0) + choice.effects.income;
  }

  // Scale stress with debt (overwrite, not add)
  if ((newState.totalDebt || 0) > 0) {
    const debtStress = Math.min(100, Math.ceil((newState.totalDebt || 0) / 1000) * 10);
    newState.stress = Math.max(newState.stress, debtStress);
  }

  // --- CREDIT SCORE LOGIC ---
  let creditScore = typeof newState.creditScore === 'number' ? newState.creditScore : 0;
  // Debt change
  const debtDelta = (newState.totalDebt || 0) - prevDebt;
  if (debtDelta > 0) {
    // New debt: lose 10 points per $1000
    creditScore -= Math.ceil(debtDelta / 1000) * 10;
  } else if (debtDelta < 0) {
    // Paid debt: gain 10 points per $1000
    creditScore += Math.ceil(Math.abs(debtDelta) / 1000) * 10;
  }
  // Overspending (cash went negative): sharp penalty
  if (cashAfter < 0) {
    creditScore -= 20;
  }
  // Large cash gain: small bonus
  const cashDelta = (newState.cash || 0) - prevCash;
  if (cashDelta > 2000) {
    creditScore += 5;
  }
  // Clamp between 0 and 850
  creditScore = Math.max(0, Math.min(850, creditScore));
  newState.creditScore = creditScore;
  // --- END CREDIT SCORE LOGIC ---

  // Update decision count
  newState.totalDecisions++;
  if (cashEffect > 0 || choice.effects.stress < 0) {
    newState.successfulDecisions++;
  }

  // Handle investment
  let achievementCheckNeeded = false;
  if (choice.investment) {
    const { type, amount } = choice.investment;
    if (!newState.investments) newState.investments = {};
    newState.investments[type] = (newState.investments[type] || 0) + amount;
    achievementCheckNeeded = true;
  }
  // Handle selling investment
  if (choice.sellInvestment) {
    const { type, amount } = choice.sellInvestment;
    if (newState.investments && newState.investments[type]) {
      newState.investments[type] = Math.max(0, newState.investments[type] - amount);
      achievementCheckNeeded = true;
    }
  }

  // Check achievements immediately if needed
  if (achievementCheckNeeded) {
    const { newAchievements, updatedState } = checkAchievements(newState);
    if (newAchievements.length > 0) {
      console.log('[ACHIEVEMENT] Unlocked:', newAchievements.map(a => a.id), 'Investments:', newState.investments, 'PassiveIncome:', newState.passiveIncome);
    }
    // Always update unlocked array
    newState.achievements = updatedState.achievements;
  }
  // Auto-pay debt if any
  payDownDebt(newState);
  return newState;
}

// Scenario templates for dynamic generation
const scenarioTemplates = {
  finance: {
    events: [
      { name: 'Stock Market Opportunity', cost: 1000, time: 4, stress: 10, passiveType: 'stocks' },
      { name: 'Real Estate Investment', cost: 5000, time: 8, stress: 15, passiveType: 'realEstate' },
      { name: 'Crypto Investment', cost: 500, time: 2, stress: 20, passiveType: 'crypto' },
      { name: 'Bond Investment', cost: 2000, time: 3, stress: 5, passiveType: 'bonds' },
      { name: 'Medical Emergency', cost: 2000, time: 2, stress: 25, debtType: 'medical' },
      { name: 'Car Repair', cost: 800, time: 1, stress: 15, debtType: 'carLoan' },
      { name: 'Credit Card Debt', cost: 1500, time: 1, stress: 20, debtType: 'creditCard' }
    ],
    choices: [
      { effects: { cash: -1, stress: 5, time: -1, skills: { finance: 20 } } },
      { effects: { cash: -0.5, stress: 3, time: -0.5, skills: { finance: 10 } } },
      { effects: { cash: 0, stress: -5, time: 0, skills: { finance: 5 } } },
      { effects: { cash: 0, stress: 0, time: 0, skills: { finance: -5 } } }
    ]
  },
  hustling: {
    events: [
      { name: 'Freelance Opportunity', cost: 200, time: 6, stress: 10, jobType: 'freelance' },
      { name: 'Business Startup', cost: 3000, time: 12, stress: 25, jobType: 'entrepreneur' },
      { name: 'Side Gig', cost: 100, time: 4, stress: 5, jobType: 'skillup' },
      { name: 'Networking Event', cost: 150, time: 3, stress: 5, jobType: 'networking' },
      { name: 'Certification Course', cost: 800, time: 8, stress: 10, jobType: 'certification' },
      { name: 'Mentorship Program', cost: 500, time: 6, stress: 8, jobType: 'mentorship' }
    ],
    choices: [
      { effects: { cash: -1, stress: 8, time: -1, skills: { hustling: 25 } } },
      { effects: { cash: -0.6, stress: 5, time: -0.7, skills: { hustling: 15 } } },
      { effects: { cash: 0, stress: -3, time: 0, skills: { hustling: 5 } } },
      { effects: { cash: 0, stress: 0, time: 0, skills: { hustling: -5 } } }
    ]
  },
  social: {
    events: [
      { name: 'Wedding Invitation', cost: 300, time: 8, stress: 5 },
      { name: 'Birthday Party', cost: 100, time: 4, stress: -5 },
      { name: 'Professional Conference', cost: 400, time: 6, stress: 8 },
      { name: 'Charity Event', cost: 200, time: 3, stress: -10 },
      { name: 'Family Reunion', cost: 250, time: 10, stress: 10 },
      { name: 'Friend in Need', cost: 500, time: 2, stress: 15, debtType: 'personalLoan' }
    ],
    choices: [
      { effects: { cash: -1, stress: -5, time: -1, skills: { social: 20 } } },
      { effects: { cash: -0.5, stress: -2, time: -0.5, skills: { social: 10 } } },
      { effects: { cash: 0, stress: 5, time: 0, skills: { social: -5 } } },
      { effects: { cash: 0, stress: 0, time: 0, skills: { social: -10 } } }
    ]
  },
  health: {
    events: [
      { name: 'Gym Membership', cost: 80, time: 8, stress: -10 },
      { name: 'Medical Checkup', cost: 200, time: 2, stress: 5 },
      { name: 'Mental Health Session', cost: 150, time: 2, stress: -15 },
      { name: 'Healthy Food Shopping', cost: 120, time: 3, stress: -5 },
      { name: 'Fitness Equipment', cost: 400, time: 4, stress: -8 },
      { name: 'Medical Emergency', cost: 1500, time: 1, stress: 30, debtType: 'medical' }
    ],
    choices: [
      { effects: { cash: -1, stress: -10, time: -1, skills: { health: 25 } } },
      { effects: { cash: -0.6, stress: -5, time: -0.7, skills: { health: 15 } } },
      { effects: { cash: 0, stress: 5, time: 0, skills: { health: -5 } } },
      { effects: { cash: 0, stress: 0, time: 0, skills: { health: -10 } } }
    ]
  },
  income: {
    events: [
      { name: 'Take a Demanding Side Gig', incomeGain: 10, stress: 15, health: -5 },
      { name: 'Start a Weekend Freelance Job', incomeGain: 20, stress: 20, health: -10 },
      { name: 'Overtime at Main Job', incomeGain: 25, stress: 25, health: -15 },
      { name: 'Launch a Subscription Service', incomeGain: 30, stress: 30, health: -20 },
      { name: 'Become a Rideshare Driver', incomeGain: 15, stress: 10, health: -8 }
    ],
    choices: [
      // Full commitment
      { effects: { income: 1, stress: 5, time: -2, skills: { hustling: 5, health: -2 } } },
      // Moderate approach
      { effects: { income: 0.5, stress: 2, time: -1, skills: { hustling: 2, health: -1 } } },
      // Minimal effort
      { effects: { income: 0.2, stress: 1, time: 0, skills: { hustling: 1, health: 0 } } },
      // Skip
      { effects: { income: 0, stress: 0, time: 0, skills: { health: 1 } } }
    ]
  }
};

function generateScenario(state) {
  // Weighted category selection
  const categoryWeights = {
    income: 0.2,
    finance: 0.28,
    hustling: 0.28,
    social: 0.12,
    health: 0.12
  };
  const random = Math.random();
  let category;
  if (random < categoryWeights.income) {
    category = 'income';
  } else if (random < categoryWeights.income + categoryWeights.finance) {
    category = 'finance';
  } else if (random < categoryWeights.income + categoryWeights.finance + categoryWeights.hustling) {
    category = 'hustling';
  } else if (random < categoryWeights.income + categoryWeights.finance + categoryWeights.hustling + categoryWeights.social) {
    category = 'social';
  } else {
    category = 'health';
  }
  const template = scenarioTemplates[category];
  let event;
  if (category === 'income') {
    event = template.events[Math.floor(Math.random() * template.events.length)];
    // Choices for income scenario
    let choices = [
      {
        id: `income_full_commitment_${Date.now()}`,
        text: `Go all in: +$${event.incomeGain}/week, +${event.stress} stress, -${Math.abs(event.health)} health`,
        effects: { income: event.incomeGain, stress: event.stress, time: -2, skills: { health: event.health } },
        description: 'Maximize your weekly income, but at a cost.'
      },
      {
        id: `income_moderate_${Date.now()}`,
        text: `Moderate effort: +$${Math.round(event.incomeGain/2)}/week, +${Math.round(event.stress/2)} stress, -${Math.round(Math.abs(event.health)/2)} health`,
        effects: { income: Math.round(event.incomeGain/2), stress: Math.round(event.stress/2), time: -1, skills: { health: Math.round(event.health/2) } },
        description: 'Balance income and well-being.'
      },
      {
        id: `income_minimal_${Date.now()}`,
        text: `Minimal effort: +$${Math.round(event.incomeGain/4)}/week, +${Math.round(event.stress/4)} stress, -${Math.round(Math.abs(event.health)/4)} health`,
        effects: { income: Math.round(event.incomeGain/4), stress: Math.round(event.stress/4), time: 0, skills: { health: Math.round(event.health/4) } },
        description: 'A small boost with little risk.'
      },
      {
        id: `income_skip_${Date.now()}`,
        text: 'Skip this opportunity',
        effects: { income: 0, stress: 0, time: 0, skills: { health: 1 } },
        description: 'Protect your health and stress.'
      }
    ];
    // Clamp max income gain per scenario to $100/week
    choices = choices.map(choice => {
      if (choice.effects.income > 100) choice.effects.income = 100;
      return choice;
    });
    return {
      id: `generated_income_${Date.now()}`,
      title: event.name,
      description: `You encounter an income opportunity: ${event.name}.`,
      category: 'income',
      timeCost: 0,
      baseCost: 0,
      choices
    };
  }
  event = template.events[Math.floor(Math.random() * template.events.length)];
  
  // Generate choices based on event type
  let choices = [];
  
  if (event.debtType) {
    // Debt scenarios have 4 choices
    choices = [
      {
        id: `${category}_pay_full_0`,
        text: 'Pay in full',
        effects: { cash: -event.cost, stress: -5, time: 1, skills: { finance: 15 } },
        description: 'Pay the full amount immediately'
      },
      {
        id: `${category}_pay_minimum_1`,
        text: 'Pay minimum payment',
        effects: { cash: -Math.round(event.cost * 0.1), stress: 10, time: 0, skills: { finance: 5 } },
        description: 'Pay the minimum to avoid penalties'
      },
      {
        id: `${category}_take_debt_2`,
        text: 'Take on debt',
        effects: { cash: 0, stress: 20, time: 1, skills: { finance: -5 } },
        description: 'Borrow money to cover the cost'
      },
      {
        id: `${category}_negotiate_3`,
        text: 'Negotiate payment plan',
        effects: { cash: -Math.round(event.cost * 0.3), stress: 5, time: 2, skills: { finance: 20, social: 10 } },
        description: 'Work out a payment arrangement'
      }
    ];
  } else if (event.passiveType) {
    // Investment scenarios have 4 choices
    const weeklyReturn = Math.round(event.cost * 0.08 / 52);
    choices = [
      {
        id: `${category}_invest_full_0`,
        text: 'Invest fully',
        effects: { cash: -event.cost, stress: 5, time: event.time, skills: { finance: 20 } },
        description: `Invest ${event.cost} for ${weeklyReturn} weekly passive income`
      },
      {
        id: `${category}_invest_partial_1`,
        text: 'Invest partially',
        effects: { cash: -Math.round(event.cost * 0.5), stress: 3, time: Math.round(event.time * 0.5), skills: { finance: 10 } },
        description: `Invest ${Math.round(event.cost * 0.5)} for ${Math.round(weeklyReturn * 0.5)} weekly passive income`
      },
      {
        id: `${category}_research_first_2`,
        text: 'Research first',
        effects: { cash: 0, stress: -5, time: 2, skills: { finance: 15 } },
        description: 'Learn more before investing'
      },
      {
        id: `${category}_skip_opportunity_3`,
        text: 'Skip opportunity',
        effects: { cash: 0, stress: 0, time: 0, skills: { finance: -5 } },
        description: 'Pass on this investment opportunity'
      }
    ];
  } else if (event.jobType) {
    // Job scenarios have 3 choices
    choices = [
      {
        id: `${category}_pursue_opportunity_0`,
        text: 'Pursue opportunity',
        effects: { cash: -event.cost, stress: event.stress, time: event.time, skills: { hustling: 20 } },
        description: 'Gain job experience and potential income'
      },
      {
        id: `${category}_part_time_1`,
        text: 'Part-time approach',
        effects: { cash: -Math.round(event.cost * 0.5), stress: Math.round(event.stress * 0.7), time: Math.round(event.time * 0.7), skills: { hustling: 15 } },
        description: 'Gain experience with less commitment'
      },
      {
        id: `${category}_decline_2`,
        text: 'Decline for now',
        effects: { cash: 0, stress: -5, time: 0, skills: { hustling: -5 } },
        description: 'Focus on current responsibilities'
      }
    ];
  } else {
    // Regular scenarios have 4 choices
    choices = template.choices.map((choice, index) => {
      const cashEffect = Math.round(event.cost * choice.effects.cash);
      const timeEffect = Math.round(event.time * choice.effects.time);
      const stressEffect = choice.effects.stress + (event.stress || 0);
      const skillEffects = { ...choice.effects.skills };
      
      return {
        id: `${category}_choice_${index}`,
        text: index === 0 ? 'Full commitment' : index === 1 ? 'Moderate approach' : index === 2 ? 'Minimal effort' : 'Skip entirely',
        effects: { cash: cashEffect, stress: stressEffect, time: timeEffect, skills: skillEffects },
        description: index === 0 ? 'Go all in' : index === 1 ? 'Take a balanced approach' : index === 2 ? 'Do the minimum' : 'Avoid this situation'
      };
    });
  }
  
  // Add investment opportunities randomly
  const investmentTypes = ['stocks', 'bonds', 'realEstate', 'crypto'];
  if (Math.random() < 0.3) { // 30% chance to add an investment opportunity
    const type = investmentTypes[Math.floor(Math.random() * investmentTypes.length)];
    const investAmount = [500, 1000, 2000, 5000, 10000][Math.floor(Math.random() * 5)];
    const rate = INVESTMENT_RETURN_RATES[type];
    choices.push({
      id: `invest_${type}_${Date.now()}`,
      text: `Invest $${investAmount} in ${type.charAt(0).toUpperCase() + type.slice(1)} (${Math.round(rate*100)}%/yr)` ,
      effects: { cash: -investAmount, stress: 2, time: 0, skills: { finance: 2 } },
      description: `Add $${investAmount} to your ${type} investments.`,
      investment: { type, amount: investAmount }
    });
    // Add sell option if player has investment
    if (state.investments && state.investments[type] && state.investments[type] > 0 && Math.random() < 0.5) {
      const sellAmount = Math.min(state.investments[type], investAmount);
      choices.push({
        id: `sell_${type}_${Date.now()}`,
        text: `Sell $${sellAmount} of your ${type} investment`,
        effects: { cash: sellAmount, stress: -1, time: 0, skills: { finance: 1 } },
        description: `Sell part of your ${type} investment for cash.`,
        sellInvestment: { type, amount: sellAmount }
      });
    }
  }
  
  // Add skill effects to every choice
  choices = choices.map((choice, index) => {
    // If the choice already has a skills effect, keep it, else add one
    let skillEffects = { ...choice.effects.skills };
    // Determine main skill for this scenario
    let mainSkill = 'finance';
    if (category === 'social') mainSkill = 'social';
    if (category === 'hustling') mainSkill = 'hustling';
    if (category === 'health') mainSkill = 'health';
    // Add or boost main skill effect
    if (!skillEffects[mainSkill]) {
      // Randomize skill gain/loss based on choice index/type
      if (choice.effects.cash < 0) {
        skillEffects[mainSkill] = 5 + Math.floor(Math.random() * 6); // +5 to +10 for positive effort
      } else if (choice.effects.cash > 0) {
        skillEffects[mainSkill] = -1 * (1 + Math.floor(Math.random() * 5)); // -1 to -5 for negative/greedy
      } else {
        skillEffects[mainSkill] = 2 + Math.floor(Math.random() * 4); // +2 to +5 for neutral
      }
    }
    // Occasionally add a secondary skill effect
    if (Math.random() < 0.2) {
      const secondary = ['finance','social','hustling','health'].filter(s => s !== mainSkill)[Math.floor(Math.random()*3)];
      skillEffects[secondary] = (Math.random() < 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3));
    }
    return {
      ...choice,
      effects: {
        ...choice.effects,
        skills: skillEffects
      }
    };
  });
  
  // For hustling and finance categories, ensure at least one choice gives money
  if (category === 'hustling' || category === 'finance') {
    let positiveChoiceIndex = 0;
    // Find or create a positive cash choice
    let foundPositive = false;
    for (let i = 0; i < choices.length; i++) {
      if (choices[i].effects && choices[i].effects.cash > 0) {
        foundPositive = true;
        break;
      }
    }
    if (!foundPositive) {
      // Nerfed gain and added drawbacks
      const gain = 100 + Math.floor(Math.random() * 201); // $100-$300
      const stressPenalty = 20 + Math.floor(Math.random() * 21); // 20-40
      const healthPenalty = -5 - Math.floor(Math.random() * 11); // -5 to -15
      const timePenalty = -2 - Math.floor(Math.random() * 3); // -2 to -4
      choices[positiveChoiceIndex] = {
        ...choices[positiveChoiceIndex],
        text: category === 'hustling' ? 'Take a lucrative gig (but it burns you out)' : 'Profit from a smart trade (but it takes a toll)',
        effects: {
          ...choices[positiveChoiceIndex].effects,
          cash: gain,
          stress: (choices[positiveChoiceIndex].effects.stress || 0) + stressPenalty,
          time: (choices[positiveChoiceIndex].effects.time || 0) + timePenalty,
          skills: {
            ...(choices[positiveChoiceIndex].effects.skills || {}),
            health: (choices[positiveChoiceIndex].effects.skills?.health || 0) + healthPenalty
          }
        },
        description: category === 'hustling'
          ? `You earn $${gain} from a side hustle or gig, but gain ${stressPenalty} stress, lose ${Math.abs(healthPenalty)} health, and lose ${Math.abs(timePenalty)} hours.`
          : `You make $${gain} from a financial move, but gain ${stressPenalty} stress, lose ${Math.abs(healthPenalty)} health, and lose ${Math.abs(timePenalty)} hours.`
      };
    }
  }
  return {
    id: `generated_${category}_${Date.now()}`,
    title: event.name,
    description: `You encounter a ${event.name.toLowerCase()} situation.`,
    category: category,
    timeCost: event.time,
    baseCost: event.cost,
    choices: choices
  };
}

function getNextScenario(state) {
  // Generate a new scenario dynamically
  let scenario = generateScenario(state);
  
  // Ensure the scenario has at least one affordable choice
  let attempts = 0;
  while (attempts < 10) {
    const affordableChoices = scenario.choices.filter(choice => 
      state.cash + (choice.effects.cash || 0) >= 0
    );
    
    if (affordableChoices.length > 0) {
      break;
    }
    
    scenario = generateScenario(state);
    attempts++;
  }
  
  // If still no affordable choices, adjust the scenario
  if (scenario.choices.every(choice => state.cash + (choice.effects.cash || 0) < 0)) {
    scenario.choices[0].effects.cash = Math.min(0, state.cash);
  }
  
  return scenario;
}

function checkAchievements(state) {
  const newAchievements = [];
  const updatedState = { ...state };
  // Simple achievement checks
  if (state.cash >= 10000 && !state.achievements.unlocked.includes('rich')) {
    newAchievements.push(ACHIEVEMENTS.rich);
    updatedState.achievements.unlocked.push('rich');
  }
  if (state.skills.finance >= 50 && !state.achievements.unlocked.includes('finance_expert')) {
    newAchievements.push(ACHIEVEMENTS.finance_expert);
    updatedState.achievements.unlocked.push('finance_expert');
  }
  // First Investment
  if (!state.achievements.unlocked.includes('first_investment')) {
    const inv = state.investments || {};
    if (Object.values(inv).some(v => v > 0)) {
      newAchievements.push(ACHIEVEMENTS.first_investment);
      updatedState.achievements.unlocked.push('first_investment');
    }
  }
  // Diverse Portfolio
  if (!state.achievements.unlocked.includes('diverse_portfolio')) {
    const inv = state.investments || {};
    if (Object.values(inv).filter(v => v > 0).length >= 3) {
      newAchievements.push(ACHIEVEMENTS.diverse_portfolio);
      updatedState.achievements.unlocked.push('diverse_portfolio');
    }
  }
  // Debt Destroyer
  if (!state.achievements.unlocked.includes('debt_destroyer')) {
    if ((state.achievements.progress?.debtPaid || 0) >= 10000) {
      newAchievements.push(ACHIEVEMENTS.debt_destroyer);
      updatedState.achievements.unlocked.push('debt_destroyer');
    }
  }
  // Passive Pro
  if (!state.achievements.unlocked.includes('passive_pro')) {
    if ((state.passiveIncome?.total || 0) >= 500) {
      newAchievements.push(ACHIEVEMENTS.passive_pro);
      updatedState.achievements.unlocked.push('passive_pro');
    }
  }
  // Millionaire
  if (!state.achievements.unlocked.includes('millionaire')) {
    if (state.cash >= 1000000) {
      newAchievements.push(ACHIEVEMENTS.millionaire);
      updatedState.achievements.unlocked.push('millionaire');
    }
  }
  // Finance Guru
  if (!state.achievements.unlocked.includes('finance_guru')) {
    if (state.skills.finance >= 100) {
      newAchievements.push(ACHIEVEMENTS.finance_guru);
      updatedState.achievements.unlocked.push('finance_guru');
    }
  }
  // Social Butterfly
  if (!state.achievements.unlocked.includes('social_butterfly')) {
    if (state.skills.social >= 100) {
      newAchievements.push(ACHIEVEMENTS.social_butterfly);
      updatedState.achievements.unlocked.push('social_butterfly');
    }
  }
  // Hustle King
  if (!state.achievements.unlocked.includes('hustle_king')) {
    if (state.skills.hustling >= 100) {
      newAchievements.push(ACHIEVEMENTS.hustle_king);
      updatedState.achievements.unlocked.push('hustle_king');
    }
  }
  // Health Nut
  if (!state.achievements.unlocked.includes('health_nut')) {
    if (state.skills.health >= 100) {
      newAchievements.push(ACHIEVEMENTS.health_nut);
      updatedState.achievements.unlocked.push('health_nut');
    }
  }
  // Balanced Life
  if (!state.achievements.unlocked.includes('balanced_life')) {
    if (state.skills.finance >= 80 && state.skills.social >= 80 && state.skills.hustling >= 80 && state.skills.health >= 80) {
      newAchievements.push(ACHIEVEMENTS.balanced_life);
      updatedState.achievements.unlocked.push('balanced_life');
    }
  }
  // Stress-Free
  if (!state.achievements.unlocked.includes('stress_free')) {
    if ((state.achievements.progress?.stressFreeDays || 0) >= 10) {
      newAchievements.push(ACHIEVEMENTS.stress_free);
      updatedState.achievements.unlocked.push('stress_free');
    }
  }
  // Comeback Kid
  if (!state.achievements.unlocked.includes('comeback_kid')) {
    if ((state.achievements.progress?.wasBankrupt && state.cash > 0)) {
      newAchievements.push(ACHIEVEMENTS.comeback_kid);
      updatedState.achievements.unlocked.push('comeback_kid');
    }
  }
  // Investor
  if (!state.achievements.unlocked.includes('investor')) {
    if ((state.achievements.progress?.investmentCount || 0) >= 10) {
      newAchievements.push(ACHIEVEMENTS.investor);
      updatedState.achievements.unlocked.push('investor');
    }
  }
  // Jack of All Trades
  if (!state.achievements.unlocked.includes('jack_of_all_trades')) {
    if (state.skills.finance >= 50 && state.skills.social >= 50 && state.skills.hustling >= 50 && state.skills.health >= 50) {
      newAchievements.push(ACHIEVEMENTS.jack_of_all_trades);
      updatedState.achievements.unlocked.push('jack_of_all_trades');
    }
  }
  return { newAchievements, updatedState };
}

function syncGoogleUserToSessionsJson(email, gameState) {
  let sessions = {};
  if (fs.existsSync(SESSIONS_FILE)) {
    try {
      sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    } catch (e) {
      sessions = {};
    }
  }
  sessions[email] = gameState;
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

const ACHIEVEMENTS = {
  rich: {
    id: 'rich',
    title: 'Getting Rich',
    description: 'Reach $10,000 in cash',
    rarity: 'common'
  },
  finance_expert: {
    id: 'finance_expert',
    title: 'Finance Expert',
    description: 'Reach 50 in Finance skill',
    rarity: 'uncommon'
  },
  first_investment: {
    id: 'first_investment',
    title: 'First Investment',
    description: 'Make your first investment',
    rarity: 'common'
  },
  diverse_portfolio: {
    id: 'diverse_portfolio',
    title: 'Diverse Portfolio',
    description: 'Invest in at least 3 different asset types',
    rarity: 'uncommon'
  },
  debt_destroyer: {
    id: 'debt_destroyer',
    title: 'Debt Destroyer',
    description: 'Pay off $10,000 in total debt',
    rarity: 'rare'
  },
  passive_pro: {
    id: 'passive_pro',
    title: 'Passive Pro',
    description: 'Earn $500/day in passive income',
    rarity: 'epic'
  },
  millionaire: {
    id: 'millionaire',
    title: 'Millionaire',
    description: 'Reach $1,000,000 in cash',
    rarity: 'epic'
  },
  finance_guru: {
    id: 'finance_guru',
    title: 'Finance Guru',
    description: 'Reach 100 Finance skill',
    rarity: 'epic'
  },
  social_butterfly: {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Reach 100 Social skill',
    rarity: 'epic'
  },
  hustle_king: {
    id: 'hustle_king',
    title: 'Hustle King',
    description: 'Reach 100 Hustling skill',
    rarity: 'epic'
  },
  health_nut: {
    id: 'health_nut',
    title: 'Health Nut',
    description: 'Reach 100 Health skill',
    rarity: 'epic'
  },
  balanced_life: {
    id: 'balanced_life',
    title: 'Balanced Life',
    description: 'All skills above 80',
    rarity: 'legendary'
  },
  stress_free: {
    id: 'stress_free',
    title: 'Stress-Free',
    description: 'Keep stress below 20 for 10 consecutive days',
    rarity: 'rare'
  },
  comeback_kid: {
    id: 'comeback_kid',
    title: 'Comeback Kid',
    description: 'Recover from bankruptcy to positive net worth',
    rarity: 'epic'
  },
  investor: {
    id: 'investor',
    title: 'Investor',
    description: 'Make 10 separate investments',
    rarity: 'uncommon'
  },
  jack_of_all_trades: {
    id: 'jack_of_all_trades',
    title: 'Jack of All Trades',
    description: 'Reach at least 50 in every skill',
    rarity: 'legendary'
  }
};

function getAchievementProgress(achievement, state) {
  switch (achievement.id) {
    case 'rich':
      return { current: state.cash, target: 10000 };
    case 'finance_expert':
      return { current: state.skills.finance, target: 50 };
    default:
      return { current: 0, target: 1 };
  }
}

// Database backup and restore endpoints (admin only)
app.post('/admin/backup', requireAuth, async (req, res) => {
  try {
    // Check if user is admin (you can modify this logic)
    if (req.session.email !== 'your-admin-email@example.com') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const RailwayDeploy = require('./railway_deploy');
    const railway = new RailwayDeploy();
    
    await railway.backupToPersistent();
    await railway.exportToCSV();
    
    res.json({ message: 'Backup completed successfully' });
  } catch (err) {
    console.error('Backup failed:', err);
    res.status(500).json({ error: 'Backup failed' });
  }
});

app.post('/admin/restore', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.session.email !== 'your-admin-email@example.com') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const RailwayDeploy = require('./railway_deploy');
    const railway = new RailwayDeploy();
    
    await railway.setupPersistentStorage();
    
    res.json({ message: 'Restore completed successfully' });
  } catch (err) {
    console.error('Restore failed:', err);
    res.status(500).json({ error: 'Restore failed' });
  }
});

app.get('/admin/status', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.session.email !== 'your-admin-email@example.com') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const fs = require('fs');
    const path = require('path');
    const RailwayDeploy = require('./railway_deploy');
    const railway = new RailwayDeploy();
    
    const status = {
      localDbExists: fs.existsSync(config.database.path),
      persistentDbExists: fs.existsSync(railway.persistentDbPath),
      backupExists: fs.existsSync(railway.persistentBackupPath),
      localDbSize: fs.existsSync(config.database.path) ? fs.statSync(config.database.path).size : 0,
      persistentDbSize: fs.existsSync(railway.persistentDbPath) ? fs.statSync(railway.persistentDbPath).size : 0
    };
    
    res.json(status);
  } catch (err) {
    console.error('Status check failed:', err);
    res.status(500).json({ error: 'Status check failed' });
  }
});

// Health check endpoint for database status
app.get('/health', async (req, res) => {
  try {
    let health;
    if (db.cloudDb && db.cloudDb.isConnected) {
      health = await db.cloudDb.healthCheck();
      health.message = 'PostgreSQL cloud database connected and syncing';
    } else {
      health = { 
        status: 'local', 
        message: 'Using local SQLite database (PostgreSQL not configured)' 
      };
    }
    
    res.json({
      status: 'ok',
      database: health,
      useCloud: db.useCloud,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: { status: 'error', message: err.message },
      timestamp: new Date().toISOString()
    });
  }
});

// Database sync status endpoint
app.get('/admin/sync-status', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.session.email !== 'your-admin-email@example.com') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const status = {
      useCloud: db.useCloud,
      cloudConnected: db.cloudDb && db.cloudDb.isConnected,
      localDbExists: db.localDb !== null,
      timestamp: new Date().toISOString()
    };
    
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: 'Sync status check failed' });
  }
});

// Manual database reconnection endpoint
app.post('/admin/reconnect-db', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.session.email !== 'your-admin-email@example.com') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    console.log('🔄 Manual database reconnection requested...');
    
    // Force reinitialize database
    await db.initializeDatabase();
    
    const status = {
      useCloud: db.useCloud,
      cloudConnected: db.cloudDb && db.cloudDb.isConnected,
      message: 'Database reconnection completed',
      timestamp: new Date().toISOString()
    };
    
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: 'Database reconnection failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`Allowed Origins:`, ALLOWED_ORIGINS);
}); 