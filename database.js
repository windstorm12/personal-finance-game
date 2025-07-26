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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (this.cloudDb.isConnected) {
        console.log('✅ Using cloud database');
        this.useCloud = true;
      } else {
        console.log('⚠️ Cloud database not available, using local SQLite');
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
    if (this.useCloud) {
      return await this.cloudDb.saveGameProgress(email, gameState);
    } else {
      return new Promise((resolve, reject) => {
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