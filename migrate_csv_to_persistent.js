const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');
const config = require('./config');
const RailwayDeploy = require('./railway_deploy');

class CSVMigration {
  constructor() {
    this.railway = new RailwayDeploy();
    this.dbPath = config.database.path;
  }

  async migrateFromCSV() {
    console.log('Starting CSV migration to persistent storage...');
    
    try {
      // Set up persistent storage
      await this.railway.setupPersistentStorage();
      
      // Initialize database
      const db = new sqlite3.Database(this.dbPath);
      
      // Create tables if they don't exist
      await this.createTables(db);
      
      // Import CSV files
      await this.importCSVFiles(db);
      
      // Sync to persistent storage
      await this.railway.syncToPersistent();
      
      // Create backup
      await this.railway.backupToPersistent();
      
      // Export to CSV in persistent storage
      await this.railway.exportToCSV();
      
      db.close();
      console.log('CSV migration completed successfully!');
      
    } catch (err) {
      console.error('CSV migration failed:', err);
      throw err;
    }
  }

  createTables(db) {
    return new Promise((resolve, reject) => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          google_id TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          picture TEXT,
          display_name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_dummy INTEGER DEFAULT 0
        )
      `, (err) => {
        if (err) return reject(err);
        
        // Create game_progress table
        db.run(`
          CREATE TABLE IF NOT EXISTS game_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            game_state TEXT NOT NULL,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (email)
          )
        `, (err2) => {
          if (err2) return reject(err2);
          
          // Create achievements table
          db.run(`
            CREATE TABLE IF NOT EXISTS user_achievements (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id TEXT NOT NULL,
              achievement_id TEXT NOT NULL,
              unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users (email)
            )
          `, (err3) => {
            if (err3) return reject(err3);
            resolve();
          });
        });
      });
    });
  }

  async importCSVFiles(db) {
    const csvFiles = {
      users: 'users.csv',
      game_progress: 'game_progress.csv',
      achievements: 'achievements.csv'
    };

    for (const [table, filename] of Object.entries(csvFiles)) {
      if (fs.existsSync(filename)) {
        console.log(`Importing ${filename}...`);
        await this.importCSV(db, table, filename);
      } else {
        console.log(`CSV file ${filename} not found, skipping...`);
      }
    }
  }

  importCSV(db, table, filename) {
    return new Promise((resolve, reject) => {
      const rows = [];
      
      fs.createReadStream(filename)
        .pipe(csv())
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', () => {
          console.log(`Found ${rows.length} rows in ${filename}`);
          
          if (rows.length === 0) {
            resolve();
            return;
          }

          // Insert data based on table type
          switch (table) {
            case 'users':
              this.insertUsers(db, rows, resolve, reject);
              break;
            case 'game_progress':
              this.insertGameProgress(db, rows, resolve, reject);
              break;
            case 'achievements':
              this.insertAchievements(db, rows, resolve, reject);
              break;
            default:
              resolve();
          }
        })
        .on('error', reject);
    });
  }

  insertUsers(db, rows, resolve, reject) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO users 
      (id, google_id, email, name, picture, display_name, created_at, last_login, is_dummy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let completed = 0;
    rows.forEach((row, index) => {
      stmt.run([
        row.ID || row.id,
        row.google_id || row.GoogleID,
        row.email || row.Email,
        row.name || row.Name,
        row.picture || row.Picture,
        row.display_name || row.DisplayName,
        row.created_at || row.CreatedAt,
        row.last_login || row.LastLogin,
        row.is_dummy || row.IsDummy || 0
      ], (err) => {
        if (err) {
          console.error(`Error inserting user ${index}:`, err);
        }
        completed++;
        if (completed === rows.length) {
          stmt.finalize();
          resolve();
        }
      });
    });
  }

  insertGameProgress(db, rows, resolve, reject) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO game_progress 
      (id, user_id, game_state, last_updated)
      VALUES (?, ?, ?, ?)
    `);

    let completed = 0;
    rows.forEach((row, index) => {
      stmt.run([
        row.ID || row.id,
        row.user_id || row.UserID,
        row.game_state || row.GameState,
        row.last_updated || row.LastUpdated
      ], (err) => {
        if (err) {
          console.error(`Error inserting game progress ${index}:`, err);
        }
        completed++;
        if (completed === rows.length) {
          stmt.finalize();
          resolve();
        }
      });
    });
  }

  insertAchievements(db, rows, resolve, reject) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_achievements 
      (id, user_id, achievement_id, unlocked_at)
      VALUES (?, ?, ?, ?)
    `);

    let completed = 0;
    rows.forEach((row, index) => {
      stmt.run([
        row.ID || row.id,
        row.user_id || row.UserID,
        row.achievement_id || row.AchievementID,
        row.unlocked_at || row.UnlockedAt
      ], (err) => {
        if (err) {
          console.error(`Error inserting achievement ${index}:`, err);
        }
        completed++;
        if (completed === rows.length) {
          stmt.finalize();
          resolve();
        }
      });
    });
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  const migration = new CSVMigration();
  migration.migrateFromCSV()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = CSVMigration; 