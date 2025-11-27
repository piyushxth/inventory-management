"use client";

import { IProduct } from "@/libs/models/product";
import { useCart } from "./CartContext";
import { useState } from "react";

interface AddToCartButtonProps {
  product: IProduct;
}

const AddToCartButton = ({ product }: AddToCartButtonProps) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product, 1);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isAdding}
      className="cursor-pointer flex text-sm gap-2 bg-background max-w-[320px] items-center relative rounded-[3px] pt-2 pr-2.5 pb-2 pl-2 border justify-between"
    >
      {isAdding ? 'Adding...' : 'Add To Cart'}
      <span>
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
      </span>
    </button>
  );
};

export default AddToCartButton;