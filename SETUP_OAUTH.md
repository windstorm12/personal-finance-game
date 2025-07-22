# 🚀 Quick Google OAuth Setup Guide

## **What You Need to Do:**

### 1. **Get Google OAuth Credentials**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project called "Personal Finance Game"
3. Enable "Google+ API" and "Google Identity" API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set:
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:3001/auth/google/callback`
6. **Copy your Client ID and Client Secret**

### 2. **Update Configuration**
Edit `config.js` and replace:
- `'your_google_client_id_here'` with your actual Google Client ID
- `'your_google_client_secret_here'` with your actual Google Client Secret

### 3. **Install Dependencies**
Run this command in your project folder:
```bash
npm install google-auth-library sqlite3 express-session dotenv
```

### 4. **Start the OAuth Server**
```bash
node server_oauth.js
```

### 5. **Start the Frontend**
```bash
cd client
npm run dev
```

### 6. **Test Google Sign-in**
1. Open `http://localhost:5173`
2. Click "Sign in with Google"
3. Complete the OAuth flow
4. Your progress will be automatically saved! 🎉

## **What You Get:**
- ✅ **Google Sign-in** - Secure authentication
- ✅ **Automatic Progress Saving** - Every action saves to database
- ✅ **Cross-Device Access** - Play from any device
- ✅ **User Profiles** - Names and pictures from Google
- ✅ **Persistent Data** - Never lose progress again

## **Troubleshooting:**
- **"Invalid Client ID"** - Double-check your Google Client ID in config.js
- **CORS Errors** - Make sure `http://localhost:5173` is in authorized origins
- **Database Errors** - The SQLite database will be created automatically

---

**🎮 Your Personal Finance Game now has Google OAuth progress saving!** 