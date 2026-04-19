"use client";

import { IPopulatedProduct } from "@/libs/models/product";
import { IVariant, ISizeOption } from "@/libs/models/variant";
import { useCart } from "./CartContext";
import { useState, useEffect } from "react";

interface AddToCartButtonProps {
  product: IPopulatedProduct;
}

const AddToCartButton = ({ product }: AddToCartButtonProps) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariantObj, setSelectedVariantObj] = useState<IVariant | null>(
    null
  );
  const [sizeOption, setSizeOption] = useState<ISizeOption | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const variantParam = urlParams.get("variant");
    const sizeParam = urlParams.get("size");
    if (variantParam) setSelectedVariant(variantParam);
    if (sizeParam) setSelectedSize(sizeParam);
  }, []);

  useEffect(() => {
    if (selectedVariant) {
      const variant =
        product.variants.find((v) => v.colorHex === selectedVariant) || null;
      setSelectedVariantObj(variant);
      if (variant && selectedSize) {
        setSizeOption(
          variant.options.find((o) => o.size === selectedSize) || null
        );
      } else {
        setSizeOption(null);
      }
    } else if (product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      setSelectedVariantObj(firstVariant);
      if (firstVariant.options && firstVariant.options.length > 0 && !selectedSize) {
        setSizeOption(firstVariant.options[0]);
      }
    }
  }, [selectedVariant, selectedSize, product.variants]);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      if (selectedVariantObj && sizeOption) {
        await addToCart(product, 1, selectedVariantObj, sizeOption);
      } else if (selectedVariantObj) {
        await addToCart(product, 1, selectedVariantObj);
      } else if (product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0];
        const firstOption = firstVariant.options?.[0];
        if (firstOption) {
          await addToCart(product, 1, firstVariant, firstOption);
        } else {
          await addToCart(product, 1, firstVariant);
        }
      } else {
        await addToCart(product, 1);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock = !!sizeOption && sizeOption.quantity <= 0;

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
