# Database Persistence System

This document explains how the database persistence system works to prevent data loss during Railway deployments.

## Problem

Railway uses ephemeral storage, which means the SQLite database file (`game_data.db`) gets reset every time you redeploy. This causes all user progress to be lost.

## Solution

The system implements multiple layers of data persistence:

### 1. Railway Persistent Storage
- Uses Railway's persistent storage volume at `/data`
- Database is automatically synced to persistent storage every 5 minutes
- On startup, the system checks for existing database in persistent storage and restores it

### 2. Local Backup System
- Creates local backups every 30 minutes in `./backups/` directory
- Keeps the last 5 backups to save space
- Provides fallback restoration if persistent storage fails

### 3. CSV Export System
- Exports data to CSV files for manual backup
- Creates timestamped exports in persistent storage
- Can be used for manual data recovery

## Setup Instructions

### 1. Configure Railway Persistent Storage

In your Railway dashboard:

1. Go to your project settings
2. Add a new environment variable:
   - Name: `RAILWAY_PERSISTENT_PATH`
   - Value: `/data`

### 2. Update Admin Email

In `server_oauth.js`, update the admin email check:

```javascript
if (req.session.email !== 'your-admin-email@example.com') {
```

Replace `'your-admin-email@example.com'` with your actual email address.

### 3. Deploy

The system will automatically:
- Set up persistent storage on first deployment
- Restore existing data from persistent storage
- Start automatic backup and sync processes

## How It Works

### Startup Process
1. Check for database in Railway persistent storage (`/data/game_data.db`)
2. If found, copy to local path (`./game_data.db`)
3. If not found, check for local backups
4. Initialize database and start backup/sync processes

### Data Saving Process
1. Save data to local SQLite database
2. Create local backup
3. Sync to Railway persistent storage
4. Export to CSV (periodically)

### Deployment Process
1. Run `deploy_setup.js` before starting the server
2. Set up persistent storage
3. Restore database from persistent storage
4. Start the application

## API Endpoints

### Admin Endpoints (require authentication)

- `POST /admin/backup` - Manually trigger backup
- `POST /admin/restore` - Manually trigger restore
- `GET /admin/status` - Check database status

## Manual Commands

```bash
# Create backup
npm run backup

# Restore from backup
npm run restore

# Run deployment setup
npm run deploy-setup
```

## Troubleshooting

### Data Still Getting Lost

1. Check if `RAILWAY_PERSISTENT_PATH` is set correctly
2. Verify persistent storage is enabled in Railway
3. Check logs for backup/restore errors

### Backup Not Working

1. Check file permissions in persistent storage
2. Verify database file exists
3. Check for disk space issues

### Restore Not Working

1. Check if backup files exist in persistent storage
2. Verify file paths are correct
3. Check database file integrity

## File Structure

```
/
├── game_data.db              # Local database
├── backups/                  # Local backups
│   ├── game_data_backup_*.db
│   ├── users_*.csv
│   ├── game_progress_*.csv
│   └── achievements_*.csv
├── database.js               # Main database class
├── database_backup.js        # Local backup system
├── railway_deploy.js         # Railway persistent storage
├── deploy_setup.js           # Deployment setup
└── DATABASE_PERSISTENCE.md   # This file
```

## Environment Variables

- `RAILWAY_PERSISTENT_PATH` - Path to Railway persistent storage (default: `/data`)
- `BACKUP_PATH` - Path for local backups (default: `./backups/`)

## Monitoring

The system logs all backup and restore operations. Check your Railway logs for:
- "Database restored from persistent storage"
- "Database synced to persistent storage"
- "Backup completed successfully"
- Any error messages

## Best Practices

1. **Regular Monitoring**: Check the `/admin/status` endpoint regularly
2. **Manual Backups**: Use the admin endpoints for manual backups before major deployments
3. **CSV Exports**: Download CSV exports periodically for additional safety
4. **Testing**: Test the backup/restore system in a development environment first

## Migration from CSV System

If you're currently using CSV files for data management:

1. Import your current CSV data
2. Deploy the new system
3. The system will automatically start backing up to persistent storage
4. You can continue using CSV exports as additional backup

## Security Notes

- Admin endpoints require authentication
- Update the admin email check in the code
- Consider adding additional security measures for production
- Backup files contain sensitive user data - secure appropriately 