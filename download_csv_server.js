const express = require('express');
const app = express();
const path = require('path');
const port = process.env.DOWNLOAD_PORT || 3001;

app.get('/download', (req, res) => {
  const filePath = path.join(__dirname, 'game_progress.csv');
  res.download(filePath, (err) => {
    if (err) {
      res.status(404).send('File not found or error downloading.');
    }
  });
});

app.listen(port, () => {
  console.log(`CSV download server running on port ${port}`);
  console.log(`Visit http://localhost:${port}/download to download the CSV file.`);
}); 