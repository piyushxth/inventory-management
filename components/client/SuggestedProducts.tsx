"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IProduct } from "@/libs/models/product";
import { useCart } from "./CartContext";

interface SuggestedProductsProps {
  products: IProduct[];
  title?: string;
}

const SuggestedProducts: React.FC<SuggestedProductsProps> = ({ products, title = "You may also like" }) => {
  const { addToCart } = useCart();
  
  // State to track selected colors for each product
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [hoveredColors, setHoveredColors] = useState<Record<string, string>>({});

  // Function to handle color selection for a specific product
  const handleColorSelect = (productId: string, colorHex: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [productId]: colorHex
    }));
  };

  // Function to handle color hover for a specific product
  const handleColorHover = (productId: string, colorHex: string) => {
    setHoveredColors(prev => ({
      ...prev,
      [productId]: colorHex
    }));
  };

  // Function to handle color hover exit for a specific product
  const handleColorHoverExit = (productId: string) => {
    setHoveredColors(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  // Get the image for a product based on selected or hovered color
  const getProductImage = (product: IProduct) => {
    const targetColor = hoveredColors[product._id] || selectedColors[product._id];
    
    // If a color is selected or hovered, find the variant with that color and return its first image
    if (targetColor) {
      const variant = product.variants.find(v => v.colorHex === targetColor);
      if (variant && variant.images && variant.images.length > 0) {
        const image = variant.images[0];
        if (typeof image === 'string' && image.length > 0) {
          // Check if it's a valid relative path (starts with /) or absolute URL
          if (image.startsWith('/') || image.startsWith('http://') || image.startsWith('https://')) {
            return image;
          }
        }
      }
    }
    
    // Fallback to first variant's image or main image
    if (product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      if (firstVariant.images && firstVariant.images.length > 0) {
        const image = firstVariant.images[0];
        if (typeof image === 'string' && image.length > 0) {
          // Check if it's a valid relative path (starts with /) or absolute URL
          if (image.startsWith('/') || image.startsWith('http://') || image.startsWith('https://')) {
            return image;
          }
        }
      }
    }
    
    if (product.mainImage && product.mainImage.length > 0) {
      const mainImage = product.mainImage[0];
      if (typeof mainImage === 'string' && mainImage.length > 0) {
        // Check if it's a valid relative path (starts with /) or absolute URL
        if (mainImage.startsWith('/') || mainImage.startsWith('http://') || mainImage.startsWith('https://')) {
          return mainImage;
        }
      }
    }
    
    // Final fallback
    return "/placeholder.jpg";
  };

  // Construct the product link with variant parameter if a color is selected
  const getProductLink = (product: IProduct) => {
    const selectedColor = selectedColors[product._id];
    if (selectedColor) {
      return `/product/${product._id}?variant=${selectedColor}`;
    }
    return `/product/${product._id}`;
  };

  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">{title}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="group">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <Link href={getProductLink(product)}>
                  <div className="relative aspect-square w-full">
                    <Image
                      src={getProductImage(product)}
                      alt={product.name}
                      fill
                      priority
                      className="object-cover transition-all duration-300 ease-in-out"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.jpg";
                      }}
                    />
                  </div>
                </Link>
              </div>
              
              {/* Product Details */}
              <div className="flex flex-col gap-2 flex-grow">
                <h3 className="font-medium text-sm">{product.name}</h3>
                
                {/* Available Colors */}
                {product.variants && product.variants.length > 0 && (
                  <ul className="flex flex-wrap gap-2 items-center">
                    {product.variants.map((variant) => (
                      <li
                        key={variant.colorHex}
                        className={`w-6 h-6 cursor-pointer rounded-md border transition-all duration-200 ease-in-out ${
                          (hoveredColors[product._id] === variant.colorHex || selectedColors[product._id] === variant.colorHex)
                            ? 'border-2 border-black scale-110' 
                            : 'border border-gray-300'
                        }`}
                        style={{ backgroundColor: variant.colorHex }}
                        title={variant.color}
                        onClick={() => handleColorSelect(product._id, variant.colorHex)}
                        onMouseEnter={() => handleColorHover(product._id, variant.colorHex)}
                        onMouseLeave={() => handleColorHoverExit(product._id)}
                      ></li>
                    ))}
                  </ul>
                )}

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-600">₹{product.basePrice?.toFixed(2) || '0.00'}</p>
                  <button 
                    onClick={async () => {
                      try {
                        await addToCart(product, 1);
                      } catch (error) {
                        console.error("Error adding to cart:", error);
                      }
                    }}
                    className="cursor-pointer fw-semibold bg-black text-white px-4 py-1 text-sm hover:bg-white hover:text-black border border-black transition-colors duration-200"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestedProducts;