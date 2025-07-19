"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import Swiper from "swiper";
import { Navigation } from "swiper/modules";

const images = [
  "/client/product/product1.webp",
  "/client/product/product1.webp",
  "/client/product/product1.webp",
  "/client/product/product1.webp",
  "/client/product/product1.webp",
];

const BestSelling = () => {
  useEffect(() => {
    const swiper = new Swiper(".best-selling-swiper", {
      modules: [Navigation],
      navigation: {
        nextEl: ".best-selling-next",
        prevEl: ".best-selling-prev",
      },
      slidesPerView: "auto",
      spaceBetween: 8, // must be a number!
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
          slidesPerView: 3.5,
          spaceBetween: 8,
        },
      },
    });

    return () => {
      swiper.destroy();
    };
  }, []);

  return (
    <section className="mx-auto py-[60px] px-[16px] md:px-[16px] lg:py-[72px] lg:px-[40px]  overflow-hidden overflow">
      <header className="flex flex-wrap items-start lg:items-end justify-between pb-6 gap-4 border-b">
        <div className="flex flex-col gap-4">
          <h2 className="uppercase text-balance leading-8 fw-bold text-[30px] lg:text-[40px] tracking-[-3px]">
            Best Selling
          </h2>
        </div>
        <button className="border uppercase pt-2 pr-2.5 pb-2 pl-2 fw-semibold text-sm">
          Shop Now
        </button>
      </header>

      <main className="relative pt-6 lg:pt-10 best-selling-swiper w-full">
        <ul className="swiper-wrapper flex  mx-[-16px] px-[16px] my-0 lg:mx-[-40px] py-0 lg:px-[40px] mr-[-40px]  ">
          {images.map((image, index) => (
            <li
              key={index}
              className="swiper-slide basis-[250px] lg:basis-[360px] flex-none w-[220px] snap-start "
            >
              <div className="bg-[#f5f5f5] border border-[#f5f5f5] rounded-[2px]">
                <Link href={"/shop"}>
                  <div className="relative p-4 h-[46px] flex flex-start justify-between gap-[8px 4px]">
                    <div className="flex flex-wrap gap-2">
                      <span className="py-[3px] px-[6px]  text-black fw-regular text-xs uppercase border">
                        Best Seller
                      </span>
                    </div>
                  </div>
                  <div className="relative aspect-[1/1] ">
                    <Image
                      src={image}
                      alt="Person on an escalator wearing the Stubble & Co 40L travel backpack with capacity annotation."
                      width={960}
                      height={1200}
                      sizes="(min-width: 1100px) 410px, 250px"
                      className=" h-full w-full object-cover"
                      priority={false} // change to true if it's above the fold
                    />
                  </div>
                  <div className="flex gap-2 p-4 flex-col">
                    <div className="flex flex-wrap items-center text-xs">
                      asdf
                    </div>
                    <div className="flex flex-wrap gap-[4px 8px] flex-1 flex-start items-center">
                      <h3 className="text-[22px] fw-bold">
                        Hybrid Backpack 30L
                      </h3>
                      <h4 className="text-balance text-[14px] ">
                        <span>Rs37,400</span>
                      </h4>
                    </div>
                  </div>
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <div className="absolute top-1/2 left-2 transform -translate-y-1/2 z-50">
          <button className="border border-white rounded-[4px] p-4 best-selling-prev !static !w-8 !h-8 !m-0 bg-transparent backdrop-blur-sm transition-colors flex items-center justify-center">
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
        <div className="absolute top-1/2 right-2  transform -translate-y-1/2 z-50">
          <button className="border border-white rounded-[4px] p-4 best-selling-next !static !w-8 !h-8 !m-0 bg-transparent backdrop-blur-sm transition-colors flex items-center justify-center">
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

export default BestSelling;
