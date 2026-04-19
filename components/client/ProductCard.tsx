"use client";

import { IProduct, IPopulatedProduct } from "@/libs/models/product";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import AddToCartButton from "./AddToCartButton";

const ProductCard = ({ product }: { product: IProduct }) => {
  console.log("Rendering ProductCard for product:", product);
  // State to track selected color for this product
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  // State to track hovered color for this product
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  // State to track the current image URL for smooth transitions
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  // State to track the previous image for fade transition
  const [previousImage, setPreviousImage] = useState<string | null>(null);
  // State to track if image is transitioning
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  // State to track if image has loaded
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Initialize with the first variant's image or main image
  useEffect(() => {
    const imageUrl = getProductImage();
    setCurrentImage(imageUrl);
    // Reset imageLoaded when changing images
    setImageLoaded(false);
  }, [product]);

  // Handle image transitions with fade effect
  useEffect(() => {
    const newImage = getProductImage();

    if (newImage !== currentImage) {
      // Store the current image as previous
      setPreviousImage(currentImage);
      // Set the new image as current
      setCurrentImage(newImage);
      // Reset imageLoaded when changing images
      setImageLoaded(false);
      // Trigger transition
      setIsTransitioning(true);

      // Reset transition state after animation completes
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedColor, hoveredColor, product]);

  // Function to handle color selection
  const handleColorSelect = (colorHex: string) => {
    setSelectedColor(colorHex);
  };

  // Function to handle color hover
  const handleColorHover = (colorHex: string) => {
    setHoveredColor(colorHex);
  };

  // Function to handle color hover exit
  const handleColorHoverExit = () => {
    setHoveredColor(null);
  };

  // Helper function to get image for a specific color
  const getProductImageForColor = (colorHex: string) => {
    const variant = product.variants.find(
      (v) => (v as any).colorHex === colorHex,
    );
    if (
      variant &&
      (variant as any).images &&
      (variant as any).images.length > 0
    ) {
      const image = (variant as any).images[0];
      if (typeof image === "string" && image.length > 0) {
        if (
          image.startsWith("/") ||
          image.startsWith("http://") ||
          image.startsWith("https://")
        ) {
          return image;
        }
      }
    }

    // Fallback to main product image
    if (product.mainImage && product.mainImage.length > 0) {
      const mainImage = product.mainImage[0];
      if (typeof mainImage === "string" && mainImage.length > 0) {
        if (
          mainImage.startsWith("/") ||
          mainImage.startsWith("http://") ||
          mainImage.startsWith("https://")
        ) {
          return mainImage;
        }
      }
    }

    return null;
  };

  // Get the image for the product based on selected or hovered color
  const getProductImage = () => {
    // Priority: hovered > selected > default (first variant)
    const targetColor = hoveredColor || selectedColor;

    // If a color is selected or hovered, find the variant with that color and return its first image
    if (targetColor) {
      return getProductImageForColor(targetColor);
    }

    // Fallback to first variant's image or main image
    if (product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      if (
        (firstVariant as any).images &&
        (firstVariant as any).images.length > 0
      ) {
        const image = (firstVariant as any).images[0];
        if (typeof image === "string" && image.length > 0) {
          // Check if it's a valid relative path (starts with /) or absolute URL
          if (
            image.startsWith("/") ||
            image.startsWith("http://") ||
            image.startsWith("https://")
          ) {
            return image;
          }
        }
      }
    }

    if (product.mainImage && product.mainImage.length > 0) {
      const mainImage = product.mainImage[0];
      if (typeof mainImage === "string" && mainImage.length > 0) {
        // Check if it's a valid relative path (starts with /) or absolute URL
        if (
          mainImage.startsWith("/") ||
          mainImage.startsWith("http://") ||
          mainImage.startsWith("https://")
        ) {
          return mainImage;
        }
      }
    }

    // Return null if no valid image found
    return null;
  };

  // Construct the product link with variant parameter if a color is selected
  const getProductLink = () => {
    if (selectedColor) {
      return `/product/${product._id}?variant=${selectedColor}`;
    }
    return `/product/${product._id}`;
  };

  return (
    <div className="bg-[#f5f5f5] border border-[#f5f5f5] hover:border-black transition duration-200 rounded-[2px]">
      <Link href={getProductLink()}>
        <div className="relative p-4 h-[46px] flex flex-start justify-between gap-[8px 4px]">
          <div className="flex flex-wrap gap-2">
            <span className="py-[3px] px-[6px]  text-black fw-regular text-xs uppercase border">
              Best Seller
            </span>
          </div>
        </div>
        <div className="relative aspect-[1/1] overflow-hidden">
          {/* Previous image (fading out) */}
          {previousImage && imageLoaded && (
            <Image
              src={previousImage}
              alt="Product image"
              width={960}
              height={1200}
              sizes="(min-width: 1100px) 410px, 250px"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${isTransitioning ? "opacity-0" : "opacity-100"}`}
              priority={false}
            />
          )}

          {/* Current image (fading in) */}
          {currentImage ? (
            <Image
              src={currentImage}
              alt="Product image"
              width={960}
              height={1200}
              sizes="(min-width: 1100px) 410px, 250px"
              className={`h-full w-full object-cover transition-opacity duration-500 ease-in-out ${isTransitioning || !imageLoaded ? "opacity-0" : "opacity-100"}`}
              priority
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            // Skeleton loader when no image is available
            <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="bg-gray-300 border-2 border-dashed rounded-xl w-16 h-16" />
            </div>
          )}

          {/* Shimmer overlay while loading */}
          {!imageLoaded && currentImage && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:400%_400%] animate-shimmer"></div>
          )}
        </div>
      </Link>
      <div className="flex gap-2 p-4 flex-col ">
        <div className="flex flex-wrap items-center text-xs">
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />
        </div>
        <div className="flex flex-wrap  flex-start items-center">
          <h3 className="flex-1 text-lg text-black fw-bold tracking-[-1px] uppercase fw-bold">
            {product.name}
          </h3>
          <h4 className="text-balance text-[14px] text-black fw-semibold">
            <span>₹ {product.basePrice}</span>
          </h4>
        </div>

        <div className="flex flex-wrap flex-start items-center">
          <ul className="flex flex-wrap gap-2 items-center">
            {product.variants.map((variant) => (
              <li
                key={(variant as any).colorHex}
                className={`w-6 h-6 rounded-md border cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 hover:border-2 hover:border-black ${
                  hoveredColor === (variant as any).colorHex ||
                  selectedColor === (variant as any).colorHex
                    ? "border-2 border-black scale-110"
                    : "border border-gray-300"
                }`}
                style={{ backgroundColor: (variant as any).colorHex }}
                title={(variant as any).color}
                onClick={(e) => {
                  e.preventDefault();
                  handleColorSelect((variant as any).colorHex);
                }}
                onMouseEnter={() => handleColorHover((variant as any).colorHex)}
                onMouseLeave={() => handleColorHoverExit()}
              ></li>
            ))}
          </ul>
        </div>
        <div className="mt-3 border-t flex flex-wrap flex-end items-end justify-end py-3">
          {/* Pass a type assertion to satisfy the AddToCartButton's expected type */}
          <AddToCartButton product={product as unknown as IPopulatedProduct} />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
