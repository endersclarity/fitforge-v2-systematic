'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-gray-900">FitForge</h3>
            <p className="text-sm text-gray-600">
              Smart fitness tracking with progressive overload intelligence
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>📱 Mobile Optimized</span>
              <span>💾 Local Storage</span>
              <span>📈 Smart Progression</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
          <p>
            Built with localStorage-first architecture • No backend required • 
            Your data stays on your device
          </p>
        </div>
      </div>
    </footer>
  );
}
