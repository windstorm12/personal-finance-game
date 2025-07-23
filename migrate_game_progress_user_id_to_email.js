const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('game_data.db');

// Step 1: Build a map of user IDs to emails
function getUserIdToEmailMap() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, email FROM users', [], (err, rows) => {
      if (err) return reject(err);
      const map = {};
      rows.forEach(row => { map[row.id] = row.email; });
      resolve(map);
    });
  });
}

// Step 2: Update game_progress.user_id to email
async function updateGameProgressUserIds() {
  const idToEmail = await getUserIdToEmailMap();
  db.all('SELECT id, user_id FROM game_progress', [], (err, rows) => {
    if (err) throw err;
    rows.forEach(row => {
      const email = idToEmail[row.user_id];
      if (email) {
        db.run('UPDATE game_progress SET user_id = ? WHERE id = ?', [email, row.id], err2 => {
          if (err2) console.error('Error updating row', row.id, err2);
        });
      } else {
        console.warn('No email found for user_id', row.user_id);
      }
    });
    console.log('Migration started. Please check for errors above.');
  });
}

updateGameProgressUserIds(); 