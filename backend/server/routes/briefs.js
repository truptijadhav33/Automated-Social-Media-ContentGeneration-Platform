const express = require('express');
const FeatureBrief = require('../models/FeatureBrief');
const GeneratedContent = require('../models/GeneratedContent');
const validateBrief = require('../middleware/validateBrief');
const router = express.Router();

router.post('/', validateBrief, async (req, res) => {
  try {
    const { featureName, description, keyBenefit, platforms, tone } = req.body;

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

router.get('/:briefId/content', async (req, res) => {
  try {
    const docs = await GeneratedContent.find({ briefId: req.params.briefId });
    res.json({ data: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
