"use client";

import { IProduct } from "@/libs/models/product";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaStar } from "react-icons/fa";
import AddToCartButton from "./AddToCartButton";

const ProductCard = ({ product }: { product: IProduct }) => {
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
           <div className="mt-3 border-t flex flex-wrap flex-end items-end justify-end py-3">
          <AddToCartButton product={product} />
        </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;