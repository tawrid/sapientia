require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const os = require('os');
const app = express();
const PORT = 3000; // Set to port 3000

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

// Middleware to restrict access based on a special header
const specialID = process.env.SPECIAL_ID;

// Log an error if SPECIAL_ID is undefined
if (!specialID) {
    console.error("Error: SPECIAL_ID environment variable is not defined.");
}

// Middleware to check the special header
const specialIdMiddleware = (req, res, next) => {
    if (!specialID) {
        return res.status(500).send("Server error: Missing required configuration.");
    }

    const specialIdHeader = req.headers['x-special-id']; // Get the special ID header
    console.log('Received x-special-id:', specialIdHeader); // Log for debugging

    if (specialIdHeader === specialID) {
        next(); // Header is valid, proceed to the next middleware
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

// Endpoint to display all collected data with header restriction
app.get('/data', specialIdMiddleware, (req, res) => {
    res.json(dataStore);
});

// Start HTTP server on port 3000
http.createServer(app).listen(PORT, () => {
    console.log(`HTTP server is running on http://localhost:${PORT}`);
});
