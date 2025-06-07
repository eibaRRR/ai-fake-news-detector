"use client";

import { useCallback, useState } from "react";
import { UploadCloud, X } from 'lucide-react';
import ProgressBar from "./ProgressBar"; // 1. Import ProgressBar

export default function ImageUploader({ onUpload }) {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // 2. Add state for progress

  const handleFileChange = useCallback(
    (file) => {
      if (!file) return;

      if (!file.type.match("image.*")) {
        setError("Please upload an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      setError(null);
      const reader = new FileReader();

      // 3. Add event listeners to the FileReader
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentLoaded = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percentLoaded);
        }
      };

      reader.onloadend = () => {
        setUploadProgress(100); // Mark as complete
        setTimeout(() => setUploadProgress(0), 500); // Reset after a brief moment
      };
      
      reader.onload = (e) => {
        setPreview(e.target.result);
      };

      reader.readAsDataURL(file);
    },
    []
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePreview = () => {
    setPreview(null);
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = "";
    }
  };
  
  const handleAnalyzeClick = () => {
      if (preview) {
          onUpload(preview);
      }
  }

  return (
    <div className="space-y-4">
      {!preview && (
        <div
          className={`relative rounded-2xl p-8 text-center transition-all duration-300 ${
            isDragging ? "border-blue-400/50" : "border-transparent"
          } border-2 backdrop-blur-lg bg-gray-500/20 shadow-lg`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-500/30 to-gray-500/10 border border-gray-400/20"></div>
          <div className="absolute inset-0 rounded-2xl bg-blue-500/5 mix-blend-overlay"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-gray-500/20 backdrop-blur-sm border border-gray-400/30">
              <UploadCloud className="w-8 h-8 text-white/80" />
            </div>
            <p className="text-white/90 font-medium">
              {isDragging
                ? "Drop the image here"
                : "Drag & drop a news screenshot, or click to select"}
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
            <label
              htmlFor="file-upload"
              className="px-5 py-2.5 bg-gray-500/20 hover:bg-gray-500/30 text-white rounded-lg cursor-pointer transition-all duration-200 border border-gray-400/30 hover:border-gray-400/40 backdrop-blur-sm shadow-sm"
            >
              Select Image
            </label>
          </div>
          {/* 4. Render the progress bar inside the uploader */}
          <ProgressBar progress={uploadProgress} />
        </div>
      )}

      {error && (
        <div className="relative p-3 rounded-lg backdrop-blur-sm bg-red-400/20 border border-red-400/30">
          <p className="text-red-100 text-sm text-center">{error}</p>
        </div>
      )}
      
      {preview && (
        <div className="relative mt-4 p-5 rounded-2xl backdrop-blur-lg bg-gray-500/20 border border-gray-400/30 shadow-lg">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-500/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-white/90">Preview:</h3>
              <button onClick={handleRemovePreview} className="p-1 rounded-full text-white/70 hover:bg-white/20 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-1 rounded-xl bg-gray-500/20 border border-gray-400/30 overflow-hidden">
              <img
                src={preview}
                alt="Uploaded preview"
                className="w-full max-h-64 mx-auto rounded-lg object-contain"
              />
            </div>
            <button
                onClick={handleAnalyzeClick}
                className="w-full mt-4 px-5 py-2.5 bg-blue-500/30 hover:bg-blue-500/40 text-white rounded-lg cursor-pointer transition-all duration-200 border border-blue-400/40 backdrop-blur-sm shadow-sm"
            >
                Analyze Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}