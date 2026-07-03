const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { model, temperature, systemPrompt, maxTokens } = req.body;
    const updates = {};
    if (model) updates['preferences.model'] = model;
    if (temperature !== undefined) updates['preferences.temperature'] = temperature;
    if (systemPrompt !== undefined) updates['preferences.systemPrompt'] = systemPrompt;
    if (maxTokens !== undefined) updates['preferences.maxTokens'] = maxTokens;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
