const mongoose = require('mongoose');

const VALID_PLATFORMS = ['linkedin', 'twitter', 'instagram', 'whatsapp'];
const VALID_TONES = ['professional', 'hype', 'informative', 'casual'];

function validateGenerate(req, res, next) {
  const { briefId, platforms, tone } = req.body;

  if (!briefId || typeof briefId !== 'string' || !mongoose.Types.ObjectId.isValid(briefId)) {
    return res.status(400).json({ error: 'briefId is required and must be a valid ObjectId' });
  }

  if (!Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({ error: 'platforms must be a non-empty array' });
  }

  for (const platform of platforms) {
    if (!VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({
        error: `invalid platform: "${platform}". Allowed: ${VALID_PLATFORMS.join(', ')}`
      });
    }
  }

  if (tone !== undefined && tone !== null && tone !== '') {
    if (!VALID_TONES.includes(tone)) {
      return res.status(400).json({
        error: `invalid tone: "${tone}". Allowed: ${VALID_TONES.join(', ')}`
      });
    }
  }

  next();
}

module.exports = validateGenerate;
