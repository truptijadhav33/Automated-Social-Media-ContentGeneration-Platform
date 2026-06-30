const express = require('express');
const router = express.Router();
const axios = require('axios');
const validateGenerate = require('../middleware/validateGenerate');
const GeneratedContent = require('../models/GeneratedContent');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.post('/generate', validateGenerate, async (req, res) => {
  try {
    const { briefId, platforms, tone } = req.body;

    const featureBrief = req.body.featureBrief || {};

    const start = Date.now();
    const response = await axios.post(`${AI_SERVICE_URL}/generate-captions`, {
      briefId,
      featureName: featureBrief.featureName || '',
      description: featureBrief.description || '',
      keyBenefit: featureBrief.keyBenefit || '',
      platforms,
      tone: tone || 'informative',
    });
    const elapsed = Date.now() - start;
    console.log(`[Groq] ${platforms[0]} caption generated in ${elapsed}ms`);

    const data = response.data.data;

    const saved = await GeneratedContent.create({
      briefId,
      platform: platforms[0],
      caption: data.caption,
      hashtags: data.hashtags || [],
      variants: data.variants || [],
      charCount: data.char_count,
    });

    res.status(201).json({
      message: 'Content generated',
      data: {
        caption: saved.caption,
        hashtags: saved.hashtags,
        variants: saved.variants,
        charCount: saved.charCount,
      },
    });
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({ error: err.response.data.detail || 'AI service error' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.put('/:contentId/select-variant', async (req, res) => {
  try {
    const { variantIndex } = req.body;
    const doc = await GeneratedContent.findById(req.params.contentId);
    if (!doc) return res.status(404).json({ error: 'Content not found' });

    if (variantIndex === -1) {
      // keep original caption
    } else if (
      typeof variantIndex === 'number' &&
      variantIndex >= 0 &&
      variantIndex < doc.variants.length
    ) {
      doc.caption = doc.variants[variantIndex];
    } else {
      return res.status(400).json({ error: 'Invalid variantIndex' });
    }

    await doc.save();
    res.json({ message: 'Variant selected', data: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:contentId/status', async (req, res) => {
  try {
    const { status, scheduledFor } = req.body;
    const valid = ['draft', 'published', 'scheduled'];
    if (!valid.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${valid.join(', ')}`,
      });
    }

    const doc = await GeneratedContent.findById(req.params.contentId);
    if (!doc) return res.status(404).json({ error: 'Content not found' });

    doc.publishStatus = status;

    if (status === 'published') {
      doc.publishedAt = new Date();
      doc.scheduledFor = undefined;
    } else if (status === 'scheduled') {
      if (!scheduledFor) {
        return res.status(400).json({ error: 'scheduledFor is required when status is "scheduled"' });
      }
      doc.scheduledFor = new Date(scheduledFor);
      doc.publishedAt = undefined;
    } else {
      doc.publishedAt = undefined;
      doc.scheduledFor = undefined;
    }

    await doc.save();
    res.json({ message: 'Status updated', data: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
