import React, { useState } from "react";
import { apiService } from "../services/api";
import { toast } from "react-toastify";

export default function FeatureBriefForm({ onSuccess, onLoadingChange }) {
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    featureName: "",
    description: "",
    keyBenefit: "",
    platforms: ["linkedin", "twitter", "instagram"],
    tone: "professional",
    visualFormats: ["static"],
    callToAction: "Try it now",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...(prev[name] || []), value]
          : (prev[name] || []).filter((item) => item !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.featureName || !formData.description || !formData.keyBenefit) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.platforms.length === 0) {
      toast.error("Select at least one platform");
      return;
    }

    setLoading(true);
    onLoadingChange?.(true);
    try {
      const briefResponse = await apiService.submitBrief({
        featureName: formData.featureName,
        description: formData.description,
        keyBenefit: formData.keyBenefit,
        platforms: formData.platforms,
        tone: formData.tone,
        visualFormats: formData.visualFormats,
        callToAction: formData.callToAction,
      });

      const briefId = briefResponse.data.briefId;
      toast.success("Feature brief created! Generating content...");

      const contentResponse = await apiService.generateContent(
        briefId,
        formData.tone,
        formData.platforms
      );

      toast.success("Content generated!");
      onSuccess(briefId, contentResponse.data.captions);
    } catch (error) {
      if (error.response?.status === 400) {
        const message = error.response.data.error || "Please check your input";
        toast.error(message);
        const errors = {};
        const fields = ["featureName", "description", "keyBenefit", "platforms", "tone"];
        for (const field of fields) {
          if (message.toLowerCase().includes(field.toLowerCase())) {
            errors[field] = message;
          }
        }
        setFieldErrors(errors);
      } else if (error.response?.status === 429) {
        toast.error("Too many requests — please wait a moment and try again");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6" noValidate>
      <div>
        <label htmlFor="featureName" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          Feature Name <span className="text-red-500">*</span>
        </label>
        <input
          id="featureName"
          type="text"
          name="featureName"
          value={formData.featureName}
          onChange={handleChange}
          placeholder="e.g., Live Collaboration Mode"
          className={`w-full px-4 py-2 min-h-[44px] border rounded-lg dark:bg-gray-700 dark:text-white dark:border-slate-600 ${
            fieldErrors.featureName ? "border-red-500" : "border-slate-300"
          } focus:outline focus:outline-2 focus:outline-violet-500`}
          aria-invalid={!!fieldErrors.featureName}
          aria-describedby={fieldErrors.featureName ? "featureName-error" : undefined}
          required
        />
        {fieldErrors.featureName && (
          <p id="featureName-error" className="text-red-500 text-xs mt-1" role="alert">
            {fieldErrors.featureName}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="2-3 sentences describing the feature"
          rows="3"
          className={`w-full px-4 py-2 min-h-[44px] border rounded-lg dark:bg-gray-700 dark:text-white dark:border-slate-600 ${
            fieldErrors.description ? "border-red-500" : "border-slate-300"
          } focus:outline focus:outline-2 focus:outline-violet-500`}
          aria-invalid={!!fieldErrors.description}
          aria-describedby={fieldErrors.description ? "description-error" : undefined}
          required
        />
        {fieldErrors.description && (
          <p id="description-error" className="text-red-500 text-xs mt-1" role="alert">
            {fieldErrors.description}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="keyBenefit" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          Key Benefit <span className="text-red-500">*</span>
        </label>
        <input
          id="keyBenefit"
          type="text"
          name="keyBenefit"
          value={formData.keyBenefit}
          onChange={handleChange}
          placeholder="e.g., No more version conflicts"
          className={`w-full px-4 py-2 min-h-[44px] border rounded-lg dark:bg-gray-700 dark:text-white dark:border-slate-600 ${
            fieldErrors.keyBenefit ? "border-red-500" : "border-slate-300"
          } focus:outline focus:outline-2 focus:outline-violet-500`}
          aria-invalid={!!fieldErrors.keyBenefit}
          aria-describedby={fieldErrors.keyBenefit ? "keyBenefit-error" : undefined}
          required
        />
        {fieldErrors.keyBenefit && (
          <p id="keyBenefit-error" className="text-red-500 text-xs mt-1" role="alert">
            {fieldErrors.keyBenefit}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          Platforms <span className="text-red-500">*</span>
        </legend>
        <div className="space-y-2" role="group" aria-label="Select platforms for generation">
          {["linkedin", "twitter", "instagram", "whatsapp"].map((platform) => (
            <label key={platform} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="platforms"
                value={platform}
                checked={formData.platforms.includes(platform)}
                onChange={handleChange}
                className="w-4 h-4 accent-violet-600 focus:outline focus:outline-2 focus:outline-violet-500"
              />
              <span className="capitalize text-sm text-slate-700 dark:text-slate-300">{platform}</span>
            </label>
          ))}
        </div>
        {fieldErrors.platforms && (
          <p className="text-red-500 text-xs mt-1" role="alert">{fieldErrors.platforms}</p>
        )}
      </fieldset>

      <div>
        <label htmlFor="tone" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
          Tone
        </label>
        <select
          id="tone"
          name="tone"
          value={formData.tone}
          onChange={handleChange}
          className={`w-full px-4 py-2 min-h-[44px] border rounded-lg dark:bg-gray-700 dark:text-white dark:border-slate-600 ${
            fieldErrors.tone ? "border-red-500" : "border-slate-300"
          } focus:outline focus:outline-2 focus:outline-violet-500`}
          aria-invalid={!!fieldErrors.tone}
        >
          <option value="professional">Professional</option>
          <option value="hype">Hype / Excited</option>
          <option value="informative">Informative</option>
          <option value="casual">Casual</option>
        </select>
        {fieldErrors.tone && (
          <p className="text-red-500 text-xs mt-1" role="alert">{fieldErrors.tone}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2.5 min-h-[48px] rounded-lg font-medium hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline focus:outline-2 focus:outline-violet-500"
        aria-label={loading ? "Generating content, please wait" : "Generate content"}
      >
        {loading ? "Generating content..." : "Generate Content"}
      </button>
    </form>
  );
}
