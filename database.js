const cloudDb = require('./cloud_database');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');

class Database {
  constructor() {
    this.cloudDb = cloudDb;
    this.localDb = null;
    this.useCloud = false;
    this.initializeDatabase();
  }

  async initializeDatabase() {
    try {
      // Wait for cloud database to initialize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (this.cloudDb.isConnected) {
        console.log('✅ Using PostgreSQL cloud database');
        this.useCloud = true;
        
        // Ensure tables are created in PostgreSQL
        await this.cloudDb.createTables();
        
        // Sync any existing local data to PostgreSQL
        await this.syncLocalToCloud();
        
      } else {
        console.log('❌ PostgreSQL not available, falling back to local SQLite');
        this.useCloud = false;
        this.localDb = new sqlite3.Database(config.database.path);
        this.init();
      }
    } catch (err) {
      console.error('❌ Database initialization error:', err.message);
      console.log('⚠️ Falling back to local SQLite database');
      this.useCloud = false;
      this.localDb = new sqlite3.Database(config.database.path);
      this.init();
    }
  }

  // Sync local SQLite data to PostgreSQL
  async syncLocalToCloud() {
    if (!this.useCloud || !this.localDb) return;
    
    try {
      console.log('🔄 Syncing local data to PostgreSQL...');
      
      // Sync users
      const users = await this.getLocalUsers();
      for (const user of users) {
        await this.cloudDb.createUser(
          user.google_id, 
          user.email, 
          user.name, 
          user.picture, 
          user.display_name
        );
      }
      
      // Sync game progress
      const progress = await this.getLocalGameProgress();
      for (const prog of progress) {
        await this.cloudDb.saveGameProgress(prog.user_id, JSON.parse(prog.game_state));
      }
      
      // Sync achievements
      const achievements = await this.getLocalAchievements();
      for (const achievement of achievements) {
        await this.cloudDb.saveAchievement(achievement.user_id, achievement.achievement_id);
      }
      
      console.log('✅ Local data synced to PostgreSQL');
    } catch (err) {
      console.error('❌ Error syncing to PostgreSQL:', err.message);
    }
  }

  // Helper methods to get local data
  async getLocalUsers() {
    return new Promise((resolve, reject) => {
      this.localDb.all('SELECT * FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async getLocalGameProgress() {
    return new Promise((resolve, reject) => {
      this.localDb.all('SELECT * FROM game_progress', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async getLocalAchievements() {
    return new Promise((resolve, reject) => {
      this.localDb.all('SELECT * FROM user_achievements', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  init() {
    // Create users table
    this.localDb.run(`
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
    `);

    // Create game_progress table
    this.localDb.run(`
      CREATE TABLE IF NOT EXISTS game_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        game_state TEXT NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (email)
      )
    `);

    // Create achievements table
    this.localDb.run(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (email)
      )
    `);
  }

  // User management
  async createUser(googleId, email, name, picture, displayName = null) {
    if (this.useCloud) {
      return await this.cloudDb.createUser(googleId, email, name, picture, displayName);
    } else {
      return new Promise((resolve, reject) => {
        this.localDb.run(
          'INSERT OR IGNORE INTO users (google_id, email, name, picture, display_name, last_login) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
          [googleId, email, name, picture, displayName],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }
  }

  async updateUser(googleId, email, name, picture, displayName = undefined) {
    if (this.useCloud) {
      return await this.cloudDb.updateUser(googleId, email, name, picture, displayName);
    } else {
      return new Promise((resolve, reject) => {
        let query = 'UPDATE users SET email = ?, name = ?, picture = ?, last_login = CURRENT_TIMESTAMP';
        const params = [email, name, picture];
        if (displayName !== undefined) {
          query += ', display_name = ?';
          params.push(displayName);
        }
        query += ' WHERE google_id = ?';
        params.push(googleId);
        this.localDb.run(query, params, function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  async setDisplayName(userId, displayName) {
    if (this.useCloud) {
      return await this.cloudDb.setDisplayName(userId, displayName);
    } else {
      return new Promise((resolve, reject) => {
        this.localDb.run(
          'UPDATE users SET display_name = ? WHERE id = ?',
          [displayName, userId],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }

  async getUserByGoogleId(googleId) {
    if (this.useCloud) {
      return await this.cloudDb.getUserByGoogleId(googleId);
    } else {
      return new Promise((resolve, reject) => {
        this.localDb.get(
          'SELECT * FROM users WHERE google_id = ?',
          [googleId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
    }
  }

  async getUserById(userId) {
    if (this.useCloud) {
      return await this.cloudDb.getUserById(userId);
    } else {
      return new Promise((resolve, reject) => {
        this.localDb.get(
          'SELECT * FROM users WHERE id = ?',
          [userId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
    }
  }

  // Game progress management
  async saveGameProgress(email, gameState) {
    try {
      console.log('[SAVE_GAME_PROGRESS] Starting save for email:', email);
      console.log('[SAVE_GAME_PROGRESS] Using cloud database:', this.useCloud);
      
      if (this.useCloud) {
        // Always save to PostgreSQL
        console.log('[SAVE_GAME_PROGRESS] Saving to PostgreSQL...');
        const result = await this.cloudDb.saveGameProgress(email, gameState);
        console.log('[SAVE_GAME_PROGRESS] PostgreSQL save result:', result);
        
        // Also save to local SQLite as backup
        console.log('[SAVE_GAME_PROGRESS] Saving to local SQLite as backup...');
        await this.saveToLocalSQLite(email, gameState);
        console.log('[SAVE_GAME_PROGRESS] Local SQLite backup saved');
        
        return result;
      } else {
        // Fallback to local SQLite only
        console.log('[SAVE_GAME_PROGRESS] Using local SQLite only');
        return await this.saveToLocalSQLite(email, gameState);
      }
    } catch (err) {
      console.error('❌ Error saving game progress:', err.message);
      // Fallback to local SQLite if PostgreSQL fails
      console.log('[SAVE_GAME_PROGRESS] Falling back to local SQLite due to error');
      return await this.saveToLocalSQLite(email, gameState);
    }
  }

  // Helper method to save to local SQLite
  async saveToLocalSQLite(email, gameState) {
    return new Promise((resolve, reject) => {
      if (!this.localDb) {
        this.localDb = new sqlite3.Database(config.database.path);
        this.init();
      }
      
      // Find the last row for this user
      this.localDb.get(
        'SELECT id FROM game_progress WHERE user_id = ? ORDER BY id DESC LIMIT 1',
        [email],
        (err, row) => {
          if (err) return reject(err);
          if (row) {
            // Update the last row
            this.localDb.run(
              'UPDATE game_progress SET game_state = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
              [JSON.stringify(gameState), row.id],
              function(err2) {
                if (err2) reject(err2);
                else resolve(row.id);
              }
            );
          } else {
            // Insert new row if none exists
            this.localDb.run(
              'INSERT INTO game_progress (user_id, game_state, last_updated) VALUES (?, ?, CURRENT_TIMESTAMP)',
              [email, JSON.stringify(gameState)],
              function(err2) {
                if (err2) reject(err2);
                else resolve(this.lastID);
              }
            );
          }
        }
      );
    });
  }

  async getGameProgress(email) {
    if (this.useCloud) {
      return await this.cloudDb.getGameProgress(email);
    } else {
      return new Promise((resolve, reject) => {
        this.localDb.get(
          'SELECT game_state FROM game_progress WHERE user_id = ? ORDER BY id DESC LIMIT 1',
          [email],
          (err, row) => {
            if (err) reject(err);
            else resolve(row ? JSON.parse(row.game_state) : null);
          }
        );
      });
    }
  }

  // Achievement management
  async saveAchievement(userId, achievementId) {
    if (this.useCloud) {
      return await this.cloudDb.saveAchievement(userId, achievementId);
    } else {
      return new Promise((resolve, reject) => {
        this.localDb.run(
          'INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
          [userId, achievementId],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }
  }

  async getUserAchievements(userId) {
    if (this.useCloud) {
      return await this.cloudDb.getUserAchievements(userId);
    } else {
      return new Promise((resolve, reject) => {
        this.localDb.all(
          'SELECT achievement_id FROM user_achievements WHERE user_id = ?',
          [userId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(row => row.achievement_id));
          }
        );
      });
    }
  }

  // Leaderboard
  async getLeaderboard() {
    if (this.useCloud) {
      return await this.cloudDb.getLeaderboard();
    } else {
      return new Promise((resolve, reject) => {
        this.localDb.all(`
          WITH latest_progress AS (
            SELECT * FROM game_progress WHERE id IN (
              SELECT MAX(id) FROM game_progress GROUP BY user_id
            )
          )
          SELECT 
            u.email,
            u.name,
            u.display_name,
            u.picture,
            u.is_dummy,
            lp.game_state,
            lp.last_updated,
            GROUP_CONCAT(ua.achievement_id) as achievements
          FROM users u
          LEFT JOIN latest_progress lp ON u.email = lp.user_id
          LEFT JOIN user_achievements ua ON u.email = ua.user_id
          GROUP BY u.email
          HAVING lp.game_state IS NOT NULL
          ORDER BY json_extract(lp.game_state, '$.cash') DESC
        `, (err, rows) => {
          if (err) reject(err);
          else {
            const leaderboard = rows.map(row => {
              const gameState = JSON.parse(row.game_state);
              const isDummy = row.is_dummy === 1;
              const achievements = row.achievements ? row.achievements.split(',') : [];
              return {
                userId: row.email,
                name: isDummy ? `Player ${row.email.split('_')[2]}` : (row.display_name || row.name),
                picture: row.picture,
                netWorth: this.calculateNetWorth(gameState),
                cash: gameState.cash || 0,
                week: gameState.week || 1,
                totalDecisions: gameState.totalDecisions || 0,
                lastUpdated: row.last_updated,
                isDummy: isDummy,
                achievements: achievements
              };
            });
            resolve(leaderboard);
          }
        });
      });
    }
  }

  calculateNetWorth(gameState) {
    const cash = gameState.cash || 0;
    const assets = gameState.assets || [];
    const totalDebt = gameState.totalDebt || 0;
    return cash + (assets.length * 100) - totalDebt;
  }

  close() {
    if (this.localDb) {
      this.localDb.close();
    }
    if (this.cloudDb) {
      this.cloudDb.close();
    }
  }
}

module.exports = new Database(); 