const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const config = require('./config');

// Railway persistent storage path
const RAILWAY_PERSISTENT_PATH = process.env.RAILWAY_PERSISTENT_PATH || '/data';
const DB_FILENAME = 'game_data.db';
const BACKUP_FILENAME = 'game_data_backup.db';

class RailwayDeploy {
  constructor() {
    this.persistentDbPath = path.join(RAILWAY_PERSISTENT_PATH, DB_FILENAME);
    this.persistentBackupPath = path.join(RAILWAY_PERSISTENT_PATH, BACKUP_FILENAME);
    this.localDbPath = config.database.path;
  }

  async setupPersistentStorage() {
    console.log('Setting up Railway persistent storage...');
    
    // Ensure persistent directory exists
    if (!fs.existsSync(RAILWAY_PERSISTENT_PATH)) {
      fs.mkdirSync(RAILWAY_PERSISTENT_PATH, { recursive: true });
      console.log(`Created persistent directory: ${RAILWAY_PERSISTENT_PATH}`);
    }

    // Check if we have a database in persistent storage
    if (fs.existsSync(this.persistentDbPath)) {
      console.log('Found existing database in persistent storage');
      
      // Copy persistent database to local path
      fs.copyFileSync(this.persistentDbPath, this.localDbPath);
      console.log(`Copied persistent database to: ${this.localDbPath}`);
      
      return true;
    } else {
      console.log('No existing database found in persistent storage');
      
      // Check if we have a local database to migrate
      if (fs.existsSync(this.localDbPath)) {
        console.log('Found local database, migrating to persistent storage');
        fs.copyFileSync(this.localDbPath, this.persistentDbPath);
        console.log(`Migrated local database to persistent storage: ${this.persistentDbPath}`);
        return true;
      }
      
      return false;
    }
  }

  async backupToPersistent() {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(this.localDbPath)) {
        console.log('No local database to backup');
        resolve();
        return;
      }

      console.log('Creating backup in persistent storage...');
      
      const sourceDb = new sqlite3.Database(this.localDbPath);
      const backupDb = new sqlite3.Database(this.persistentBackupPath);
      
      sourceDb.backup(backupDb, (err) => {
        if (err) {
          console.error('Backup failed:', err);
          reject(err);
        } else {
          console.log(`Database backed up to persistent storage: ${this.persistentBackupPath}`);
          sourceDb.close();
          backupDb.close();
          resolve();
        }
      });
    });
  }

  async syncToPersistent() {
    if (fs.existsSync(this.localDbPath)) {
      console.log('Syncing database to persistent storage...');
      fs.copyFileSync(this.localDbPath, this.persistentDbPath);
      console.log(`Database synced to: ${this.persistentDbPath}`);
    }
  }

  // Schedule periodic syncs to persistent storage
  scheduleSync(intervalMinutes = 5) {
    setInterval(async () => {
      try {
        await this.syncToPersistent();
      } catch (err) {
        console.error('Scheduled sync failed:', err);
      }
    }, intervalMinutes * 60 * 1000);
  }

  // Export current database to CSV in persistent storage
  async exportToCSV() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const csvPath = path.join(RAILWAY_PERSISTENT_PATH, `export_${timestamp}`);
    
    if (!fs.existsSync(csvPath)) {
      fs.mkdirSync(csvPath, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.localDbPath);
      
      // Export users
      db.all('SELECT * FROM users', [], (err, users) => {
        if (err) return reject(err);
        
        const usersCsv = path.join(csvPath, 'users.csv');
        const usersData = users.map(user => 
          `${user.id},${user.google_id},${user.email},${user.name},${user.picture},${user.display_name},${user.created_at},${user.last_login},${user.is_dummy}`
        ).join('\n');
        
        fs.writeFileSync(usersCsv, 'id,google_id,email,name,picture,display_name,created_at,last_login,is_dummy\n' + usersData);
        
        // Export game progress
        db.all('SELECT * FROM game_progress', [], (err2, progress) => {
          if (err2) return reject(err2);
          
          const progressCsv = path.join(csvPath, 'game_progress.csv');
          const progressData = progress.map(p => 
            `${p.id},${p.user_id},${p.game_state},${p.last_updated}`
          ).join('\n');
          
          fs.writeFileSync(progressCsv, 'id,user_id,game_state,last_updated\n' + progressData);
          
          // Export achievements
          db.all('SELECT * FROM user_achievements', [], (err3, achievements) => {
            if (err3) return reject(err3);
            
            const achievementsCsv = path.join(csvPath, 'achievements.csv');
            const achievementsData = achievements.map(a => 
              `${a.id},${a.user_id},${a.achievement_id},${a.unlocked_at}`
            ).join('\n');
            
            fs.writeFileSync(achievementsCsv, 'id,user_id,achievement_id,unlocked_at\n' + achievementsData);
            
            db.close();
            console.log(`CSV exports created in persistent storage: ${csvPath}`);
            resolve(csvPath);
          });
        });
      });
    });
  }
}

module.exports = RailwayDeploy; 