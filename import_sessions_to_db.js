const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const SESSIONS_FILE = path.join(__dirname, 'sessions.json');
const db = new sqlite3.Database('game_data.db');

async function importSessionsToDb() {
  if (!fs.existsSync(SESSIONS_FILE)) {
    console.error('sessions.json not found!');
    return;
  }

  const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
  let imported = 0;

  // Drop and recreate tables
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      // Drop existing tables
      db.run('DROP TABLE IF EXISTS game_progress');
      db.run('DROP TABLE IF EXISTS user_achievements');
      db.run('DROP TABLE IF EXISTS users');

      // Create users table
      db.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          picture TEXT,
          google_id TEXT,
          is_dummy INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create game_progress table
      db.run(`
        CREATE TABLE game_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          game_state TEXT NOT NULL,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Create user_achievements table
      db.run(`
        CREATE TABLE user_achievements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          achievement_id TEXT NOT NULL,
          unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  for (const [email, state] of Object.entries(sessions)) {
    try {
      // For dummy players, create them
      if (email.startsWith('dummy_player_')) {
        // Create new dummy user
        const userId = await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO users (email, name, is_dummy, google_id) VALUES (?, ?, 1, ?)',
            [email, `Player ${email.split('_')[2]}`, `dummy_${email}`],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });
        console.log(`Created dummy player: ${email}`);

        // Add game progress
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO game_progress (user_id, game_state) VALUES (?, ?)',
            [userId, JSON.stringify(state)],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });

        // Add achievements if any
        if (state.achievements && state.achievements.unlocked) {
          for (const achievementId of state.achievements.unlocked) {
            await new Promise((resolve, reject) => {
              db.run(
                'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
                [userId, achievementId],
                function(err) {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          }
        }

        console.log(`Updated game state for dummy player: ${email}`);
        imported++;
        continue;
      }

      // For regular users, look up by email
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!user) {
        console.log(`No user found for email: ${email}, skipping.`);
        continue;
      }

      // Add game progress
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO game_progress (user_id, game_state) VALUES (?, ?)',
          [user.id, JSON.stringify(state)],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Add achievements if any
      if (state.achievements && state.achievements.unlocked) {
        for (const achievementId of state.achievements.unlocked) {
          await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
              [user.id, achievementId],
              function(err) {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }

      console.log(`Imported progress for ${email}`);
      imported++;
    } catch (err) {
      console.error(`Error importing for ${email}:`, err.message);
    }
  }

  console.log(`Imported ${imported} profiles into the database.`);
  db.close();
}

// Run the import
importSessionsToDb().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
}); 