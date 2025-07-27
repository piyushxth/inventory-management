"use client";
import Image from "next/image";
import React, { useEffect } from "react";
import Swiper from "swiper";
import { Navigation } from "swiper/modules";

const images = [
  "/client/hero-media/hero-media1.webp",
  "/client/hero-media/hero-media2.webp",
  "/client/hero-media/hero-media3.webp",
  "/client/hero-media/hero-media4.webp",
  "/client/hero-media/hero-media4.webp",
];

const MediaCard = () => {
  useEffect(() => {
    const swiper = new Swiper(".media-card-swiper", {
      modules: [Navigation],
      navigation: {
        nextEl: ".media-card-next",
        prevEl: ".media-card-prev",
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
    <section className="mx-auto py-[60px] px-[16px] md:px-[16px] lg:py-[72px] lg:px-[40px]  overflow-hidden">
      <header className="flex flex-wrap items-start lg:items-end justify-between pb-6 gap-4 border-b">
        <div className="flex flex-col gap-4">
          <h2 className="uppercase text-balance leading-8 fw-bold text-[30px] lg:text-[40px] tracking-[-3px]">
            NEW Travel Backpack 40L
          </h2>
          <div className="max-w-[640px] text-sm fw-semibold">
            <p>SIZED FOR CARRY-ON. BUILT FOR COMFORT.</p>
          </div>
        </div>
        <button className="border uppercase pt-2 pr-2.5 pb-2 pl-2 fw-semibold text-sm">
          Shop Now
        </button>
      </header>

      <main className="relative pt-6 lg:pt-10 media-card-swiper w-full">
        <div className="swiper-wrapper flex  mx-[-16px] px-[16px] my-0 lg:mx-[-40px] py-0 lg:px-[40px] mr-[-40px]  ">
          {images.map((image, index) => (
            <div
              key={index}
              className="swiper-slide basis-[250px] md:basis-[360px] lg:basis-[410px] flex-none w-[220px] snap-start  "
            >
              <div className="relative aspect-[261/363] lg:aspect-[410/517]">
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
              
            </div>
          ))}
        </div>

        <div className="absolute top-1/2 left-2  transform -translate-y-1/2 z-50">
          <button className="border border-white rounded-[4px] p-4 media-card-prev !static !w-8 !h-8 !m-0 bg-transparent backdrop-blur-sm transition-colors flex items-center justify-center">
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
          <button className="border border-white rounded-[4px] p-4 media-card-next !static !w-8 !h-8 !m-0 bg-transparent backdrop-blur-sm transition-colors flex items-center justify-center">
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

export default MediaCard;
