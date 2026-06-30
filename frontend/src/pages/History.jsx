import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { toast } from 'react-toastify';
import ContentPreview from '../components/ContentPreview';

export default function History() {
  const [briefs, setBriefs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedContent, setExpandedContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchBriefs = async () => {
      try {
        const res = await apiService.getBriefs();
        if (!cancelled) setBriefs(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) toast.error('Failed to load briefs');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchBriefs();
    return () => { cancelled = true; };
  }, []);

  const handleViewContent = async (briefId) => {
    if (expandedId === briefId) {
      setExpandedId(null);
      setExpandedContent(null);
      return;
    }
    setExpandedId(briefId);
    setContentLoading(true);
    setExpandedContent(null);
    try {
      const res = await apiService.getBriefContent(briefId);
      setExpandedContent(res.data?.captions || res.data);
    } catch {
      toast.error('Failed to load content');
      setExpandedId(null);
    } finally {
      setContentLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const truncate = (text, max = 100) => {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, max) + '...';
  };

  const platformColor = (p) => {
    switch (p) {
      case 'linkedin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'twitter': return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p>Loading briefs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (briefs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">History</h1>
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">No launches yet</p>
            <Link
              to="/launch"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Launch Your First Feature
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">History</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {briefs.map((brief) => (
            <div key={brief._id} className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">
                  {brief.featureName || brief.name || 'Untitled'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {truncate(brief.description)}
                </p>

                {brief.platforms?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {brief.platforms.map((p) => (
                      <span key={p} className={`text-xs px-2 py-0.5 rounded font-medium ${platformColor(p)}`}>
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {formatDate(brief.createdAt || brief.created_at)}
                  </span>
                  <button
                    onClick={() => handleViewContent(brief._id)}
                    className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                  >
                    {expandedId === brief._id ? 'Hide' : 'View Content'}
                  </button>
                </div>
              </div>

              {expandedId === brief._id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  {contentLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin text-2xl">⏳</div>
                    </div>
                  ) : expandedContent ? (
                    <ContentPreview captions={expandedContent} isLoading={false} />
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
