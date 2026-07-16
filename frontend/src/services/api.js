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
      const url = error.config?.url || '';
      const isAuthRoute = url.includes('/api/auth/login') || url.includes('/api/auth/register');
      const isOnAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

      if (!isAuthRoute && !isOnAuthPage) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (name, email, password) => api.post('/api/auth/register', { name, email, password }),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/api/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/api/auth/resend-verification', { email }),

  // Briefs
  submitBrief: (data) => api.post('/api/briefs', data),
  getBrief: (id) => api.get(`/api/briefs/${id}`),
  getBriefs: () => api.get('/api/briefs'),
  getBriefContent: (briefId) => api.get(`/api/briefs/${briefId}/content`),
  
  // Content generation
  generateContent: (briefId, tone, platforms) =>
    api.post('/api/content/generate', {
      briefId,
      tone,
      platforms
    }),
  
  getContent: (briefId) => api.get(`/api/content/${briefId}`),
  
  // Variant selection
  selectVariant: (contentId, variantIndex) =>
    api.put(`/api/content/${contentId}/select-variant`, { variantIndex }),

  // Status management
  updateStatus: (contentId, status, scheduledFor) =>
    api.put(`/api/content/${contentId}/status`, { status, scheduledFor }),

  // Settings
  getSettings: () => api.get('/api/settings'),
  saveSettings: (data) => api.put('/api/settings', data),

  // Publishing
  publishToSocial: (contentId) =>
    api.post(`/api/content/${contentId}/publish`)
};

export default api;
