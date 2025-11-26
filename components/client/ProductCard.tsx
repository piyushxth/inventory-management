"use client";

import { IProduct } from "@/libs/models/product";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { useCart } from "./CartContext";


const ProductCard = ({ product }: { product: IProduct }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();

    setIsAdding(true);
    try {
      await addToCart(product, 1);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-[#f5f5f5] border border-[#f5f5f5] hover:border-black transition duration-200 rounded-[2px]">
      <Link href={`/product/${product._id}`}>
        <div className="relative p-4 h-[46px] flex flex-start justify-between gap-[8px 4px]">
          <div className="flex flex-wrap gap-2">
            <span className="py-[3px] px-[6px]  text-black fw-regular text-xs uppercase border">
              Best Seller
            </span>
          </div>
        </div>
        <div className="relative aspect-[1/1] ">
          <Image
            src={product.mainImage[0]}
            alt="Person on an escalator wearing the Stubble & Co 40L travel backpack with capacity annotation."
            width={960}
            height={1200}
            sizes="(min-width: 1100px) 410px, 250px"
            className=" h-full w-full object-cover"
            priority={false} // change to true if it's above the fold
          />
        </div>
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
                  key={variant.colorHex}
                  className="w-6 h-6 rounded-md border border-black"
                  style={{ backgroundColor: variant.colorHex }}
                  title={variant.color} // optional: show color name on hover
                ></li>
              ))}
            </ul>


          </div>
          <div className="mt-2 border-t flex flex-wrap flex-end items-end justify-end py-3">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors disabled:opacity-50"
              title="Add to cart"
            >
              {isAdding ? (
                <span className="text-sm uppercase">Adding...</span>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <span className="text-sm uppercase">Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;

