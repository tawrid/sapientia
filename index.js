require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const os = require('os');
const app = express();
const PORT = 3000; // HTTP server port

// Memory-based storage for client data
const dataStore = [];

// Environment variables for API tokens and special header ID
const { OPENCAGE_API_KEY, IPINFO_TOKEN, SPECIAL_ID } = process.env;

// Log a warning if any required environment variables are missing
if (!OPENCAGE_API_KEY || !IPINFO_TOKEN || !SPECIAL_ID) {
    console.error("Warning: One or more environment variables (OPENCAGE_API_KEY, IPINFO_TOKEN, SPECIAL_ID) are undefined.");
}

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Pass tokens and system username to the front end via /config endpoint
app.get('/config', (req, res) => {
    res.json({
        opencageApiKey: OPENCAGE_API_KEY,
        ipinfoToken: IPINFO_TOKEN,
        systemUsername: os.userInfo().username
    });
});

// Middleware to enforce access based on 'x-special-id' header
const specialIdMiddleware = (req, res, next) => {
    const clientSpecialId = req.headers['x-special-id']; // Retrieve header value
    console.log('Received x-special-id:', clientSpecialId); // Log for debugging

    if (!SPECIAL_ID) {
        return res.status(500).send("Server configuration error: SPECIAL_ID not set.");
    }

    if (clientSpecialId === SPECIAL_ID) {
        return next(); // Header is valid, proceed
    } else {
        return res.status(403).send('Access denied: Invalid access credentials.');
    }
};

// Endpoint to collect client data and store it in memory
app.post('/collect', (req, res) => {
    const clientData = req.body;
    console.log('Data received:', clientData);

    // Save the data in the in-memory "database"
    dataStore.push(clientData);
    res.status(200).send('Data collected successfully!');
});

// Restricted endpoint to view all collected data, accessible only with the correct header
app.get('/data', specialIdMiddleware, (req, res) => {
    res.json(dataStore);
});

// Start the HTTP server on the specified port
http.createServer(app).listen(PORT, () => {
    console.log(`HTTP server is running on http://localhost:${PORT}`);
});
