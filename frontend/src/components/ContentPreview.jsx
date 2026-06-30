import React, { useState } from 'react';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';

export default function ContentPreview({ captions, isLoading }) {
  const [selectedVariant, setSelectedVariant] = useState({});
  const [savedStatus, setSavedStatus] = useState({});
  const [statusOverrides, setStatusOverrides] = useState({});
  const [schedulingPlatform, setSchedulingPlatform] = useState(null);
  const [scheduleValue, setScheduleValue] = useState('');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p>Generating content...</p>
        </div>
      </div>
    );
  }

  if (!captions) {
    return (
      <div className="p-6 text-center text-gray-500">
        Fill out the form and click "Generate Content" to see results here
      </div>
    );
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleVariantSelect = async (platform, data, idx) => {
    const newIndex = idx === 0 ? undefined : idx - 1;
    setSelectedVariant(prev => ({ ...prev, [platform]: newIndex }));

    if (data._id) {
      try {
        const variantIndex = newIndex ?? -1;
        await apiService.selectVariant(data._id, variantIndex);
        setSavedStatus(prev => ({ ...prev, [platform]: true }));
        setTimeout(() => {
          setSavedStatus(prev => ({ ...prev, [platform]: false }));
        }, 1500);
      } catch {
        toast.error('Failed to save variant selection');
      }
    }
  };

  const handleStatusUpdate = async (platform, data, newStatus, scheduledFor) => {
    const prev = statusOverrides[platform];
    setStatusOverrides(o => ({ ...o, [platform]: { status: newStatus, scheduledFor } }));
    setSchedulingPlatform(null);
    setScheduleValue('');
    try {
      await apiService.updateStatus(data._id, newStatus, scheduledFor);
      toast.success(`Content marked as ${newStatus}`);
    } catch (err) {
      if (prev) {
        setStatusOverrides(o => ({ ...o, [platform]: prev }));
      } else {
        setStatusOverrides(o => {
          const copy = { ...o };
          delete copy[platform];
          return copy;
        });
      }
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(captions).map(([platform, data]) => {
        if (data.error) {
          return (
            <div key={platform} className="p-4 border border-red-500 rounded-lg bg-red-50 dark:bg-red-900">
              <h3 className="font-bold capitalize">{platform}</h3>
              <p className="text-red-600 dark:text-red-200">{data.error}</p>
            </div>
          );
        }

        const activeIndex = selectedVariant[platform];
        const displayText = activeIndex >= 0 ? data.variants[activeIndex] : data.caption;
        const statusData = statusOverrides[platform] ?? data;
        const currentStatus = statusData.status || 'draft';
        const displayScheduledFor = statusData.scheduledFor;

        return (
          <div key={platform} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold capitalize text-lg">{platform}</h3>
                {savedStatus[platform] && (
                  <span className="text-xs text-green-600">✓ Saved</span>
                )}
              </div>
              <button
                onClick={() => copyToClipboard(displayText)}
                className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
              >
                Copy
              </button>
            </div>

            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              {displayText.length} / {platform === 'twitter' ? '280' : '3000'} chars
            </p>

            {data.variants?.length > 0 && (
              <div className="flex gap-1 mb-2">
                {['Original', 'Option 1', 'Option 2'].slice(0, data.variants.length + 1).map((label, idx) => {
                  const isActive = idx === 0
                    ? (selectedVariant[platform] ?? -1) < 0
                    : selectedVariant[platform] === idx - 1;
                  return (
                    <button
                      key={label}
                      onClick={() => handleVariantSelect(platform, data, idx)}
                      className={`text-xs px-2 py-1 rounded ${isActive ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            <p className="mb-3 p-3 bg-white dark:bg-gray-700 rounded text-sm">
              {displayText}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {data.hashtags?.map(tag => (
                <span key={tag} className="text-xs bg-purple-200 dark:bg-purple-900 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  currentStatus === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  currentStatus === 'scheduled' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {currentStatus}
                </span>
                {currentStatus === 'scheduled' && displayScheduledFor && (
                  <span className="text-xs text-gray-500">
                    Scheduled for {new Date(displayScheduledFor).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => handleStatusUpdate(platform, data, 'published')}
                  className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Publish
                </button>
                <button
                  onClick={() => setSchedulingPlatform(schedulingPlatform === platform ? null : platform)}
                  className="text-xs px-2 py-1 rounded bg-amber-600 text-white hover:bg-amber-700"
                >
                  Schedule
                </button>
                <button
                  onClick={() => handleStatusUpdate(platform, data, 'draft')}
                  className="text-xs px-2 py-1 rounded bg-gray-600 text-white hover:bg-gray-700"
                >
                  Draft
                </button>
              </div>

              {schedulingPlatform === platform && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="datetime-local"
                    className="text-xs px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                    value={scheduleValue}
                    onChange={e => setScheduleValue(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      if (scheduleValue) {
                        handleStatusUpdate(platform, data, 'scheduled', new Date(scheduleValue).toISOString());
                      }
                    }}
                    className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
