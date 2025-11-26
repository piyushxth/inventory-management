"use client";

import React, { useState, useEffect } from "react";
import { Types } from "mongoose";
import { ICategory } from "@/libs/models/category";
import { IBrand } from "@/libs/models/brand";
import { IProduct } from "@/libs/models/product";
import ProductCard from "@/components/client/ProductCard";

interface ProductFiltersProps {
  initialCategories: ICategory[];
  initialBrands: IBrand[];
  initialProducts: IProduct[];
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ 
  initialCategories,
  initialBrands,
  initialProducts
}) => {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<string>("");
  
  // Products state
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>(initialProducts);
  const [categories] = useState<ICategory[]>(initialCategories);
  const [brands] = useState<IBrand[]>(initialBrands);

  // Apply filters whenever filter values change
  useEffect(() => {
    let result = [...products];
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(product => 
        product.category && (product.category as any)._id === selectedCategory
      );
    }
    
    // Apply brand filter
    if (selectedBrand) {
      // In a real implementation, you would filter by brand
      // This is a placeholder since the current product model doesn't have a brand field
    }
    
    // Apply price filters
    if (minPrice !== "") {
      result = result.filter(product => product.basePrice >= Number(minPrice));
    }
    
    if (maxPrice !== "") {
      result = result.filter(product => product.basePrice <= Number(maxPrice));
    }
    
    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case "price-low":
          result.sort((a, b) => a.basePrice - b.basePrice);
          break;
        case "price-high":
          result.sort((a, b) => b.basePrice - a.basePrice);
          break;
        case "newest":
          // In a real implementation, you would sort by creation date
          break;
        default:
          break;
      }
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, selectedBrand, minPrice, maxPrice, sortBy, products]);

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("");
  };

  return (
    <div className="w-full">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div className="relative">
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={(category._id as Types.ObjectId).toString()} value={(category._id as Types.ObjectId).toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Brand Filter */}
          <div className="relative">
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={(brand._id as Types.ObjectId).toString()} value={(brand._id as Types.ObjectId).toString()}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Price Range Filter */}
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="Min" 
              className="border border-gray-300 rounded-md px-2 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-black"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
            />
            <span className="text-gray-500">to</span>
            <input 
              type="number" 
              placeholder="Max" 
              className="border border-gray-300 rounded-md px-2 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-black"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
            />
          </div>
        </div>
        
        {/* Sort By */}
        <div className="relative">
          <select 
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort by</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button 
            className="border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition"
            onClick={handleResetFilters}
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Products Display */}
      <section className="relative w-full">
        <ul className="flex flex-wrap gap-2 lg:gap-y-8 lg:gap-x-2">
          {filteredProducts.map((product) => (
            <li
              key={product._id.toString()}
              className="flex-none basis-[calc((100%-8px)/2)] lg:basis-[calc((100%-24px)/4)] snap-start"
            >
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ProductFilters;