"use client";

import React from "react";
import ProductVariantSelector from "./ProductVariantSelector";
import { IProduct } from "@/libs/models/product";

// Mock product data for testing
const mockProduct: Partial<IProduct> = {
  _id: "test-product-id",
  name: "Test Product",
  description: "This is a test product",
  category: "test-category-id" as any,
  costPrice: 50,
  basePrice: 100,
  mainImage: ["/placeholder.jpg"],
  variants: [
    {
      color: "Red",
      colorHex: "#FF0000",
      images: ["/red-variant.jpg"],
      options: [
        { size: "S", price: 90, quantity: 5, sku: "RED-S" },
        { size: "M", price: 100, quantity: 10, sku: "RED-M" },
        { size: "L", price: 110, quantity: 3, sku: "RED-L" }
      ]
    },
    {
      color: "Blue",
      colorHex: "#0000FF",
      images: ["/blue-variant.jpg"],
      options: [
        { size: "S", price: 90, quantity: 0, sku: "BLUE-S" },
        { size: "M", price: 100, quantity: 7, sku: "BLUE-M" },
        { size: "L", price: 110, quantity: 2, sku: "BLUE-L" }
      ]
    }
  ],
  availableQuantity: 15,
  soldQuantity: 5,
} as Partial<IProduct>;

const TestVariantSelector: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Variant Selector</h1>
      <div className="max-w-md">
        <ProductVariantSelector product={mockProduct as IProduct} />
      </div>
    </div>
  );
};

export default TestVariantSelector;