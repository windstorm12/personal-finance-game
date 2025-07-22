const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');

const db = new sqlite3.Database(config.database.path);

// Function to update cash for a user
async function updateCash(email, newCash) {
  return new Promise((resolve, reject) => {
    // First get the user ID
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        reject(err);
        return;
      }
      if (!user) {
        reject(new Error('User not found'));
        return;
      }

      // Get current game state
      db.get('SELECT game_state FROM game_progress WHERE user_id = ? ORDER BY last_updated DESC LIMIT 1',
        [user.id],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          if (!row) {
            reject(new Error('No game progress found'));
            return;
          }

          // Parse game state and update cash
          const gameState = JSON.parse(row.game_state);
          gameState.cash = newCash;

          // Save updated game state
          db.run(
            'UPDATE game_progress SET game_state = ?, last_updated = CURRENT_TIMESTAMP WHERE user_id = ?',
            [JSON.stringify(gameState), user.id],
            function(err) {
              if (err) {
                reject(err);
                return;
              }
              console.log(`Updated cash to ${newCash} for user ${email}`);
              resolve();
            }
          );
        }
      );
    });
  });
}

// Get email from command line argument
const email = process.argv[2];
const newCash = parseInt(process.argv[3]);

if (!email || !newCash) {
  console.error('Usage: node modify_cash.js <email> <new_cash_amount>');
  process.exit(1);
}

updateCash(email, newCash)
  .then(() => {
    console.log('Successfully updated cash');
    db.close();
  })
  .catch(err => {
    console.error('Error:', err.message);
    db.close();
  }); 