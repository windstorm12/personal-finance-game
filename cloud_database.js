const { Pool } = require('pg'); // PostgreSQL for Supabase
const config = require('./config');

class CloudDatabase {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    try {
      // Initialize PostgreSQL connection
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      this.isConnected = true;
      console.log('✅ Connected to cloud database');
      
      // Initialize tables
      await this.createTables();
      
    } catch (err) {
      console.error('❌ Cloud database connection failed:', err.message);
      console.log('Falling back to local SQLite...');
      this.isConnected = false;
    }
  }

  async createTables() {
    if (!this.isConnected) return;

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
          display_name VARCHAR(255),
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
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (email) ON DELETE CASCADE
        )
      `);

      // Create achievements table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_achievements (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          achievement_id VARCHAR(255) NOT NULL,
          unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (email) ON DELETE CASCADE,
          UNIQUE(user_id, achievement_id)
        )
      `);

      console.log('✅ Cloud database tables created/verified');
    } catch (err) {
      console.error('❌ Error creating tables:', err);
    } finally {
      client.release();
    }
  }

  // User management
  async createUser(googleId, email, name, picture, displayName = null) {
    if (!this.isConnected) {
      throw new Error('Cloud database not connected');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO users (google_id, email, name, picture, display_name, last_login) 
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
         ON CONFLICT (google_id) DO UPDATE SET 
         email = EXCLUDED.email, 
         name = EXCLUDED.name, 
         picture = EXCLUDED.picture, 
         display_name = EXCLUDED.display_name,
         last_login = CURRENT_TIMESTAMP
         RETURNING id`,
        [googleId, email, name, picture, displayName]
      );
      return result.rows[0].id;
    } finally {
      client.release();
    }
  }

  async updateUser(googleId, email, name, picture, displayName = undefined) {
    if (!this.isConnected) {
      throw new Error('Cloud database not connected');
    }

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
  }

  async setDisplayName(userId, displayName) {
    if (!this.isConnected) {
      throw new Error('Cloud database not connected');
    }

    const client = await this.pool.connect();
    try {
      await client.query(
        'UPDATE users SET display_name = $1 WHERE id = $2',
        [displayName, userId]
      );
    } finally {
      client.release();
    }
  }

  async getUserByGoogleId(googleId) {
    if (!this.isConnected) {
      throw new Error('Cloud database not connected');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE google_id = $1',
        [googleId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getUserById(userId) {
    if (!this.isConnected) {
      throw new Error('Cloud database not connected');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Game progress management
  async saveGameProgress(email, gameState) {
    if (!this.isConnected) {
      throw new Error('Cloud database not connected');
    }

    const client = await this.pool.connect();
    try {
      // Check if user has existing progress
      const existingResult = await client.query(
        'SELECT id FROM game_progress WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
        [email]
      );

      if (existingResult.rows.length > 0) {
        // Update existing progress
        await client.query(
          'UPDATE game_progress SET game_state = $1, last_updated = CURRENT_TIMESTAMP WHERE id = $2',
          [JSON.stringify(gameState), existingResult.rows[0].id]
        );
        return existingResult.rows[0].id;
      } else {
        // Insert new progress
        const result = await client.query(
          'INSERT INTO game_progress (user_id, game_state, last_updated) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id',
          [email, JSON.stringify(gameState)]
        );
        return result.rows[0].id;
      }
    } finally {
      client.release();
    }
  }

  async getGameProgress(email) {
    if (!this.isConnected) {
      throw new Error('Cloud database not connected');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT game_state FROM game_progress WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
        [email]
      );
      return result.rows[0] ? JSON.parse(result.rows[0].game_state) : null;
    } finally {
      client.release();
    }
  }

  // Achievement management
  async saveAchievement(userId, achievementId) {
    if (!this.isConnected) {
      throw new Error('Cloud database not connected');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT (user_id, achievement_id) DO NOTHING RETURNING id',
        [userId, achievementId]
      );
      return result.rows[0]?.id;
    } finally {
      client.release();
    }
  }

  async getUserAchievements(userId) {
    if (!this.isConnected) {
      throw new Error('Cloud database not connected');
    }

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
  }

  // Leaderboard
  async getLeaderboard() {
    if (!this.isConnected) {
      throw new Error('Cloud database not connected');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        WITH latest_progress AS (
          SELECT DISTINCT ON (user_id) 
            user_id, game_state, last_updated
          FROM game_progress 
          ORDER BY user_id, id DESC
        )
        SELECT 
          u.email,
          u.name,
          u.display_name,
          u.picture,
          u.is_dummy,
          lp.game_state,
          lp.last_updated,
          array_agg(ua.achievement_id) FILTER (WHERE ua.achievement_id IS NOT NULL) as achievements
        FROM users u
        LEFT JOIN latest_progress lp ON u.email = lp.user_id
        LEFT JOIN user_achievements ua ON u.email = ua.user_id
        WHERE lp.game_state IS NOT NULL
        GROUP BY u.email, u.name, u.display_name, u.picture, u.is_dummy, lp.game_state, lp.last_updated
        ORDER BY (lp.game_state->>'cash')::numeric DESC
      `);

      return result.rows.map(row => {
        const gameState = JSON.parse(row.game_state);
        const isDummy = row.is_dummy;
        const achievements = row.achievements || [];
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
    } finally {
      client.release();
    }
  }

  calculateNetWorth(gameState) {
    const cash = gameState.cash || 0;
    const assets = gameState.assets || [];
    const totalDebt = gameState.totalDebt || 0;
    return cash + (assets.length * 100) - totalDebt;
  }

  // Health check
  async healthCheck() {
    if (!this.isConnected) {
      return { status: 'disconnected', message: 'Cloud database not connected' };
    }

    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return { status: 'healthy', message: 'Cloud database connected' };
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  }

  // Close connection
  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

module.exports = new CloudDatabase(); 