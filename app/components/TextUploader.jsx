"use client";

import { useState } from "react";

export default function TextUploader({ onUpload }) {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  const createRipple = (event) => {
    const button = event.currentTarget;

    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - (button.offsetLeft + radius)}px`;
    circle.style.top = `${event.clientY - (button.offsetTop + radius)}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];

    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
        setError("Please enter some text to analyze.");
        return;
    }
    setError(null);
    onUpload(text);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl p-8 backdrop-blur-lg bg-gray-100/50 dark:bg-gray-500/20 shadow-lg border border-gray-200 dark:border-gray-400/20"
    >
      <label htmlFor="text-input" className="block text-gray-800 dark:text-white/90 font-medium">
        Paste News Article Text
      </label>
      <textarea
        id="text-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the full text of the news article here..."
        className="w-full h-40 px-4 py-2 rounded-lg bg-white/50 dark:bg-white/10 border border-gray-300 dark:border-gray-400/30 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
      />
      {error && (
        <div className="relative p-3 rounded-lg backdrop-blur-sm bg-red-400/20 border border-red-400/30">
          <p className="text-red-100 text-sm text-center">{error}</p>
        </div>
      )}
      <button
        type="submit"
        className="ripple-btn w-full px-5 py-2.5 bg-primary/80 hover:bg-primary text-white rounded-lg cursor-pointer transition-all duration-200 border border-primary/40 backdrop-blur-sm shadow-sm"
        onClick={createRipple}
      >
        Analyze Text
      </button>
    </form>
  );
}