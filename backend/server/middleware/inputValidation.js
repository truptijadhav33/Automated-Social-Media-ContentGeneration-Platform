const VALID_PLATFORMS = ['linkedin', 'twitter', 'instagram', 'whatsapp'];
const VALID_TONES = ['professional', 'hype', 'informative', 'casual'];
const MAX_LENGTHS = { featureName: 100, description: 1000, keyBenefit: 200 };

const SQL_KEYWORDS = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|UNION|EXEC|EXECUTE|MERGE|CREATE|REPLACE)\b/i;

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '');
}

function containsSqlInjection(str) {
  const cleaned = stripHtml(str);
  return SQL_KEYWORDS.test(cleaned);
}

function validateInputs(req, res, next) {
  const errors = [];
  const suspicious = [];

  for (const field of ['featureName', 'description', 'keyBenefit', 'platforms', 'tone']) {
    if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
      errors.push(`${field} is required`);
    }
  }

  if (errors.length > 0) {
    console.warn(`[INPUT-VALIDATION] Missing fields from IP ${req.ip}: ${errors.join(', ')}`);
    return res.status(400).json({ error: errors.join('; ') });
  }

  for (const field of ['featureName', 'description', 'keyBenefit']) {
    const raw = String(req.body[field]);
    const trimmed = raw.trim();
    const cleaned = stripHtml(trimmed);

    if (cleaned.length > MAX_LENGTHS[field]) {
      errors.push(`${field} must be at most ${MAX_LENGTHS[field]} characters (got ${cleaned.length})`);
    }

    if (containsSqlInjection(raw)) {
      suspicious.push(field);
    }

    if (raw !== cleaned) {
      console.warn(`[INPUT-VALIDATION] HTML stripped from ${field} — IP: ${req.ip}`);
    }

    req.body[field] = cleaned;
  }

  if (suspicious.length > 0) {
    console.warn(`[INPUT-VALIDATION] SQL keywords detected in ${suspicious.join(', ')} from IP ${req.ip}`);
  }

  if (!Array.isArray(req.body.platforms) || req.body.platforms.length === 0) {
    errors.push('platforms must be a non-empty array');
  } else {
    for (const platform of req.body.platforms) {
      if (!VALID_PLATFORMS.includes(platform)) {
        errors.push(`invalid platform: "${platform}". Allowed: ${VALID_PLATFORMS.join(', ')}`);
      }
    }
  }

  if (!VALID_TONES.includes(req.body.tone)) {
    errors.push(`invalid tone: "${req.body.tone}". Allowed: ${VALID_TONES.join(', ')}`);
  }

  if (errors.length > 0) {
    console.warn(`[INPUT-VALIDATION] Rejected input from IP ${req.ip}: ${errors.join('; ')}`);
    return res.status(400).json({ error: errors.join('; ') });
  }

  next();
}

module.exports = validateInputs;
