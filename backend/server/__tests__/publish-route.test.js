const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

const authMiddleware = require('../middleware/auth');

jest.mock('../models/GeneratedContent', () => {
  const mockSave = jest.fn();
  const MockDoc = function (data) {
    Object.assign(this, data);
    this.save = mockSave;
  };
  MockDoc.findById = jest.fn();
  MockDoc.mockSave = mockSave;
  return MockDoc;
});

jest.mock('../models/FeatureBrief', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../services/publishService', () => ({
  publish: jest.fn(),
}));

const GeneratedContent = require('../models/GeneratedContent');
const { publish } = require('../services/publishService');

const app = express();
app.use(express.json());
app.use('/api/content', authMiddleware, require('../routes/content'));

function makeToken(userId = 'user123') {
  return jwt.sign({ id: userId, email: 'test@test.com', name: 'Test' }, JWT_SECRET, { expiresIn: '1h' });
}

function mockDoc(overrides = {}) {
  const mockSave = jest.fn();
  return {
    _id: 'content1',
    userId: 'user123',
    platform: 'twitter',
    caption: 'Hello world',
    hashtags: ['test'],
    publishStatus: 'draft',
    publishedAt: null,
    scheduledFor: null,
    publishResult: null,
    save: mockSave,
    ...overrides,
  };
}

describe('POST /api/content/:contentId/publish', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/content/abc123/publish');
    expect(res.status).toBe(401);
  });

  it('returns 404 for invalid contentId', async () => {
    GeneratedContent.findById.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/content/000000000000000000000000/publish')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 403 if user does not own content', async () => {
    const doc = mockDoc({ userId: 'other-user' });
    GeneratedContent.findById.mockResolvedValue(doc);

    const res = await request(app)
      .post('/api/content/content1/publish')
      .set('Authorization', `Bearer ${makeToken('user123')}`);

    expect(res.status).toBe(403);
  });

  it('returns 500 when publish fails', async () => {
    const doc = mockDoc();
    GeneratedContent.findById.mockResolvedValue(doc);
    publish.mockRejectedValue(new Error('Twitter API error'));

    const res = await request(app)
      .post('/api/content/content1/publish')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Twitter API error');
    expect(doc.publishResult.error).toBe('Twitter API error');
    expect(doc.save).toHaveBeenCalled();
  });

  it('returns 200 and saves publishResult on success', async () => {
    const doc = mockDoc();
    GeneratedContent.findById.mockResolvedValue(doc);
    publish.mockResolvedValue({
      success: true,
      platformPostId: '999999',
      platformUrl: 'https://twitter.com/i/status/999999',
    });

    const res = await request(app)
      .post('/api/content/content1/publish')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.publishResult.platformPostId).toBe('999999');
    expect(res.body.publishResult.platformUrl).toBe('https://twitter.com/i/status/999999');
    expect(doc.save).toHaveBeenCalled();
    expect(doc.publishStatus).toBe('published');
  });
});
