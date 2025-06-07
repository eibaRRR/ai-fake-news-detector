"use client";

import { useState } from "react";

export default function ImageUrlUploader({ onUpload }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      // Basic URL validation
      new URL(url);
      setError(null);
      onUpload(url);
    } catch (_) {
      setError("Please enter a valid URL.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl p-8 backdrop-blur-lg bg-gray-500/20 shadow-lg border border-gray-400/20"
    >
      <label htmlFor="url-input" className="block text-white/90 font-medium">
        Enter Image URL
      </label>
      <input
        id="url-input"
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/image.jpg"
        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-400/30 text-white placeholder-gray-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
      />
      {error && (
        <div className="relative p-3 rounded-lg backdrop-blur-sm bg-red-400/20 border border-red-400/30">
          <p className="text-red-100 text-sm text-center">{error}</p>
        </div>
      )}
      <button
        type="submit"
        className="w-full px-5 py-2.5 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-lg cursor-pointer transition-all duration-200 border border-blue-400/40 backdrop-blur-sm shadow-sm"
      >
        Analyze URL
      </button>
    </form>
  );
}