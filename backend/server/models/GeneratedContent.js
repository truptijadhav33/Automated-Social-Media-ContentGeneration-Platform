const mongoose = require('mongoose');

const generatedContentSchema = new mongoose.Schema({
  briefId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brief',
    required: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ['linkedin', 'twitter', 'instagram', 'whatsapp'],
  },
  caption: {
    type: String,
    required: true,
  },
  hashtags: [String],
  variants: [String],
  charCount: Number,
  publishStatus: {
    type: String,
    enum: ['draft', 'published', 'scheduled'],
    default: 'draft',
  },
  publishedAt: Date,
  scheduledFor: Date,
}, { timestamps: true });

module.exports = mongoose.model('GeneratedContent', generatedContentSchema);
