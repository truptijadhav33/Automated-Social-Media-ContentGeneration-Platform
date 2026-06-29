const express = require('express');
const axios = require('axios');
const GeneratedContent = require('../models/GeneratedContent');
const router = express.Router();

const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';

router.post('/generate', async (req, res) => {
  try {
    const { briefId, tone, platforms } = req.body;

    if (!briefId || !platforms || platforms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'briefId and platforms are required'
      });
    }

    const FeatureBrief = require('../models/FeatureBrief');
    const brief = await FeatureBrief.findById(briefId);

    if (!brief) {
      return res.status(404).json({
        success: false,
        error: 'Feature brief not found'
      });
    }

    const results = {};

    const captionPromises = platforms.map(async (platform) => {
      try {
        const response = await axios.post(
          `${PYTHON_AI_SERVICE_URL}/generate-captions`,
          {
            feature_name: brief.featureName,
            description: brief.description,
            key_benefit: brief.keyBenefit,
            tone: tone || brief.tone,
            platform: platform
          },
          { timeout: 30000 }
        );

        if (response.data.success) {
          results[platform] = response.data.data;

          const content = new GeneratedContent({
            briefId: briefId,
            userId: req.user?.id || 'temp-user-001',
            platform: platform,
            caption: response.data.data.caption,
            hashtags: response.data.data.hashtags,
            charCount: response.data.data.char_count,
            variants: response.data.data.variants,
            apiResponse: response.data.data,
            publishStatus: 'draft'
          });

          await content.save();
        }
      } catch (error) {
        console.error(`Error generating ${platform} caption:`, error.message);
        results[platform] = {
          error: error.message
        };
      }
    });

    await Promise.all(captionPromises);

    res.json({
      success: true,
      briefId: briefId,
      captions: results,
      message: 'Captions generated and saved'
    });

  } catch (error) {
    console.error('Error in /generate:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:briefId', async (req, res) => {
  try {
    const content = await GeneratedContent.find({ briefId: req.params.briefId });

    res.json({
      success: true,
      content: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
