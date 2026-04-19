"use client";

import { IPopulatedProduct } from "@/libs/models/product";
import { useCart } from "./CartContext";
import { useState, useEffect } from "react";
import { url } from "inspector";

interface AddToCartButtonProps {
  product: IPopulatedProduct;
}

const AddToCartButton = ({ product }: AddToCartButtonProps) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariantObj, setSelectedVariantObj] = useState<any>(null);
  const [sizeOption, setSizeOption] = useState<any>(null);

  // Get URL parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const variantParam = urlParams.get("variant");
      const sizeParam = urlParams.get("size");

      if (variantParam) {
        setSelectedVariant(variantParam);
      }

      if (sizeParam) {
        setSelectedSize(sizeParam);
      }
    }
  }, []);

  // Update variant object and size option when variant or size changes
  useEffect(() => {
    if (selectedVariant) {
      const variant = product.variants.find(
        (v: any) => (v as any).colorHex === selectedVariant,
      );
      setSelectedVariantObj(variant || null);

      if (variant && selectedSize) {
        const option = (variant as any).options.find(
          (o: any) => o.size === selectedSize,
        );
        setSizeOption(option || null);
      } else {
        setSizeOption(null);
      }
    } else {
      // If no variant selected, use the first variant as default
      if (product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0];
        setSelectedVariantObj(firstVariant);

        // If no size selected, use the first size option of the first variant
        if (
          (firstVariant as any).options &&
          (firstVariant as any).options.length > 0 &&
          !selectedSize
        ) {
          const firstOption = (firstVariant as any).options[0];
          setSizeOption(firstOption);
        }
      }
    }
  }, [selectedVariant, selectedSize, product.variants]);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      // Pass the selected variant and size information to the cart
      if (selectedVariantObj && sizeOption) {
        await addToCart(product, 1, selectedVariantObj, sizeOption);
      } else if (selectedVariantObj) {
        // If we have a variant but no size (shouldn't happen with current setup, but just in case)
        await addToCart(product, 1, selectedVariantObj, null);
      } else {
        // If no variant selected, use the first variant as default
        if (product.variants && product.variants.length > 0) {
          const firstVariant = product.variants[0];
          if (
            (firstVariant as any).options &&
            (firstVariant as any).options.length > 0
          ) {
            await addToCart(
              product,
              1,
              firstVariant,
              (firstVariant as any).options[0],
            );
          } else {
            await addToCart(product, 1, firstVariant, null);
          }
        } else {
          await addToCart(product, 1);
        }
      }
    } finally {
      setIsAdding(false);
    }
  };

  // Check if the selected size is out of stock
  const isOutOfStock = sizeOption && sizeOption.quantity <= 0;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || isOutOfStock}
      className="cursor-pointer flex text-sm gap-2 bg-background max-w-[320px] items-center relative rounded-[3px] pt-2 pr-2.5 pb-2 pl-2 border justify-between disabled:opacity-50"
    >
      {isAdding ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add To Cart"}
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
