"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productId: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productId,
}) => {
  const [visibleImageCount, setVisibleImageCount] = useState(7);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setVisibleImageCount(7);
  }, [productId]);

  const visibleImages = images.slice(0, visibleImageCount);
  const hasMoreImages = visibleImageCount < images.length;

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleImageCount((prev) => Math.min(prev + 7, images.length));
      setIsLoading(false);
    }, 300);
  };

  return (
    <ul className="flex flex-wrap gap-2">
      {visibleImages.map((image, index) => (
        <li
          key={`${productId}-${index}`}
          className={`flex-none shrink-0 ${
            index < 4
              ? "basis-[calc((100%-8px)/2)]"
              : "basis-[calc((100%-16px)/3*1)]"
          }`}
        >
          <div className="relative aspect-[1/1] flex-1">
            <Image
              src={image}
              alt={`Product image ${index + 1} for product ${productId}`}
              width={2048}
              height={2048}
              sizes="(max-width: 768px) 352px, (max-width: 1200px) 832px, (max-width: 1600px) 1200px, (max-width: 1920px) 1920px, 2048px"
              priority={index < 4}
            />
          </div>
        </li>
      ))}

      {hasMoreImages && (
        <button
          onClick={handleLoadMore}
          disabled={isLoading}
          className="pt-[8px] pr-[10px] pb-[8px] pl-[8px] flex border mx-auto justify-center gap-2 mt-[32px] rounded-[3px] items-center uppercase hover:bg-black hover:text-white cursor-pointer duration-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              Loading...
            </>
          ) : (
            "Load More Images"
          )}
        </button>
      )}
    </ul>
  );
};

export default ProductGallery;
