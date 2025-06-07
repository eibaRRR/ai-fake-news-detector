"use client";

import { useState } from "react";

export default function ArticleUrlUploader({ onUpload }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      new URL(url); // Basic URL validation
      setError(null);
      onUpload(url);
    } catch (_) {
      setError("Please enter a valid article URL.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl p-8 backdrop-blur-lg bg-gray-500/20 shadow-lg border border-gray-400/20"
    >
      <label htmlFor="url-input" className="block text-white/90 font-medium">
        Enter News Article URL
      </label>
      <input
        id="url-input"
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/news/my-article-to-analyze"
        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-400/30 text-white placeholder-gray-300/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      {error && (
        <div className="relative p-3 rounded-lg backdrop-blur-sm bg-danger/20 border border-danger/30">
          <p className="text-danger-text text-sm text-center">{error}</p>
        </div>
      )}
      <button
        type="submit"
        className="w-full px-5 py-2.5 bg-primary/80 hover:bg-primary text-white rounded-lg cursor-pointer transition-all duration-200 border border-primary/40 backdrop-blur-sm shadow-sm"
      >
        Analyze Article URL
      </button>
    </form>
  );
}