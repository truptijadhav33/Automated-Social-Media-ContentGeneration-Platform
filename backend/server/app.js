const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (to be added later)
// app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
