const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes — auth before tempAuth so register/login aren't blocked
app.use('/api/auth', require('./routes/auth'));

const tempAuth = require('./middleware/tempAuth');
app.use('/api', tempAuth);

app.use('/api/content', require('./routes/content'));
app.use('/api/briefs', require('./routes/briefs'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
