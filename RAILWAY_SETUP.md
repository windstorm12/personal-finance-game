# Railway PostgreSQL Setup Guide

## 1. Install Dependencies

First, install the new PostgreSQL dependencies:

```bash
npm install
```

## 2. Set up PostgreSQL Database in Railway

1. Go to your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Wait for the database to be provisioned
4. Click on the PostgreSQL database
5. Go to "Connect" tab
6. Copy the "Postgres Connection URL"

## 3. Set Environment Variables in Railway

In your Railway project, go to "Variables" tab and add:

```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
SESSION_SECRET=your-super-secret-session-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Replace the DATABASE_URL with the connection string from step 2.

## 4. Deploy

Your app will now use PostgreSQL on Railway and SQLite locally for development.

## 5. Verify Setup

After deployment, check the logs to see:
- "Database initialized successfully"
- "Database: PostgreSQL (Railway)"

## Troubleshooting

If you see "Failed to set display name" errors:
1. Check that DATABASE_URL is set correctly
2. Verify the PostgreSQL database is running
3. Check Railway logs for database connection errors

## Local Development

For local development, the app will automatically use SQLite if no DATABASE_URL is set. 