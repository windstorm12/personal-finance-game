const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');

const db = new sqlite3.Database('game_data.db');

fs.createReadStream('game_progress.csv')
  .pipe(csv())
  .on('data', (row) => {
    db.run(
      'INSERT OR REPLACE INTO game_progress (id, user_id, game_state, last_updated) VALUES (?, ?, ?, ?)',
      [row.ID, row.UserID, row.GameState, row.LastUpdated]
    );
  })
  .on('end', () => {
    console.log('game_progress.csv file successfully imported');
    db.close();
  }); 