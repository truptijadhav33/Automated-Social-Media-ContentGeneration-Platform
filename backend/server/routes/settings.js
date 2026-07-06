const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email preferences');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ name: user.name, email: user.email, preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { preferences } = req.body;
    if (!preferences) {
      return res.status(400).json({ error: 'preferences object is required' });
    }

    const errors = [];
    if (preferences.model !== undefined && preferences.model !== 'llama-3.3-70b-versatile') {
      errors.push('model must be "llama-3.3-70b-versatile"');
    }
    if (preferences.temperature !== undefined) {
      if (typeof preferences.temperature !== 'number' || preferences.temperature < 0.0 || preferences.temperature > 1.0) {
        errors.push('temperature must be a number between 0.0 and 1.0');
      }
    }
    if (preferences.maxTokens !== undefined) {
      if (typeof preferences.maxTokens !== 'number' || preferences.maxTokens < 100 || preferences.maxTokens > 1000) {
        errors.push('maxTokens must be a number between 100 and 1000');
      }
    }
    if (errors.length) {
      return res.status(400).json({ error: errors.join('; ') });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Settings saved', preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
