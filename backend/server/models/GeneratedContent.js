const mongoose = require('mongoose');

const GeneratedContentSchema = new mongoose.Schema({
  briefId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeatureBrief',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['linkedin', 'twitter', 'instagram', 'whatsapp'],
    required: true
  },
  caption: {
    type: String,
    required: true
  },
  hashtags: [String],
  charCount: Number,
  variants: [String],
  imageUrl: String,
  publishStatus: {
    type: String,
    enum: ['draft', 'published', 'scheduled'],
    default: 'draft'
  },
  publishedAt: Date,
  scheduledFor: Date,
  apiResponse: mongoose.Schema.Types.Mixed,
  publishResult: {
    platformPostId: String,
    platformUrl: String,
    error: String,
    publishedAt: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

GeneratedContentSchema.index({ briefId: 1 });
GeneratedContentSchema.index({ userId: 1 });
GeneratedContentSchema.index({ publishStatus: 1 });

module.exports = mongoose.model('GeneratedContent', GeneratedContentSchema);
