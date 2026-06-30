const express = require('express');
const router = express.Router();
const validateBrief = require('../middleware/validateBrief');
const GeneratedContent = require('../models/GeneratedContent');

router.post('/', validateBrief, async (req, res) => {
  res.status(201).json({ message: 'Brief created', brief: req.body });
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
