const express = require('express');
const axios = require('axios');
const GeneratedContent = require('../models/GeneratedContent');
const User = require('../models/User');
const validateGenerate = require('../middleware/validateGenerate');
const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.post('/generate', validateGenerate, async (req, res) => {
  try {
    const { briefId, tone, platforms } = req.body;

    const FeatureBrief = require('../models/FeatureBrief');
    const brief = await FeatureBrief.findById(briefId);

    if (!brief) {
      return res.status(404).json({
        success: false,
        error: 'Feature brief not found',
      });
    }

    const user = await User.findById(req.user.id).select('preferences');
    const prefs = user?.preferences || {};

    const results = {};

    const captionPromises = platforms.map(async (platform) => {
      const start = Date.now();
      try {
        const response = await axios.post(
          `${AI_SERVICE_URL}/generate-captions`,
          {
            feature_name: brief.featureName,
            description: brief.description,
            key_benefit: brief.keyBenefit,
            tone: tone || brief.tone,
            platform: platform,
            model: prefs.model || 'llama-3.3-70b-versatile',
            temperature: prefs.temperature ?? 0.7,
            max_tokens: prefs.maxTokens || 500,
            system_prompt: prefs.systemPrompt || null,
          },
          { timeout: 30000 }
        );
        const elapsed = Date.now() - start;
        console.log(`[Groq] ${platform} caption generated in ${elapsed}ms`);

        if (response.data.success) {
          results[platform] = response.data.data;

          const content = new GeneratedContent({
            briefId: briefId,
            userId: req.user.id,
            platform: platform,
            caption: response.data.data.caption,
            hashtags: response.data.data.hashtags,
            charCount: response.data.data.char_count,
            variants: response.data.data.variants,
            apiResponse: response.data.data,
            publishStatus: 'draft',
          });

          await content.save();
        }
      } catch (error) {
        const errMsg = error.message || error.code || JSON.stringify(error) || 'unknown';
        const errDetail = error.response?.data || error.cause || '';
        console.error(`Error generating ${platform} caption:`, errMsg, errDetail);
        results[platform] = { error: errMsg };
      }
    });

    await Promise.all(captionPromises);

    res.json({
      success: true,
      briefId: briefId,
      captions: results,
      message: 'Captions generated and saved',
    });
  } catch (error) {
    console.error('Error in /generate:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/:briefId', async (req, res) => {
  try {
    const content = await GeneratedContent.find({ briefId: req.params.briefId });
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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

    doc.updatedAt = new Date();
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

    doc.updatedAt = new Date();
    await doc.save();
    res.json({ message: 'Status updated', data: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
