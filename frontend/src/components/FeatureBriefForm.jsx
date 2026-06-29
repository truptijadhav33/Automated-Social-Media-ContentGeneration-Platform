import React, { useState } from 'react';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

export default function FeatureBriefForm({ onSuccess, onLoadingChange }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    featureName: '',
    description: '',
    keyBenefit: '',
    platforms: ['linkedin', 'twitter', 'instagram'],
    tone: 'professional',
    visualFormats: ['static'],
    callToAction: 'Try it now'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
          ? [...(prev[name] || []), value]
          : (prev[name] || []).filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.featureName || !formData.description || !formData.keyBenefit) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.platforms.length === 0) {
      toast.error('Select at least one platform');
      return;
    }

    setLoading(true);
    onLoadingChange?.(true);
    try {
      // Step 1: Submit feature brief
      const briefResponse = await apiService.submitBrief({
        featureName: formData.featureName,
        description: formData.description,
        keyBenefit: formData.keyBenefit,
        platforms: formData.platforms,
        tone: formData.tone,
        visualFormats: formData.visualFormats,
        callToAction: formData.callToAction
      });

      const briefId = briefResponse.data.briefId;
      toast.success('Feature brief created! Generating content...');

      // Step 2: Generate content
      const contentResponse = await apiService.generateContent(
        briefId,
        formData.tone,
        formData.platforms
      );

      toast.success('Content generated! 🎉');
      onSuccess(briefId, contentResponse.data.captions);

    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <label className="block text-sm font-medium mb-2">Feature Name *</label>
        <input
          type="text"
          name="featureName"
          value={formData.featureName}
          onChange={handleChange}
          placeholder="e.g., Live Collaboration Mode"
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="2-3 sentences describing the feature"
          rows="3"
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Key Benefit *</label>
        <input
          type="text"
          name="keyBenefit"
          value={formData.keyBenefit}
          onChange={handleChange}
          placeholder="e.g., No more version conflicts"
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Platforms *</label>
        <div className="space-y-2">
          {['linkedin', 'twitter', 'instagram', 'whatsapp'].map(platform => (
            <label key={platform} className="flex items-center">
              <input
                type="checkbox"
                name="platforms"
                value={platform}
                checked={formData.platforms.includes(platform)}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="capitalize">{platform}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tone</label>
        <select
          name="tone"
          value={formData.tone}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="professional">Professional</option>
          <option value="hype">Hype / Excited</option>
          <option value="informative">Informative</option>
          <option value="casual">Casual</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Generating... ⏳' : 'Generate Content 🚀'}
      </button>
    </form>
  );
}
