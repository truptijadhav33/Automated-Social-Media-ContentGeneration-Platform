import React from 'react';

export default function ContentPreview({ captions, isLoading }) {
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

        return (
          <div key={platform} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold capitalize text-lg">{platform}</h3>
              <button
                onClick={() => copyToClipboard(data.caption)}
                className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
              >
                Copy
              </button>
            </div>
            
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              {data.char_count} / {platform === 'twitter' ? '280' : '3000'} chars
            </p>
            
            <p className="mb-3 p-3 bg-white dark:bg-gray-700 rounded text-sm">
              {data.caption}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {data.hashtags?.map(tag => (
                <span key={tag} className="text-xs bg-purple-200 dark:bg-purple-900 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
