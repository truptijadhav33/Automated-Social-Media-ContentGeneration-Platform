const mongoose = require('mongoose');

const FeatureBriefSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  featureName: {
    type: String,
    required: true
  },
  description: String,
  keyBenefit: String,
  screenshotUrls: [String],
  platforms: [
    {
      type: String,
      enum: ['linkedin', 'twitter', 'instagram', 'whatsapp']
    }
  ],
  tone: {
    type: String,
    enum: ['professional', 'hype', 'informative', 'casual'],
    default: 'professional'
  },
  visualFormats: [String],
  callToAction: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FeatureBrief', FeatureBriefSchema);
