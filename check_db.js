const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('game_data.db');

// Check schema
db.serialize(() => {
  // List all tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('Error getting tables:', err);
      return;
    }
    console.log('Tables in database:', tables.map(t => t.name));

    // For each table, show its schema
    tables.forEach(table => {
      db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
        if (err) {
          console.error(`Error getting schema for ${table.name}:`, err);
          return;
        }
        console.log(`\nSchema for ${table.name}:`);
        columns.forEach(col => {
          console.log(`  ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}`);
        });
      });
    });
  });
});

// Close the database connection after 1 second to ensure all queries complete
setTimeout(() => db.close(), 1000); 