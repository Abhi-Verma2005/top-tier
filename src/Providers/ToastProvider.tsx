"use client";
import { Toaster } from 'react-hot-toast';
import React from 'react';

const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={12}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        duration: 5000,
        
        // Styling for all toasts
        className: "group",
        style: {
          background: 'rgba(10, 11, 14, 0.95)',
          color: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          padding: '14px 18px',
          fontWeight: '500',
          fontSize: '15px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          position: 'relative',
        },
        
        // Styling for success toasts
        success: {
          style: {
            background: 'rgba(10, 11, 14, 0.95)',
            borderLeft: '4px solid #2a5d75',
          },
          iconTheme: {
            primary: '#6dc6ff',
            secondary: 'rgba(10, 11, 14, 0.95)',
          },
          className: "group relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-[#6dc6ff]/10 before:to-transparent before:opacity-0 before:group-hover:opacity-100 before:transition-opacity",
        },
        
        // Styling for error toasts
        error: {
          style: {
            background: 'rgba(10, 11, 14, 0.95)',
            borderLeft: '4px solid #ef4444',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: 'rgba(10, 11, 14, 0.95)',
          },
          className: "group relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-[#ef4444]/10 before:to-transparent before:opacity-0 before:group-hover:opacity-100 before:transition-opacity",
        },
        
        // Styling for loading toasts
        loading: {
          style: {
            background: 'rgba(10, 11, 14, 0.95)',
            borderLeft: '4px solid #2a5169',
          },
          iconTheme: {
            primary: '#2a5169',
            secondary: 'rgba(10, 11, 14, 0.95)',
          },
          className: "group relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-[#2a5169]/10 before:to-transparent before:opacity-0 before:group-hover:opacity-100 before:transition-opacity",
        },
      }}
    />
  );
};

export default ToastProvider;