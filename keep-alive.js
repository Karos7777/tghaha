const https = require('https');
require('dotenv').config();

// URL of your Glitch project
const url = process.env.WEBAPP_URL || 'https://your-app-url.glitch.me';

// Function to ping the server
function pingServer() {
  console.log(`Pinging ${url} to keep it alive...`);
  
  https.get(url, (res) => {
    const { statusCode } = res;
    
    if (statusCode === 200) {
      console.log(`Ping successful! Status code: ${statusCode}`);
    } else {
      console.error(`Ping failed with status code: ${statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`Error pinging server: ${err.message}`);
  });
}

// Ping every 5 minutes (300000 ms)
// Glitch free tier has a 1-hour sleep timer
const PING_INTERVAL = 5 * 60 * 1000;

// Initial ping
pingServer();

// Set up interval for regular pings
setInterval(pingServer, PING_INTERVAL);

console.log(`Keep-alive service started. Pinging ${url} every ${PING_INTERVAL/1000/60} minutes.`);
