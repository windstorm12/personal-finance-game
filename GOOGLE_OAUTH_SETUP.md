# 🎮 Google OAuth Setup Guide for Personal Finance Game

## 🚀 **Overview**
This guide will help you implement Google OAuth authentication so users can save their progress with their Google accounts.

## 📋 **Prerequisites**
- Node.js installed
- Google Cloud Console account
- Basic understanding of OAuth 2.0

## 🔧 **Step 1: Google Cloud Console Setup**

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Personal Finance Game" and click "Create"

### 1.2 Enable Google+ API
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google Identity" API

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following:
   - **Name**: Personal Finance Game
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173` (for development)
     - `http://localhost:3000` (if using different port)
   - **Authorized redirect URIs**:
     - `http://localhost:3001/auth/google/callback`
5. Click "Create"
6. **Save your Client ID and Client Secret** - you'll need these!

## 📦 **Step 2: Install Dependencies**

Run these commands in your project directory:

```bash
npm install google-auth-library sqlite3 express-session dotenv
npm install --save-dev nodemon
```

## ⚙️ **Step 3: Configure Environment**

### 3.1 Create `.env` file
Create a `.env` file in your project root:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here

# Server Configuration
PORT=3001
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key-here

# Database Configuration
DB_PATH=./game_data.db
```

### 3.2 Update config.js
Replace the placeholder values in `config.js` with your actual Google credentials.

## 🗄️ **Step 4: Database Setup**

The database will be automatically created when you first run the server. It includes:

- **users** table: Stores Google account information
- **game_progress** table: Stores user game state
- **user_achievements** table: Stores unlocked achievements

## 🚀 **Step 5: Start the OAuth Server**

### 5.1 Copy Game Logic
You need to copy all the game logic functions from your existing `server.js` to `server_oauth.js`:

```javascript
// Copy these functions from your existing server.js:
function getInitialState() { /* ... */ }
function progressTime(state) { /* ... */ }
function applyChoiceEffects(state, choice) { /* ... */ }
function getNextScenario(state) { /* ... */ }
function checkAchievements(state) { /* ... */ }
const ACHIEVEMENTS = { /* ... */ };
function getAchievementProgress(achievement, state) { /* ... */ }
```

### 5.2 Start the Server
```bash
node server_oauth.js
```

## 🎨 **Step 6: Update Frontend**

### 6.1 Replace App.jsx
Replace your current `App.jsx` with `AppOAuth.jsx` or update it to include Google Sign-in.

### 6.2 Update Google Client ID
In `AppOAuth.jsx`, replace `'your_google_client_id_here'` with your actual Google Client ID.

### 6.3 Start Frontend
```bash
cd client
npm run dev
```

## 🔐 **Step 7: Test Authentication**

1. Open `http://localhost:5173` in your browser
2. Click "Sign in with Google"
3. Complete Google OAuth flow
4. Your progress should now be automatically saved!

## 📊 **Features You Get**

### ✅ **Automatic Progress Saving**
- Every action automatically saves to database
- No more lost progress when refreshing
- Cross-device access to your game

### ✅ **User Authentication**
- Secure Google OAuth login
- User profiles with names and pictures
- Session management

### ✅ **Leaderboard Integration**
- Real user leaderboards
- Achievement tracking
- Progress comparison

### ✅ **Database Storage**
- SQLite database for data persistence
- User management
- Game state storage

## 🛠️ **Troubleshooting**

### Common Issues:

1. **"Invalid Client ID" Error**
   - Double-check your Google Client ID in config.js
   - Ensure authorized origins include your frontend URL

2. **CORS Errors**
   - Make sure your frontend URL is in the authorized origins
   - Check that credentials are included in fetch requests

3. **Database Errors**
   - Ensure SQLite is installed
   - Check file permissions for database creation

4. **Session Issues**
   - Verify SESSION_SECRET is set in .env
   - Check that cookies are enabled

## 🔒 **Security Notes**

- Never commit your `.env` file to version control
- Use strong session secrets in production
- Consider using HTTPS in production
- Regularly rotate your Google OAuth credentials

## 🚀 **Production Deployment**

For production, you'll need to:

1. Set up a proper domain
2. Update Google OAuth redirect URIs
3. Use HTTPS
4. Set up a production database (PostgreSQL/MySQL)
5. Configure environment variables on your hosting platform

## 📞 **Support**

If you encounter issues:
1. Check the browser console for errors
2. Check the server logs for backend errors
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed

---

**🎉 Congratulations!** Your Personal Finance Game now has secure, persistent user authentication with Google OAuth! 