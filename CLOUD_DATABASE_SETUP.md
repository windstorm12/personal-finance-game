# Cloud Database Setup Guide

This guide will help you set up a cloud database to automatically persist your game data across Railway deployments.

## 🚀 Quick Setup Options

### Option 1: Supabase (Recommended - Free)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Database URL**
   - Go to Settings → Database
   - Copy the "Connection string" (URI format)
   - It looks like: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`

3. **Set Environment Variable**
   - In Railway dashboard, add environment variable:
   - Name: `DATABASE_URL`
   - Value: Your Supabase connection string

### Option 2: PlanetScale (Free MySQL)

1. **Create PlanetScale Account**
   - Go to [planetscale.com](https://planetscale.com)
   - Sign up for a free account
   - Create a new database

2. **Get Database URL**
   - Go to your database → Connect
   - Copy the connection string
   - It looks like: `mysql://[username]:[password]@[host]/[database]`

3. **Set Environment Variable**
   - In Railway dashboard, add environment variable:
   - Name: `DATABASE_URL`
   - Value: Your PlanetScale connection string

### Option 3: Railway PostgreSQL (Paid)

1. **Add PostgreSQL Service**
   - In Railway dashboard, click "New Service"
   - Select "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

## 🔧 Configuration

### Environment Variables

Add these to your Railway environment:

```bash
# Required for cloud database
DATABASE_URL=your_database_connection_string

# Optional: Supabase specific
SUPABASE_DB_URL=your_supabase_connection_string

# Your existing variables
NODE_ENV=production
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
```

### Railway Dashboard Setup

1. Go to your Railway project
2. Click on your service
3. Go to "Variables" tab
4. Add the `DATABASE_URL` variable
5. Deploy your application

## 🔄 How It Works

### Automatic Cloud Sync

1. **On Startup**: 
   - App connects to cloud database
   - All data is automatically available
   - No manual restore needed

2. **During Gameplay**:
   - Every save action updates cloud database immediately
   - Data is always in sync
   - No local storage dependencies

3. **After Deployment**:
   - App reconnects to cloud database
   - All user progress is instantly available
   - Zero data loss

### Fallback System

- If cloud database is unavailable, app falls back to local SQLite
- Automatic retry mechanism for cloud connection
- Seamless switching between cloud and local

## 📊 Database Schema

The system automatically creates these tables:

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  picture TEXT,
  display_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_dummy BOOLEAN DEFAULT FALSE
);
```

### Game Progress Table
```sql
CREATE TABLE game_progress (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  game_state JSONB NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (email) ON DELETE CASCADE
);
```

### Achievements Table
```sql
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  achievement_id VARCHAR(255) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (email) ON DELETE CASCADE,
  UNIQUE(user_id, achievement_id)
);
```

## 🛠 Migration from Local Data

### Option 1: Automatic Migration

If you have existing CSV files:

```bash
# Run migration script
npm run migrate-csv
```

### Option 2: Manual Migration

1. Export your current data to CSV
2. Upload CSV files to your project
3. Run migration script
4. Deploy with cloud database

## 🔍 Monitoring

### Health Check Endpoint

Add this to your server to monitor database status:

```javascript
app.get('/health', async (req, res) => {
  const health = await db.cloudDb.healthCheck();
  res.json(health);
});
```

### Logs to Watch

- `✅ Connected to cloud database` - Success
- `⚠️ Cloud database not available, using local SQLite` - Fallback
- `❌ Cloud database connection failed` - Error

## 🚨 Troubleshooting

### Connection Issues

1. **Check Environment Variables**
   - Verify `DATABASE_URL` is set correctly
   - Ensure no extra spaces or quotes

2. **Test Connection**
   - Use the health check endpoint
   - Check Railway logs for connection errors

3. **SSL Issues**
   - For Supabase: SSL is required in production
   - For local development: SSL may be disabled

### Data Not Syncing

1. **Check Database Permissions**
   - Ensure your database user has read/write access
   - Verify tables are created successfully

2. **Monitor Logs**
   - Look for "Cloud database not connected" messages
   - Check for SQL errors in logs

### Performance Issues

1. **Connection Pooling**
   - The system uses connection pooling
   - Adjust pool size if needed

2. **Query Optimization**
   - Monitor slow queries
   - Add indexes if needed

## 🔒 Security

### Best Practices

1. **Environment Variables**
   - Never commit database URLs to git
   - Use Railway's environment variable system

2. **Database Access**
   - Use read-only users for queries
   - Limit database permissions

3. **Connection Security**
   - Always use SSL in production
   - Regularly rotate database passwords

## 📈 Scaling

### Free Tier Limits

- **Supabase**: 500MB database, 50,000 monthly active users
- **PlanetScale**: 1GB database, 1 billion row reads/month
- **Railway PostgreSQL**: 1GB database, $5/month

### Upgrading

When you hit limits:
1. Upgrade your database plan
2. Monitor usage with health checks
3. Consider data archiving for old records

## 🎯 Benefits

✅ **Zero Data Loss**: Data persists across all deployments
✅ **Automatic Sync**: Real-time updates to cloud database
✅ **No Manual Work**: No more CSV uploads/downloads
✅ **Scalable**: Handles multiple users simultaneously
✅ **Reliable**: Built-in fallback to local storage
✅ **Free**: Start with free tier databases

## 🚀 Next Steps

1. Choose your cloud database provider
2. Set up the environment variable
3. Deploy your application
4. Test with a few users
5. Monitor the health endpoint

Your game data will now be automatically persisted in the cloud and restored on every deployment! 