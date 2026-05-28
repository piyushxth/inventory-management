"use client";

import React, { useEffect } from "react";
import Swiper from "swiper";
import { Navigation } from "swiper/modules";

import { ProductCard } from "@/components/client/ProductCard copy";
import Link from "next/link";

type RecommendationType = "trending" | "related";

type Props = {
  items: any[];
  type: RecommendationType;
};

const ProductRecommendationsSlider = ({ items, type }: Props) => {
  useEffect(() => {
    const swiper = new Swiper(".product-recommendation-swiper", {
      modules: [Navigation],

      navigation: {
        nextEl: ".product-recommendation-next",
        prevEl: ".product-recommendation-prev",
      },

      slidesPerView: "auto",
      spaceBetween: 16,
      resistanceRatio: 0,
      freeMode: false,
      centeredSlides: false,

      breakpoints: {
        320: {
          slidesPerView: "auto",
          spaceBetween: 8,
        },
        640: {
          slidesPerView: "auto",
          spaceBetween: 8,
        },
        1024: {
          slidesPerView: 3.2,
          spaceBetween: 8,
        },
      },
    });

    return () => {
      swiper.destroy();
    };
  }, []);

  return (
    <section className="mx-auto py-[60px] px-[16px] md:px-[16px] lg:py-[px-60] lg:px-[16px]  overflow-hidden border">
      <header className="flex flex-wrap items-start lg:items-end justify-between pb-6 gap-4 border-b">
        <div className="flex flex-col gap-4">
          <h2 className="uppercase text-balance leading-8 fw-bold text-[30px] lg:text-[40px] tracking-[-3px]">
            New Summer {type === "trending" ? "Trends" : "Related Products"}
          </h2>
          <div className="max-w-[640px] text-sm fw-semibold">
            <p>STYLED FOR FASHION. BUILT FOR COMFORT.</p>
          </div>
        </div>
        <Link
          href={`/products?${type === "trending" ? "trending" : "related"}`}
          className="border uppercase pt-2 pr-2.5 pb-2 pl-2 fw-semibold text-sm"
        >
          Shop Now
        </Link>
      </header>
      <main className="relative pt-6 lg:pt-10 product-recommendation-swiper w-full">
        <div className="swiper-wrapper flex  mx-[-16px] px-[16px] my-0 lg:mx-[-40px] py-0 lg:px-[40px] mr-[-40px]  ">
          {items.map((p) => (
            <div
              key={p.id}
              className="swiper-slide basis-[250px] md:basis-[360px] lg:basis-[360px] flex-none w-[220px] snap-start  "
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        {/* Prev */}
        <div className="absolute top-1/2 left-2  transform -translate-y-1/2 z-50">
          <button className="border border-white rounded-[4px] p-4  product-recommendation-prev !static !w-10 !h-10 cursor-pointer !m-0 bg-transparent backdrop-blur-sm hover:backdrop-blur-2xl flex items-center justify-center">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="#fff"
                stroke="#fff"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Next */}
        <div className="absolute top-1/2 right-2  transform -translate-y-1/2 z-50">
          <button className="border border-white rounded-[4px] p-4 product-recommendation-next !static !w-10 !h-10 cursor-pointer !m-0 bg-transparent backdrop-blur-sm hover:backdrop-blur-2xl  flex items-center justify-center">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="#fff"
                stroke="#fff"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </div>
      </main>
    </section>
  );
};

export default ProductRecommendationsSlider;
