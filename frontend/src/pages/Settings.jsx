import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    temperature: 0.7,
    maxTokens: 500,
    systemPrompt: ''
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.getSettings();
        const { name, email, preferences } = res.data;
        setForm({
          name: name || '',
          email: email || '',
          temperature: preferences?.temperature ?? 0.7,
          maxTokens: preferences?.maxTokens ?? 500,
          systemPrompt: preferences?.systemPrompt || ''
        });
      } catch (err) {
        const msg = err.response?.data?.error || 'Failed to load settings';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiService.saveSettings({
        preferences: {
          temperature: form.temperature,
          maxTokens: form.maxTokens,
          systemPrompt: form.systemPrompt
        }
      });
      toast.success('Settings saved');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save settings';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <p className="text-gray-500 dark:text-gray-400">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Settings</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Temperature: {form.temperature}
            </label>
            <input
              type="range"
              name="temperature"
              min="0"
              max="1"
              step="0.1"
              value={form.temperature}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max tokens</label>
            <input
              type="number"
              name="maxTokens"
              min={100}
              max={1000}
              value={form.maxTokens}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">System prompt</label>
            <textarea
              name="systemPrompt"
              value={form.systemPrompt}
              onChange={handleChange}
              rows={4}
              placeholder="Leave blank to use the default social media expert prompt"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
