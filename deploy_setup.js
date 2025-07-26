const RailwayDeploy = require('./railway_deploy');
const DatabaseBackup = require('./database_backup');
const fs = require('fs');
const path = require('path');

async function setupDeployment() {
  console.log('Starting deployment setup...');
  
  const railway = new RailwayDeploy();
  const backup = new DatabaseBackup();
  
  try {
    // Set up Railway persistent storage
    console.log('Setting up Railway persistent storage...');
    await railway.setupPersistentStorage();
    
    // Create initial backup
    console.log('Creating initial backup...');
    await railway.backupToPersistent();
    
    // Export to CSV for manual backup
    console.log('Creating CSV export...');
    await railway.exportToCSV();
    
    console.log('Deployment setup completed successfully!');
  } catch (err) {
    console.error('Deployment setup failed:', err);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDeployment();
}

module.exports = { setupDeployment }; 