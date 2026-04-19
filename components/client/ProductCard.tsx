"use client";

import { IProduct, IPopulatedProduct } from "@/libs/models/product";
import { IVariant } from "@/libs/models/variant";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import AddToCartButton from "./AddToCartButton";

const ProductCard = ({ product }: { product: IProduct }) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [previousImage, setPreviousImage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const isValidImage = (image: string | undefined): image is string =>
    !!image &&
    (image.startsWith("/") ||
      image.startsWith("http://") ||
      image.startsWith("https://"));

  const getProductImageForColor = (colorHex: string): string | null => {
    const variant = product.variants.find(
      (v: IVariant) => v.colorHex === colorHex
    );
    if (variant && variant.images && variant.images.length > 0) {
      const image = variant.images[0];
      if (isValidImage(image)) return image;
    }
    if (product.mainImage && product.mainImage.length > 0 && isValidImage(product.mainImage[0])) {
      return product.mainImage[0];
    }
    return null;
  };

  const getProductImage = (): string | null => {
    const targetColor = hoveredColor || selectedColor;
    if (targetColor) return getProductImageForColor(targetColor);

    if (product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      if (firstVariant.images && firstVariant.images.length > 0) {
        const image = firstVariant.images[0];
        if (isValidImage(image)) return image;
      }
    }
    if (product.mainImage && product.mainImage.length > 0 && isValidImage(product.mainImage[0])) {
      return product.mainImage[0];
    }
    return null;
  };

  useEffect(() => {
    setCurrentImage(getProductImage());
    setImageLoaded(false);
  }, [product]);

  useEffect(() => {
    const newImage = getProductImage();
    if (newImage !== currentImage) {
      setPreviousImage(currentImage);
      setCurrentImage(newImage);
      setImageLoaded(false);
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 500);
      return () => clearTimeout(timer);
    }
  }, [selectedColor, hoveredColor, product]);

  const handleColorSelect = (colorHex: string) => setSelectedColor(colorHex);
  const handleColorHover = (colorHex: string) => setHoveredColor(colorHex);
  const handleColorHoverExit = () => setHoveredColor(null);

  const getProductLink = () =>
    selectedColor
      ? `/product/${product._id}?variant=${selectedColor}`
      : `/product/${product._id}`;

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
            <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="bg-gray-300 border-2 border-dashed rounded-xl w-16 h-16" />
            </div>
          )}
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
            {product.variants.map((variant: IVariant) => (
              <li
                key={variant.colorHex}
                className={`w-6 h-6 rounded-md border cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 hover:border-2 hover:border-black ${
                  hoveredColor === variant.colorHex ||
                  selectedColor === variant.colorHex
                    ? "border-2 border-black scale-110"
                    : "border border-gray-300"
                }`}
                style={{ backgroundColor: variant.colorHex }}
                title={variant.color}
                onClick={(e) => {
                  e.preventDefault();
                  handleColorSelect(variant.colorHex);
                }}
                onMouseEnter={() => handleColorHover(variant.colorHex)}
                onMouseLeave={() => handleColorHoverExit()}
              ></li>
            ))}
          </ul>
        </div>
        <div className="mt-3 border-t flex flex-wrap flex-end items-end justify-end py-3">
          <AddToCartButton product={product as unknown as IPopulatedProduct} />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
