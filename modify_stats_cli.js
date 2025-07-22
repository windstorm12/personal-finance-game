const { exportStatsToCSV, importStatsFromCSV } = require('./modify_stats');

const command = process.argv[2];
const csvPath = process.argv[3];

async function main() {
  try {
    if (command === 'export') {
      const outputPath = await exportStatsToCSV();
      console.log(`Stats exported to ${outputPath}`);
      console.log('You can now edit the CSV file and use the import command to update the stats');
      console.log('\nThe CSV file contains these columns:');
      console.log('- Player: The player\'s email or ID');
      console.log('- Stat: The name of the stat to modify');
      console.log('- Value: The new value for that stat');
      console.log('\nValid stat names are:');
      console.log('- cash: Player\'s money');
      console.log('- stress: Current stress level (0-100)');
      console.log('- totalDebt: Total debt amount');
      console.log('- finance_skill: Finance skill level (0-100)');
      console.log('- social_skill: Social skill level (0-100)');
      console.log('- hustling_skill: Hustling skill level (0-100)');
      console.log('- health_skill: Health skill level (0-100)');
      console.log('- creditScore: Credit score (0-850)');
      console.log('- income: Weekly income');
    } else if (command === 'import') {
      if (!csvPath) {
        console.error('Please provide the CSV file path');
        process.exit(1);
      }
      await importStatsFromCSV(csvPath);
      console.log('Stats updated successfully');
    } else {
      console.log('Usage:');
      console.log('  Export all players\' stats: node modify_stats_cli.js export');
      console.log('  Import stats: node modify_stats_cli.js import <csv_file>');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main(); 