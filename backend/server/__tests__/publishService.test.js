const { publish, platformConfigs } = require('../services/publishService');
const axios = require('axios');

jest.mock('axios');

describe('publishService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('publishToTwitter', () => {
    it('throws when TWITTER_BEARER_TOKEN is missing', async () => {
      delete process.env.TWITTER_BEARER_TOKEN;
      await expect(
        publish('twitter', { caption: 'Hello', hashtags: ['test'] })
      ).rejects.toThrow('TWITTER_BEARER_TOKEN not configured');
    });

    it('throws when tweet exceeds 280 chars', async () => {
      process.env.TWITTER_BEARER_TOKEN = 'test-token';
      const longCaption = 'a'.repeat(281);
      await expect(
        publish('twitter', { caption: longCaption, hashtags: [] })
      ).rejects.toThrow('Tweet exceeds 280 chars');
    });

    it('calls Twitter API with correct payload', async () => {
      process.env.TWITTER_BEARER_TOKEN = 'test-token';
      axios.post.mockResolvedValue({
        data: { data: { id: '123456789', text: 'Hello #test' } },
      });

      const result = await publish('twitter', {
        caption: 'Hello',
        hashtags: ['test'],
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://api.twitter.com/2/tweets',
        { text: 'Hello\n\n#test' },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
      expect(result.success).toBe(true);
      expect(result.platformPostId).toBe('123456789');
      expect(result.platformUrl).toBe('https://twitter.com/i/status/123456789');
    });

    it('handles no hashtags', async () => {
      process.env.TWITTER_BEARER_TOKEN = 'test-token';
      axios.post.mockResolvedValue({
        data: { data: { id: '999' } },
      });

      const result = await publish('twitter', {
        caption: 'Short tweet',
        hashtags: [],
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://api.twitter.com/2/tweets',
        { text: 'Short tweet' },
        expect.any(Object)
      );
      expect(result.platformPostId).toBe('999');
    });

    it('throws on Twitter API error', async () => {
      process.env.TWITTER_BEARER_TOKEN = 'test-token';
      axios.post.mockRejectedValue(new Error('Twitter API rate limit'));

      await expect(
        publish('twitter', { caption: 'Test', hashtags: [] })
      ).rejects.toThrow('Twitter API rate limit');
    });
  });

  describe('publish (router)', () => {
    it('throws for unsupported platform', async () => {
      await expect(
        publish('tiktok', { caption: 'Test', hashtags: [] })
      ).rejects.toThrow('Unsupported platform: tiktok');
    });

    it('throws for Instagram (not configured)', async () => {
      await expect(
        publish('instagram', { caption: 'Test', hashtags: [] })
      ).rejects.toThrow('Instagram publishing requires');
    });

    it('throws for WhatsApp (not configured)', async () => {
      await expect(
        publish('whatsapp', { caption: 'Test', hashtags: [] })
      ).rejects.toThrow('WhatsApp publishing requires');
    });
  });

  describe('platformConfigs', () => {
    it('has twitter config with correct maxLength', () => {
      expect(platformConfigs.twitter.maxLength).toBe(280);
    });

    it('has linkedin config with correct maxLength', () => {
      expect(platformConfigs.linkedin.maxLength).toBe(3000);
    });
  });
});
