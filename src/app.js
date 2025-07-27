require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes'); // Main router

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// API Routes
app.use('/api', apiRoutes);

// Simple health check route
app.get('/', (req, res) => {
  res.send('Sweet Spot Backend is running!');
});

// Basic 404 handler
// app.use((req, res, next) => {
//   res.status(404).json({ message: 'Not Found' });
// });

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

module.exports = app;