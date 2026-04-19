"use client";

import React, { useState, useEffect } from "react";
import { IPopulatedProduct } from "@/libs/models/product";

interface ProductVariantSelectorProps {
  product: IPopulatedProduct;
  selectedVariant?: string;
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({ 
  product, 
  selectedVariant 
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(selectedVariant || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  // Update selected color when the selectedVariant prop changes
  useEffect(() => {
    if (selectedVariant) {
      setSelectedColor(selectedVariant);
    }
  }, [selectedVariant]);

  // Set default variant if none is selected
  useEffect(() => {
    if (!selectedColor && product.variants && product.variants.length > 0) {
      // Set the first variant as default
      const firstVariant = product.variants[0];
      setSelectedColor((firstVariant as any).colorHex);
      
      // Set the first size option as default if available
      if ((firstVariant as any).options && (firstVariant as any).options.length > 0) {
        setSelectedSize((firstVariant as any).options[0].size);
      }
    }
  }, [selectedColor, product.variants]);

  // Reset size when color changes
  useEffect(() => {
    setSelectedSize(null);
    
    // Auto-select the first size option of the newly selected variant
    if (selectedColor) {
      const variant = product.variants.find(v => (v as any).colorHex === selectedColor);
      if (variant && (variant as any).options && (variant as any).options.length > 0) {
        setSelectedSize((variant as any).options[0].size);
      }
    }
  }, [selectedColor, product.variants]);

  // Handle color selection
  const handleColorSelect = (colorHex: string) => {
    setSelectedColor(colorHex);
    
    // Update URL with the selected variant
    const url = new URL(window.location.href);
    url.searchParams.set('variant', colorHex);
    window.history.replaceState({}, '', url.toString());
  };

  // Handle size selection
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    
    // Update URL with the selected size
    const url = new URL(window.location.href);
    url.searchParams.set('size', size);
    window.history.replaceState({}, '', url.toString());
  };

  // Get the selected variant object
  const getSelectedVariant = () => {
    if (!selectedColor) return null;
    return product.variants.find(variant => (variant as any).colorHex === selectedColor) || null;
  };

  const selectedVariantObj = getSelectedVariant();

  return (
    <div className="flex flex-col gap-4">
      {/* Color Selector */}
      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">Color</h3>
        <div className="flex gap-2">
          {(product.variants as any[]).map((variant) => (
            <div
              key={variant.colorHex}
              className={`relative w-8 h-8 rounded-md border cursor-pointer transition-all duration-200 ease-in-out ${
                selectedColor === variant.colorHex
                  ? 'border-2 border-black scale-110' 
                  : 'border border-gray-300'
              }`}
              style={{ backgroundColor: variant.colorHex }}
              title={variant.color}
              onClick={() => handleColorSelect(variant.colorHex)}
            ></div>
          ))}
        </div>
        <span className="text-xs">
          {product.variants.length} {product.variants.length === 1 ? 'Color' : 'Colors'} Available
        </span>
      </div>

      {/* Size Selector */}
      {selectedVariantObj && (selectedVariantObj as any).options && (selectedVariantObj as any).options.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-sm">Size</h3>
          <div className="flex gap-2 flex-wrap">
            {(selectedVariantObj as any).options.map((option: any, index: number) => (
              <button
                key={index}
                className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                  selectedSize === option.size
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 hover:border-black'
                }`}
                onClick={() => handleSizeSelect(option.size)}
              >
                {option.size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;