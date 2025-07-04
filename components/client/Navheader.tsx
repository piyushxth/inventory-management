'use client'
import React, { useState } from 'react';

const NavHeader = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-black text-white py-3 px-4 bg-accent-400">
      <div className="container mx-auto">
        <div className="flex items-center justify-center relative">
          {/* Close Button */}
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute right-0 p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close announcement"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Announcement Text */}
          <div className="text-center">
            <p className="text-sm md:text-base font-medium">
              🎉 Get 10% off on your first purchase! Use code: 
              <span className="font-bold ml-1">WELCOME10</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavHeader;
