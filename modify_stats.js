const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database('game_data.db');

// Function to export all players' stats to CSV
async function exportStatsToCSV() {
  return new Promise((resolve, reject) => {
    // Get all players' game states from database
    db.all('SELECT email, game_state FROM users', [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        // Create CSV with all players' stats
        const csvWriter = createCsvWriter({
          path: 'all_players_stats.csv',
          header: [
            { id: 'player', title: 'Player' },
            { id: 'stat', title: 'Stat' },
            { id: 'value', title: 'Value' }
          ]
        });

        const records = [];
        
        // For each player in database
        rows.forEach(row => {
          const player = row.email;
          const gameState = JSON.parse(row.game_state);

          // Add each stat for this player
          records.push(
            { player, stat: 'cash', value: gameState.cash || 0 },
            { player, stat: 'stress', value: gameState.stress || 0 },
            { player, stat: 'totalDebt', value: gameState.totalDebt || 0 },
            { player, stat: 'finance_skill', value: gameState.skills?.finance || 0 },
            { player, stat: 'social_skill', value: gameState.skills?.social || 0 },
            { player, stat: 'hustling_skill', value: gameState.skills?.hustling || 0 },
            { player, stat: 'health_skill', value: gameState.skills?.health || 0 },
            { player, stat: 'creditScore', value: gameState.creditScore || 0 },
            { player, stat: 'income', value: gameState.income || 0 }
          );
        });

        csvWriter.writeRecords(records)
          .then(() => {
            console.log('All players\' stats exported to all_players_stats.csv');
            resolve('all_players_stats.csv');
          })
          .catch(error => reject(error));

      } catch (error) {
        reject(error);
      }
    });
  });
}

// Function to import and update stats from CSV
async function importStatsFromCSV(csvPath) {
  return new Promise((resolve, reject) => {
    try {
      // Create backup of database
      fs.copyFileSync('game_data.db', 'game_data.db.bak');

      // Group stats by player
      const playerStats = {};
      
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          const player = row.Player;
          const stat = row.Stat;
          const value = parseFloat(row.Value);

          if (!playerStats[player]) {
            playerStats[player] = {};
          }
          playerStats[player][stat] = value;
        })
        .on('end', () => {
          // Update each player's stats in database
          const updatePromises = Object.entries(playerStats).map(([player, stats]) => {
            return new Promise((resolveUpdate, rejectUpdate) => {
              // First get current game state
              db.get('SELECT game_state FROM users WHERE email = ?', [player], (err, row) => {
                if (err) {
                  rejectUpdate(err);
                  return;
                }
                if (!row) {
                  console.warn(`Warning: Player ${player} not found in database, skipping...`);
                  resolveUpdate();
                  return;
                }

                const gameState = JSON.parse(row.game_state);

                // Update game state with new values
                if ('cash' in stats) gameState.cash = stats.cash;
                if ('stress' in stats) gameState.stress = stats.stress;
                if ('totalDebt' in stats) gameState.totalDebt = stats.totalDebt;
                if ('creditScore' in stats) gameState.creditScore = stats.creditScore;
                if ('income' in stats) gameState.income = stats.income;

                // Update skills
                if (!gameState.skills) gameState.skills = {};
                if ('finance_skill' in stats) gameState.skills.finance = stats.finance_skill;
                if ('social_skill' in stats) gameState.skills.social = stats.social_skill;
                if ('hustling_skill' in stats) gameState.skills.hustling = stats.hustling_skill;
                if ('health_skill' in stats) gameState.skills.health = stats.health_skill;

                // Save updated game state back to database
                db.run(
                  'UPDATE users SET game_state = ? WHERE email = ?',
                  [JSON.stringify(gameState), player],
                  function(err) {
                    if (err) {
                      rejectUpdate(err);
                      return;
                    }
                    resolveUpdate();
                  }
                );
              });
            });
          });

          // Wait for all updates to complete
          Promise.all(updatePromises)
            .then(() => {
              console.log('Updated game stats for all players in database');
              resolve();
            })
            .catch(error => reject(error));
        });
    } catch (error) {
      reject(error);
    }
  });
}

// Export functions
module.exports = {
  exportStatsToCSV,
  importStatsFromCSV
};