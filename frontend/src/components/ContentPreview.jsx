import React, { useState } from "react";
import { apiService } from "../services/api";
import { toast } from "react-toastify";

const Icons = {
  Copy: (s) => <svg width={s.size||14} height={s.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  Check: (s) => <svg width={s.size||14} height={s.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Share2: (s) => <svg width={s.size||14} height={s.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Image: (s) => <svg width={s.size||14} height={s.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Hash: (s) => <svg width={s.size||14} height={s.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  FileJson: (s) => <svg width={s.size||16} height={s.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12l-2 2 2 2"/><path d="M14 12l2 2-2 2"/></svg>,
  FileText: (s) => <svg width={s.size||16} height={s.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  X: (s) => <svg width={s.size||20} height={s.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

export default function ContentPreview({ captions, isLoading }) {
  const [selectedVariant, setSelectedVariant] = useState({});
  const [savedStatus, setSavedStatus] = useState({});
  const [statusOverrides, setStatusOverrides] = useState({});
  const [schedulingPlatform, setSchedulingPlatform] = useState(null);
  const [scheduleValue, setScheduleValue] = useState("");
  const [copiedCaption, setCopiedCaption] = useState(null);
  const [copiedHashtag, setCopiedHashtag] = useState(null);
  const [shareModal, setShareModal] = useState(null);

  const closeShareModal = () => setShareModal(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64" role="status" aria-label="Generating content, please wait">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-violet-600 dark:text-violet-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-600 dark:text-slate-400">Generating content...</p>
        </div>
      </div>
    );
  }

  if (!captions) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-slate-400">
        Fill out the form and click "Generate Content" to see results here
      </div>
    );
  }

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCaption(label);
      toast.success("Copied!");
      setTimeout(() => setCopiedCaption(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const copyHashtags = async (hashtags, platform) => {
    try {
      await navigator.clipboard.writeText(hashtags.join(", "));
      setCopiedHashtag(platform);
      toast.success("Copied!");
      setTimeout(() => setCopiedHashtag(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShare = (platform, data) => {
    const contentId = data._id || "preview";
    setShareModal(`http://localhost:3000/share/${contentId}`);
  };

  const copyShareLink = async () => {
    if (!shareModal) return;
    try {
      await navigator.clipboard.writeText(shareModal);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const exportCaptions = (format) => {
    const all = {};
    Object.entries(captions).forEach(([platform, data]) => {
      if (!data.error) {
        const activeIndex = selectedVariant[platform];
        const text = activeIndex >= 0 ? data.variants[activeIndex] : data.caption;
        all[platform] = {
          caption: text,
          hashtags: data.hashtags || [],
        };
      }
    });

    const filename = `captions-${new Date().toISOString().slice(0, 10)}`;
    let content, mime, ext;

    if (format === "json") {
      content = JSON.stringify(all, null, 2);
      mime = "application/json";
      ext = "json";
    } else {
      content = Object.entries(all)
        .map(([platform, d]) => `## ${platform}\n\n${d.caption}\n\n${d.hashtags.map(t => `#${t}`).join(" ")}\n`)
        .join("\n---\n\n");
      mime = "text/markdown";
      ext = "md";
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${ext.toUpperCase()} exported`);
  };

  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || "image.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success("Image downloaded");
    } catch {
      toast.error("Failed to download image");
    }
  };

  const handleVariantSelect = async (platform, data, idx) => {
    const newIndex = idx === 0 ? undefined : idx - 1;
    setSelectedVariant((prev) => ({ ...prev, [platform]: newIndex }));

    if (data._id) {
      try {
        const variantIndex = newIndex ?? -1;
        await apiService.selectVariant(data._id, variantIndex);
        setSavedStatus((prev) => ({ ...prev, [platform]: true }));
        setTimeout(() => {
          setSavedStatus((prev) => ({ ...prev, [platform]: false }));
        }, 1500);
      } catch {
        toast.error("Failed to save variant selection");
      }
    }
  };

  const handleStatusUpdate = async (platform, data, newStatus, scheduledFor) => {
    const prev = statusOverrides[platform];
    setStatusOverrides((o) => ({ ...o, [platform]: { status: newStatus, scheduledFor } }));
    setSchedulingPlatform(null);
    setScheduleValue("");
    try {
      if (newStatus === "published" && data._id) {
        await apiService.publishToSocial(data._id);
        toast.success(`Published to ${platform}`);
      } else {
        await apiService.updateStatus(data._id, newStatus, scheduledFor);
        toast.success(`Content marked as ${newStatus}`);
      }
    } catch (err) {
      if (prev) {
        setStatusOverrides((o) => ({ ...o, [platform]: prev }));
      } else {
        setStatusOverrides((o) => {
          const copy = { ...o };
          delete copy[platform];
          return copy;
        });
      }
      toast.error(err.response?.data?.error || "Failed to update status");
    }
  };

  const entries = Object.entries(captions);

  return (
    <div className="space-y-4">
      {/* Global export buttons */}
      {entries.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => exportCaptions("json")}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] sm:min-h-0 text-sm bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Export captions as JSON"
          >
            <Icons.FileJson size={16} /> Export JSON
          </button>
          <button
            onClick={() => exportCaptions("md")}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] sm:min-h-0 text-sm bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Export captions as Markdown"
          >
            <Icons.FileText size={16} /> Export Markdown
          </button>
        </div>
      )}

      {entries.map(([platform, data]) => {
        if (data.error) {
          return (
            <div key={platform} className="p-4 border border-red-500 rounded-lg bg-red-50 dark:bg-red-900">
              <h3 className="font-bold capitalize">{platform}</h3>
              <p className="text-red-600 dark:text-red-200">{data.error}</p>
            </div>
          );
        }

        const activeIndex = selectedVariant[platform];
        const caption = data.caption || data.text || data.content || '';
        const displayText = activeIndex >= 0 ? (data.variants?.[activeIndex] || caption) : caption;
        const statusData = statusOverrides[platform] ?? data;
        const currentStatus = statusData.status || "draft";
        const displayScheduledFor = statusData.scheduledFor;

        return (
          <div key={platform} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            {/* Header + action buttons */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold capitalize text-lg">{platform}</h3>
                {savedStatus[platform] && (
                  <span className="text-xs text-green-600">✓ Saved</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {/* Copy caption */}
                <button
                  onClick={() => copyToClipboard(displayText, platform)}
                  className="flex items-center justify-center gap-1 text-xs bg-purple-600 text-white px-3 min-h-[44px] sm:min-h-0 sm:px-2.5 sm:py-1.5 rounded hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                  aria-label="Copy caption to clipboard"
                >
                  {copiedCaption === platform ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
                  {copiedCaption === platform ? "Copied" : "Copy"}
                </button>

                {/* Share */}
                <button
                  onClick={() => handleShare(platform, data)}
                  className="flex items-center justify-center gap-1 text-xs bg-blue-600 text-white px-3 min-h-[44px] sm:min-h-0 sm:px-2.5 sm:py-1.5 rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Share this content"
                >
                  <Icons.Share2 size={14} /> Share
                </button>

                {/* Download images */}
                {data.images?.length > 0 && (
                  <button
                    onClick={() => data.images.forEach((img, i) => downloadImage(img, `${platform}-${i + 1}.png`))}
                    className="flex items-center justify-center gap-1 text-xs bg-emerald-600 text-white px-3 min-h-[44px] sm:min-h-0 sm:px-2.5 sm:py-1.5 rounded hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    aria-label="Download images"
                  >
                    <Icons.Image size={14} /> Images
                  </button>
                )}
              </div>
            </div>

            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              {displayText.length} / {platform === "twitter" ? "280" : "3000"} chars
            </p>

            {data.variants?.length > 0 && (
              <div className="flex gap-1 mb-2">
                {["Original", "Option 1", "Option 2"].slice(0, data.variants.length + 1).map((label, idx) => {
                  const isActive =
                    idx === 0
                      ? (selectedVariant[platform] ?? -1) < 0
                      : selectedVariant[platform] === idx - 1;
                  return (
                    <button
                      key={label}
                      onClick={() => handleVariantSelect(platform, data, idx)}
                      className={`text-xs px-3 min-h-[44px] sm:min-h-0 sm:px-2 sm:py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                        isActive
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            <p className="mb-3 p-3 bg-white dark:bg-gray-700 rounded text-sm whitespace-pre-wrap">
              {displayText}
            </p>

            {/* Hashtags with copy */}
            {data.hashtags?.length > 0 && (
              <div className="flex items-start gap-2 mb-3">
                <div className="flex flex-wrap gap-1 flex-1">
                  {data.hashtags.map((tag) => (
                    <span key={tag} className="text-xs bg-purple-200 dark:bg-purple-900 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => copyHashtags(data.hashtags, platform)}
                  className="flex items-center justify-center gap-1 text-xs bg-gray-500 text-white px-3 min-h-[44px] sm:min-h-0 sm:px-2 sm:py-1 rounded hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 shrink-0"
                  aria-label="Copy hashtags to clipboard"
                >
                  {copiedHashtag === platform ? <Icons.Check size={12} /> : <Icons.Hash size={12} />}
                  {copiedHashtag === platform ? "Copied" : "Copy"}
                </button>
              </div>
            )}

            {/* Status + actions */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    currentStatus === "published"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : currentStatus === "scheduled"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {currentStatus}
                </span>
                {currentStatus === "scheduled" && displayScheduledFor && (
                  <span className="text-xs text-gray-500">
                    Scheduled for{" "}
                    {new Date(displayScheduledFor).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => handleStatusUpdate(platform, data, "published")}
                  className="text-xs px-3 min-h-[44px] sm:min-h-0 sm:px-2 sm:py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  Publish
                </button>
                <button
                  onClick={() => setSchedulingPlatform(schedulingPlatform === platform ? null : platform)}
                  className="text-xs px-3 min-h-[44px] sm:min-h-0 sm:px-2 sm:py-1 rounded bg-amber-600 text-white hover:bg-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  Schedule
                </button>
                <button
                  onClick={() => handleStatusUpdate(platform, data, "draft")}
                  className="text-xs px-3 min-h-[44px] sm:min-h-0 sm:px-2 sm:py-1 rounded bg-gray-600 text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
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
                    onChange={(e) => setScheduleValue(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      if (scheduleValue) {
                        handleStatusUpdate(platform, data, "scheduled", new Date(scheduleValue).toISOString());
                      }
                    }}
                    className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Share Modal */}
      {shareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={closeShareModal}
          onKeyDown={(e) => { if (e.key === "Escape") closeShareModal(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Share link"
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 mx-4 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Share Content</h3>
              <button
                onClick={closeShareModal}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                aria-label="Close modal"
              >
                <Icons.X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Copy this link to share the content:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareModal}
                className="flex-1 text-xs px-3 py-2 border rounded bg-gray-50 dark:bg-slate-700 dark:text-white focus:outline-none"
                onClick={(e) => e.target.select()}
              />
              <button
                onClick={copyShareLink}
                className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                aria-label="Copy share link"
              >
                <Icons.Copy size={14} /> Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
