const sqlite3 = require('sqlite3').verbose();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const db = new sqlite3.Database('game_data.db');

const csvWriter = createCsvWriter({
  path: 'game_progress.csv', // Output file
  header: [
    {id: 'id', title: 'ID'},
    {id: 'user_id', title: 'UserID'},
    {id: 'game_state', title: 'GameState'},
    {id: 'last_updated', title: 'LastUpdated'}
  ]
});

db.all('SELECT id, user_id, game_state, last_updated FROM game_progress', [], (err, rows) => {
  if (err) throw err;
  csvWriter.writeRecords(rows).then(() => {
    console.log('game_progress.csv file was written successfully');
    db.close();
  });
}); 