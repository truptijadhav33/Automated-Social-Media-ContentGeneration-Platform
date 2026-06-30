const VALID_PLATFORMS = ['linkedin', 'twitter', 'instagram', 'whatsapp'];
const VALID_TONES = ['professional', 'hype', 'informative', 'casual'];
const MAX_LENGTHS = { featureName: 100, description: 1000, keyBenefit: 200 };
const STRING_FIELDS = ['featureName', 'description', 'keyBenefit'];

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '');
}

function validateBrief(req, res, next) {
  for (const field of ['featureName', 'description', 'keyBenefit', 'platforms', 'tone']) {
    if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
      return res.status(400).json({ error: `${field} is required` });
    }
  }

  for (const field of STRING_FIELDS) {
    const trimmed = String(req.body[field]).trim();
    const cleaned = stripHtml(trimmed);
    if (cleaned.length > MAX_LENGTHS[field]) {
      return res.status(400).json({
        error: `${field} must be at most ${MAX_LENGTHS[field]} characters`
      });
    }
    req.body[field] = cleaned;
  }

  if (!Array.isArray(req.body.platforms) || req.body.platforms.length === 0) {
    return res.status(400).json({ error: 'platforms must be a non-empty array' });
  }

  for (const platform of req.body.platforms) {
    if (!VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({
        error: `invalid platform: "${platform}". Allowed: ${VALID_PLATFORMS.join(', ')}`
      });
    }
  }

  if (!VALID_TONES.includes(req.body.tone)) {
    return res.status(400).json({
      error: `invalid tone: "${req.body.tone}". Allowed: ${VALID_TONES.join(', ')}`
    });
  }

  next();
}

module.exports = validateBrief;
