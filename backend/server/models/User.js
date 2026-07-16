const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const preferenceSchema = new mongoose.Schema({
    model: {
    type: String,
    enum: ['llama-3.3-70b-versatile'],
    default: 'llama-3.3-70b-versatile',
  },
  temperature: {
    type: Number,
    min: 0.0,
    max: 1.0,
    default: 0.7,
  },
  systemPrompt: {
    type: String,
    default: 'You are a social media expert. Write engaging, platform-optimized posts.',
  },
  maxTokens: {
    type: Number,
    default: 500,
  },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  preferences: {
    type: preferenceSchema,
    default: () => ({}),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
