"use client";

import React from "react";
import Image from "next/image";
import { IProduct } from "@/libs/models/product";
import { useCart } from "@/components/client/CartContext";
import Link from "next/link";

interface SuggestedProductsProps {
  products: IProduct[];
}

const SuggestedProducts: React.FC<SuggestedProductsProps> = ({ products }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">You Might Also Like</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product._id} className="border-b py-3 flex gap-4 items-center">
              {/* Product Image */}
              <div className="flex-shrink-0 w-30 h-30 bg-gray-100  overflow-hidden">
                <Link href={`/product/${product._id}`}>
                <Image
                  src={product.mainImage[0] || "/placeholder.jpg"}
                  alt={product.name}
                  width={144}
                  height={144}
                  priority
                  className="w-full h-full object-cover"
                />
                </Link>
              </div>
              
              {/* Product Details */}
              <div className="flex flex-col gap-2 flex-grow">
                <h3 className="font-medium text-sm">{product.name}</h3>
                
                {/* Available Colors */}
                <ul className="flex flex-wrap gap-2 items-center">
              {product.variants.map((variant) => (
                <li
                  key={variant.colorHex}
                  className="w-6 h-6 cursor-pointer rounded-md border border-black"
                  style={{ backgroundColor: variant.colorHex }}
                  title={variant.color} // optional: show color name on hover
                ></li>
              ))}
            </ul>

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
                    className="cursor-pointer fw-semibold bg-black text-white px-4 py-1 text-sm hover:bg-white hover:text-black border border-black"
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