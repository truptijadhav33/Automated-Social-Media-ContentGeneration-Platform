import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests (when we have auth)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized — redirecting to login');
      // Later: redirect to login page
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Briefs
  submitBrief: (data) => api.post('/briefs', data),
  getBrief: (id) => api.get(`/briefs/${id}`),
  getBriefs: () => api.get('/briefs'),
  getBriefContent: (briefId) => api.get(`/briefs/${briefId}/content`),
  
  // Content generation
  generateContent: (briefId, tone, platforms) =>
    api.post('/content/generate', {
      briefId,
      tone,
      platforms
    }),
  
  getContent: (briefId) => api.get(`/content/${briefId}`),
  
  // Variant selection
  selectVariant: (contentId, variantIndex) =>
    api.put(`/api/content/${contentId}/select-variant`, { variantIndex }),

  // Status management
  updateStatus: (contentId, status, scheduledFor) =>
    api.put(`/api/content/${contentId}/status`, { status, scheduledFor }),

  // Publishing (later)
  publishToSocial: (contentId, platforms) =>
    api.post('/publish', { contentId, platforms })
};

export default api;
