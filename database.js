const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const config = require('./config');

class Database {
  constructor() {
    if (config.database.url) {
      // Use PostgreSQL (Railway)
      this.pool = new Pool({
        connectionString: config.database.url,
        ssl: config.database.ssl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      this.isPostgres = true;
    } else {
      // Fallback to SQLite for local development
      this.db = new sqlite3.Database(config.database.path);
      this.isPostgres = false;
    }
    this.init();
  }

  async init() {
    if (this.isPostgres) {
      await this.initPostgres();
    } else {
      this.initSqlite();
    }
  }

  async initPostgres() {
    const client = await this.pool.connect();
    try {
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          google_id VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          picture TEXT,
          display_name VARCHAR(32),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_dummy BOOLEAN DEFAULT FALSE
        )
      `);

      // Create game_progress table
      await client.query(`
        CREATE TABLE IF NOT EXISTS game_progress (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          game_state JSONB NOT NULL,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create achievements table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_achievements (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          achievement_id VARCHAR(255) NOT NULL,
          unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('PostgreSQL tables initialized');
    } catch (error) {
      console.error('Error initializing PostgreSQL tables:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  initSqlite() {
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
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create achievements table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // User management
  async createUser(googleId, email, name, picture, displayName = null) {
    if (this.isPostgres) {
      const client = await this.pool.connect();
      try {
        const result = await client.query(
          'INSERT INTO users (google_id, email, name, picture, display_name, last_login) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) ON CONFLICT (google_id) DO NOTHING RETURNING id',
          [googleId, email, name, picture, displayName]
        );
        return result.rows[0]?.id;
      } finally {
        client.release();
      }
    } else {
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
  }

  async updateUser(googleId, email, name, picture, displayName = undefined) {
    if (this.isPostgres) {
      const client = await this.pool.connect();
      try {
        let query = 'UPDATE users SET email = $1, name = $2, picture = $3, last_login = CURRENT_TIMESTAMP';
        const params = [email, name, picture];
        let paramCount = 3;
        if (displayName !== undefined) {
          query += `, display_name = $${++paramCount}`;
          params.push(displayName);
        }
        query += ` WHERE google_id = $${++paramCount}`;
        params.push(googleId);
        await client.query(query, params);
      } finally {
        client.release();
      }
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
        this.db.run(query, params, function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  async setDisplayName(userId, displayName) {
    if (this.isPostgres) {
      const client = await this.pool.connect();
      try {
        await client.query(
          'UPDATE users SET display_name = $1 WHERE id = $2',
          [displayName, userId]
        );
      } finally {
        client.release();
      }
    } else {
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
  }

  async getUserByGoogleId(googleId) {
    if (this.isPostgres) {
      const client = await this.pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM users WHERE google_id = $1',
          [googleId]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
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
  }

  async getUserById(userId) {
    if (this.isPostgres) {
      const client = await this.pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM users WHERE id = $1',
          [userId]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
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
  }

  async saveGameProgress(email, gameState) {
    if (this.isPostgres) {
      const client = await this.pool.connect();
      try {
        await client.query(
          'INSERT INTO game_progress (user_id, game_state, last_updated) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (user_id) DO UPDATE SET game_state = $2, last_updated = CURRENT_TIMESTAMP',
          [email, JSON.stringify(gameState)]
        );
      } finally {
        client.release();
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.run(
          'INSERT OR REPLACE INTO game_progress (user_id, game_state, last_updated) VALUES (?, ?, CURRENT_TIMESTAMP)',
          [email, JSON.stringify(gameState)],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }

  async getGameProgress(email) {
    if (this.isPostgres) {
      const client = await this.pool.connect();
      try {
        const result = await client.query(
          'SELECT game_state FROM game_progress WHERE user_id = $1',
          [email]
        );
        return result.rows[0] ? JSON.parse(result.rows[0].game_state) : null;
      } finally {
        client.release();
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.get(
          'SELECT game_state FROM game_progress WHERE user_id = ?',
          [email],
          (err, row) => {
            if (err) reject(err);
            else resolve(row ? JSON.parse(row.game_state) : null);
          }
        );
      });
    }
  }

  async saveAchievement(userId, achievementId) {
    if (this.isPostgres) {
      const client = await this.pool.connect();
      try {
        await client.query(
          'INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (user_id, achievement_id) DO NOTHING',
          [userId, achievementId]
        );
      } finally {
        client.release();
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.run(
          'INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          [userId, achievementId],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }

  async getUserAchievements(userId) {
    if (this.isPostgres) {
      const client = await this.pool.connect();
      try {
        const result = await client.query(
          'SELECT achievement_id FROM user_achievements WHERE user_id = $1',
          [userId]
        );
        return result.rows.map(row => row.achievement_id);
      } finally {
        client.release();
      }
    } else {
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
  }

  async getLeaderboard() {
    if (this.isPostgres) {
      const client = await this.pool.connect();
      try {
        const result = await client.query(`
          SELECT 
            u.email,
            u.display_name,
            u.name,
            u.is_dummy,
            gp.game_state
          FROM users u
          LEFT JOIN game_progress gp ON u.email = gp.user_id
          WHERE u.is_dummy = false
          ORDER BY u.created_at DESC
        `);
        return result.rows.map(row => {
          const gameState = row.game_state ? JSON.parse(row.game_state) : null;
          return {
            email: row.email,
            display_name: row.display_name,
            name: row.name,
            is_dummy: row.is_dummy,
            netWorth: gameState ? this.calculateNetWorth(gameState) : 0,
            cash: gameState?.cash || 0,
            day: gameState?.day || 0,
            week: gameState?.week || 0,
            skills: gameState?.skills || {},
            achievements: gameState?.achievements?.unlocked || []
          };
        });
      } finally {
        client.release();
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.all(`
          SELECT 
            u.email,
            u.display_name,
            u.name,
            u.is_dummy,
            gp.game_state
          FROM users u
          LEFT JOIN game_progress gp ON u.email = gp.user_id
          WHERE u.is_dummy = 0
          ORDER BY u.created_at DESC
        `, (err, rows) => {
          if (err) reject(err);
          else {
            resolve(rows.map(row => {
              const gameState = row.game_state ? JSON.parse(row.game_state) : null;
              return {
                email: row.email,
                display_name: row.display_name,
                name: row.name,
                is_dummy: row.is_dummy,
                netWorth: gameState ? this.calculateNetWorth(gameState) : 0,
                cash: gameState?.cash || 0,
                day: gameState?.day || 0,
                week: gameState?.week || 0,
                skills: gameState?.skills || {},
                achievements: gameState?.achievements?.unlocked || []
              };
            }));
          }
        });
      });
    }
  }

  calculateNetWorth(gameState) {
    if (!gameState) return 0;
    const cash = gameState.cash || 0;
    const investments = gameState.investments || {};
    const totalInvestments = Object.values(investments).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
    const debts = gameState.debts || {};
    const totalDebt = Object.values(debts).flat().reduce((sum, debt) => sum + (debt.amount || 0), 0);
    return cash + totalInvestments - totalDebt;
  }

  async close() {
    if (this.isPostgres) {
      await this.pool.end();
    } else {
      this.db.close();
    }
  }
}

module.exports = new Database(); 