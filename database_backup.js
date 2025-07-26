const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const config = require('./config');

class DatabaseBackup {
  constructor() {
    this.dbPath = config.database.path;
    this.backupPath = process.env.BACKUP_PATH || './backups/';
    this.ensureBackupDirectory();
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
  }

  // Create a backup of the current database
  async createBackup() {
    return new Promise((resolve, reject) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupPath, `game_data_backup_${timestamp}.db`);
      
      const sourceDb = new sqlite3.Database(this.dbPath);
      const backupDb = new sqlite3.Database(backupFile);
      
      sourceDb.backup(backupDb, (err) => {
        if (err) {
          console.error('Backup failed:', err);
          reject(err);
        } else {
          console.log(`Database backed up to: ${backupFile}`);
          sourceDb.close();
          backupDb.close();
          resolve(backupFile);
        }
      });
    });
  }

  // Restore database from the latest backup
  async restoreFromBackup() {
    return new Promise((resolve, reject) => {
      try {
        const backupFiles = fs.readdirSync(this.backupPath)
          .filter(file => file.startsWith('game_data_backup_') && file.endsWith('.db'))
          .sort()
          .reverse();

        if (backupFiles.length === 0) {
          console.log('No backup files found, starting with fresh database');
          resolve(false);
          return;
        }

        const latestBackup = path.join(this.backupPath, backupFiles[0]);
        console.log(`Restoring from backup: ${latestBackup}`);

        // Copy backup to main database location
        fs.copyFileSync(latestBackup, this.dbPath);
        console.log('Database restored successfully');
        resolve(true);
      } catch (err) {
        console.error('Restore failed:', err);
        reject(err);
      }
    });
  }

  // Schedule automatic backups
  scheduleBackups(intervalMinutes = 60) {
    setInterval(async () => {
      try {
        await this.createBackup();
        // Keep only the last 5 backups to save space
        this.cleanupOldBackups(5);
      } catch (err) {
        console.error('Scheduled backup failed:', err);
      }
    }, intervalMinutes * 60 * 1000);
  }

  // Clean up old backup files
  cleanupOldBackups(keepCount = 5) {
    try {
      const backupFiles = fs.readdirSync(this.backupPath)
        .filter(file => file.startsWith('game_data_backup_') && file.endsWith('.db'))
        .sort()
        .reverse();

      // Remove old backups beyond the keep count
      for (let i = keepCount; i < backupFiles.length; i++) {
        const oldBackup = path.join(this.backupPath, backupFiles[i]);
        fs.unlinkSync(oldBackup);
        console.log(`Removed old backup: ${oldBackup}`);
      }
    } catch (err) {
      console.error('Cleanup failed:', err);
    }
  }

  // Export to CSV for manual backup
  async exportToCSV() {
    const db = new sqlite3.Database(this.dbPath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    return new Promise((resolve, reject) => {
      // Export users
      db.all('SELECT * FROM users', [], (err, users) => {
        if (err) return reject(err);
        
        const usersCsv = path.join(this.backupPath, `users_${timestamp}.csv`);
        const usersData = users.map(user => 
          `${user.id},${user.google_id},${user.email},${user.name},${user.picture},${user.display_name},${user.created_at},${user.last_login},${user.is_dummy}`
        ).join('\n');
        
        fs.writeFileSync(usersCsv, 'id,google_id,email,name,picture,display_name,created_at,last_login,is_dummy\n' + usersData);
        
        // Export game progress
        db.all('SELECT * FROM game_progress', [], (err2, progress) => {
          if (err2) return reject(err2);
          
          const progressCsv = path.join(this.backupPath, `game_progress_${timestamp}.csv`);
          const progressData = progress.map(p => 
            `${p.id},${p.user_id},${p.game_state},${p.last_updated}`
          ).join('\n');
          
          fs.writeFileSync(progressCsv, 'id,user_id,game_state,last_updated\n' + progressData);
          
          // Export achievements
          db.all('SELECT * FROM user_achievements', [], (err3, achievements) => {
            if (err3) return reject(err3);
            
            const achievementsCsv = path.join(this.backupPath, `achievements_${timestamp}.csv`);
            const achievementsData = achievements.map(a => 
              `${a.id},${a.user_id},${a.achievement_id},${a.unlocked_at}`
            ).join('\n');
            
            fs.writeFileSync(achievementsCsv, 'id,user_id,achievement_id,unlocked_at\n' + achievementsData);
            
            db.close();
            console.log(`CSV exports created: ${usersCsv}, ${progressCsv}, ${achievementsCsv}`);
            resolve();
          });
        });
      });
    });
  }
}

module.exports = DatabaseBackup; 