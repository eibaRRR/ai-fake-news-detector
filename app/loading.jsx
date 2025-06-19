"use client"; // Add this directive to the top

import LoadingSpinner from './components/LoadingSpinner';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
    </div>
  );
}