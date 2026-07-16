const axios = require('axios');

const platformConfigs = {
  twitter: {
    baseUrl: 'https://api.twitter.com/2',
    maxLength: 280,
    envTokenKey: 'TWITTER_BEARER_TOKEN',
  },
  linkedin: {
    baseUrl: 'https://api.linkedin.com/v2',
    maxLength: 3000,
    envTokenKey: 'LINKEDIN_ACCESS_TOKEN',
  },
};

async function publishToTwitter({ caption, hashtags }) {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) {
    throw new Error('TWITTER_BEARER_TOKEN not configured');
  }

  const hashtagStr = hashtags?.length
    ? '\n\n' + hashtags.map((t) => `#${t}`).join(' ')
    : '';
  const fullText = caption + hashtagStr;

  if (fullText.length > 280) {
    throw new Error(`Tweet exceeds 280 chars (${fullText.length})`);
  }

  const response = await axios.post(
    'https://api.twitter.com/2/tweets',
    { text: fullText },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );

  const tweetId = response.data?.data?.id;
  return {
    success: true,
    platformPostId: tweetId,
    platformUrl: tweetId ? `https://twitter.com/i/status/${tweetId}` : null,
    raw: response.data,
  };
}

async function publishToLinkedIn({ caption, hashtags, accessToken }) {
  const token = accessToken || process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) {
    throw new Error('LINKEDIN_ACCESS_TOKEN not configured');
  }

  const hashtagStr = hashtags?.length
    ? '\n\n' + hashtags.map((t) => `#${t}`).join(' ')
    : '';
  const fullText = caption + hashtagStr;

  const response = await axios.post(
    'https://api.linkedin.com/v2/ugcPosts',
    {
      author: 'urn:li:person:ME',
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: fullText },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      timeout: 15000,
    }
  );

  const postId = response.data?.id;
  return {
    success: true,
    platformPostId: postId,
    platformUrl: postId ? `https://www.linkedin.com/feed/update/${postId}` : null,
    raw: response.data,
  };
}

async function publishToInstagram({ caption, hashtags }) {
  throw new Error(
    'Instagram publishing requires Facebook Business API setup. Configure INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID in .env'
  );
}

async function publishToWhatsApp({ caption, hashtags }) {
  throw new Error(
    'WhatsApp publishing requires WhatsApp Business API setup. Configure WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env'
  );
}

const publishers = {
  twitter: publishToTwitter,
  linkedin: publishToLinkedIn,
  instagram: publishToInstagram,
  whatsapp: publishToWhatsApp,
};

async function publish(platform, content) {
  const publisher = publishers[platform];
  if (!publisher) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  return publisher(content);
}

module.exports = { publish, platformConfigs };
