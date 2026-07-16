const express = require('express');
const FeatureBrief = require('../models/FeatureBrief');
const GeneratedContent = require('../models/GeneratedContent');
const validateInputs = require('../middleware/inputValidation');
const router = express.Router();

router.post('/', validateInputs, async (req, res) => {
  try {
    const { featureName, description, keyBenefit, platforms, tone } = req.body;

    const brief = new FeatureBrief({
      userId: req.user.id,
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
    const briefs = await FeatureBrief.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ briefs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:briefId/content', async (req, res) => {
  try {
    const brief = await FeatureBrief.findOne({
      _id: req.params.briefId,
      userId: req.user.id,
    });

    if (!brief) {
      return res.status(404).json({ error: 'Brief not found' });
    }

    const content = await GeneratedContent.find({ briefId: req.params.briefId });

    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
