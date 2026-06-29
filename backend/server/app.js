const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const tempAuth = require('./middleware/tempAuth');
app.use('/api', tempAuth);

app.use('/api/content', require('./routes/content'));
app.use('/api/briefs', require('./routes/briefs'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
