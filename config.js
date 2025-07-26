require('dotenv').config();

module.exports = {
  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || 'your-client-id-here',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret-here',
    redirectUri: process.env.NODE_ENV === 'production' 
      ? 'https://web-production-d1067.up.railway.app/auth/google/callback'
      : 'http://localhost:3001/auth/google/callback'
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-here'
  },
  
  // Database Configuration
  database: {
    // For Railway PostgreSQL
    url: process.env.DATABASE_URL,
    // For local development (fallback to SQLite if no DATABASE_URL)
    path: process.env.DB_PATH || './game_data.db',
    // PostgreSQL specific config
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }
}; 