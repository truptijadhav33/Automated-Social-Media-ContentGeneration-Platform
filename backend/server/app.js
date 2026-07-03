const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiters
const { globalLimiter, contentGenLimiter, loginLimiter, logHit } = require('./middleware/rateLimit');

// Global rate limit on all /api routes
app.use('/api', globalLimiter, logHit('global'));

// Login rate limit (before tempAuth so IP-based, not user-based)
app.use('/api/auth/login', loginLimiter, logHit('login'));

// Routes — auth before tempAuth so register/login aren't blocked
app.use('/api/auth', require('./routes/auth'));

const tempAuth = require('./middleware/tempAuth');
app.use('/api', tempAuth);

// Content generation rate limit (per user, applied after auth)
app.use('/api/content/generate', contentGenLimiter, logHit('contentGen'));

app.use('/api/content', require('./routes/content'));
app.use('/api/briefs', require('./routes/briefs'));
app.use('/api/settings', require('./routes/settings'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
