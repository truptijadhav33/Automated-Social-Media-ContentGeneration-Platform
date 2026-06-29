const express = require('express');
const FeatureBrief = require('../models/FeatureBrief');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { featureName, description, keyBenefit, platforms, tone } = req.body;

    if (!featureName) {
      return res.status(400).json({ error: 'featureName is required' });
    }

    const brief = new FeatureBrief({
      userId: req.user?.id || 'temp-user-001',
      featureName,
      description,
      keyBenefit,
      platforms: platforms || [],
      tone: tone || 'professional',
    });

    await brief.save();

    res.status(201).json({
      briefId: brief._id,
      message: 'Brief created',
    });
  } catch (error) {
    console.error('Error creating brief:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const briefs = await FeatureBrief.find().sort({ createdAt: -1 });
    res.json({ briefs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
