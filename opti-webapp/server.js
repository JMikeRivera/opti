import express from 'express';
import fs from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// For any other routes, send back the index.html file from the Vite build directory
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// SSL options
const options = {
  key: fs.readFileSync('C:\\SSLcert\\optiscportal.com_key.txt'),
  cert: fs.readFileSync('C:\\SSLcert\\optiscportal.com.crt'),
  ca: fs.readFileSync('C:\\SSLcert\\optiscportal.com.ca-bundle')
};

// Start HTTP server
http.createServer(app).listen(80, () => {
  console.log('HTTP server running on port 80');
});

// Start HTTPS server
https.createServer(options, app).listen(443, () => {
  console.log('HTTPS server running on port 443');
});
