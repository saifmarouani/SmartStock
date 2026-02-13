require('dotenv').config(); // Load settings from .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db'); // Load your DB connection file

const app = express();

// --- 1. CONNECT TO DATABASE ---
connectDB(); 

// --- 2. MIDDLEWARE (The Gatekeepers) ---
app.use(express.json()); // Allows the server to read JSON data (IMPORTANT)
app.use(cors());         // Allows browser communication
app.use(express.static(path.join(__dirname, 'public'))); // Serves HTML/CSS/JS files

// --- 3. API ROUTES (The Backend Logic) ---
// Auth Routes (Login/Register)
app.use('/api/auth', require('./routes/auth'));

// Data Routes (Warehouses/Items) - NEW!
app.use('/api/data', require('./routes/api'));

// --- 4. PAGE ROUTES (Navigation) ---
// If user goes to "http://localhost:3000/", show Login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// If user types "http://localhost:3000/dashboard"
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// --- 5. START THE SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server is running!`);
    console.log(`👉 Open your browser at: http://localhost:${PORT}\n`);
});