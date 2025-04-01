// app/loading.tsx
import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        
        {/* Loading text */}
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading your experience...</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">This might take a moment</p>
      </div>
    </div>
  );
}