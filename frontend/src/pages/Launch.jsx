import React, { useState } from 'react';
import FeatureBriefForm from '../components/FeatureBriefForm';
import ContentPreview from '../components/ContentPreview';

export default function Launch() {
  const [generatedCaptions, setGeneratedCaptions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSuccess = (briefId, captions) => {
    setGeneratedCaptions(captions);
    // Brief ID stored in case we need it for publishing later
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-slate-800 dark:text-slate-100">Launch Your Feature</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form on left */}
          <div>
            <FeatureBriefForm onSuccess={handleFormSuccess} onLoadingChange={setIsLoading} />
          </div>
          
          {/* Preview on right */}
          <div>
            <div className="sticky top-8">
              <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Generated Content</h2>
              <ContentPreview captions={generatedCaptions} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
