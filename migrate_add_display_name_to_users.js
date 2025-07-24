const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');

const db = new sqlite3.Database(config.database.path);

// Check if display_name column exists, and add it if not
const checkAndAddColumn = () => {
  db.get("PRAGMA table_info(users)", (err, row) => {
    if (err) throw err;
    db.all("PRAGMA table_info(users)", (err, columns) => {
      if (err) throw err;
      const hasDisplayName = columns.some(col => col.name === 'display_name');
      if (!hasDisplayName) {
        db.run("ALTER TABLE users ADD COLUMN display_name TEXT", (err) => {
          if (err) throw err;
          console.log('Added display_name column to users table.');
          db.close();
        });
      } else {
        console.log('display_name column already exists.');
        db.close();
      }
    });
  });
};

checkAndAddColumn(); 