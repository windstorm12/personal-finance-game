const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');

class Database {
  constructor() {
    this.db = new sqlite3.Database(config.database.path);
    this.init();
  }

  init() {
    // Create users table
    this.db.run(`
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
    this.db.run(`
      CREATE TABLE IF NOT EXISTS game_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        game_state TEXT NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (email)
      )
    `);

    // Create achievements table
    this.db.run(`
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
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR IGNORE INTO users (google_id, email, name, picture, display_name, last_login) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [googleId, email, name, picture, displayName],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async updateUser(googleId, email, name, picture, displayName = undefined) {
    return new Promise((resolve, reject) => {
      let query = 'UPDATE users SET email = ?, name = ?, picture = ?, last_login = CURRENT_TIMESTAMP';
      const params = [email, name, picture];
      if (displayName !== undefined) {
        query += ', display_name = ?';
        params.push(displayName);
      }
      query += ' WHERE google_id = ?';
      params.push(googleId);
      this.db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async setDisplayName(userId, displayName) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET display_name = ? WHERE id = ?',
        [displayName, userId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getUserByGoogleId(googleId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE google_id = ?',
        [googleId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async getUserById(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Game progress management
  async saveGameProgress(email, gameState) {
    return new Promise((resolve, reject) => {
      // Find the last row for this user
      this.db.get(
        'SELECT id FROM game_progress WHERE user_id = ? ORDER BY id DESC LIMIT 1',
        [email],
        (err, row) => {
          if (err) return reject(err);
          if (row) {
            // Update the last row
            this.db.run(
              'UPDATE game_progress SET game_state = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
              [JSON.stringify(gameState), row.id],
              function(err2) {
                if (err2) reject(err2);
                else resolve(row.id);
              }
            );
          } else {
            // Insert new row if none exists
            this.db.run(
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
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT game_state FROM game_progress WHERE user_id = ? ORDER BY id DESC LIMIT 1',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? JSON.parse(row.game_state) : null);
        }
      );
    });
  }

  // Achievement management
  async saveAchievement(userId, achievementId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
        [userId, achievementId],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async getUserAchievements(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT achievement_id FROM user_achievements WHERE user_id = ?',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => row.achievement_id));
        }
      );
    });
  }

  // Leaderboard
  async getLeaderboard() {
    return new Promise((resolve, reject) => {
      this.db.all(`
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

  calculateNetWorth(gameState) {
    const cash = gameState.cash || 0;
    const assets = gameState.assets || [];
    const totalDebt = gameState.totalDebt || 0;
    return cash + (assets.length * 100) - totalDebt;
  }

  close() {
    this.db.close();
  }
}

module.exports = new Database(); 