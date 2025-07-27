"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

interface ImageGalleryModalProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialSlide?: number;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  images,
  isOpen,
  onClose,
  initialSlide = 0,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialSlide);

  // Update current image when initialSlide changes
  useEffect(() => {
    setCurrentImageIndex(initialSlide);
  }, [initialSlide]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, currentImageIndex]);

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col"
      onClick={handleBackdropClick}
    >
      {/* Close Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full w-10 h-10 flex items-center justify-center transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Image - Center */}
      <div className="flex-1 flex items-center justify-center relative px-16 py-8">
        <div className="relative max-w-full max-h-full">
          <Image
            src={images[currentImageIndex]}
            alt={`Product image ${currentImageIndex + 1}`}
            width={1200}
            height={1200}
            className="max-w-full max-h-full object-contain"
            priority
          />
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button 
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full w-12 h-12 flex items-center justify-center transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full w-12 h-12 flex items-center justify-center transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails - Bottom Center */}
      {images.length > 1 && (
        <div className="pb-6 px-4">
          <div className="flex justify-center items-center gap-2 max-w-4xl mx-auto overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 relative w-16 h-16 md:w-20 md:h-20 border-2 transition-all duration-200 ${
                  index === currentImageIndex
                    ? "border-white shadow-lg scale-110"
                    : "border-transparent hover:border-gray-400 hover:scale-105"
                }`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
                {/* Active indicator */}
                {index === currentImageIndex && (
                  <div className="absolute inset-0 bg-white bg-opacity-20" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Counter */}
      <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
        <span className="text-sm">
          {currentImageIndex + 1} / {images.length}
        </span>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
        <p className="text-xs">Use arrow keys • ESC to close</p>
      </div>
    </div>
  );
};

export default ImageGalleryModal;
