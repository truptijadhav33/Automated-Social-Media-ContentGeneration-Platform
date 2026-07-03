const rateLimit = require('express-rate-limit');

const logHit = (limiterName) => (req, res, next) => {
  res.on('close', () => {
    if (res.statusCode === 429) {
      console.warn(`[RATE-LIMIT] ${limiterName} exceeded — IP: ${req.ip}, User: ${req.user?.id || 'anonymous'}`);
    }
  });
  next();
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too Many Requests', detail: 'You have exceeded the request limit. Try again later.' },
});

const contentGenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.id || req.ip,
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too Many Requests', detail: 'You can generate 5 times per hour' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too Many Requests', detail: 'Too many login attempts, please try again later' },
});

module.exports = { globalLimiter, contentGenLimiter, loginLimiter, logHit };
