"use client";
import Image from "next/image";
import React from "react";

const Hero = () => {
  // Gradients for overlays
  const mobileOverlay =
    "linear-gradient(61.56deg, rgba(0,0,0,0.18), rgba(0,0,0,0) 74.72%)";
  const desktopOverlay =
    "linear-gradient(360deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 34.19%), linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 13.36%)";

  return (
    <section className="w-full">
      <div
        className={`
          relative overflow-hidden will-change-transform
          aspect-[375/600] max-h-auto md:max-h-[896px] lg:max-h-auto lg:aspect-[1440/650] w-full
        `}
      >
        <Image
          src="/client/hero/hero.png"
          alt="A man and woman wearing Volt crossbody's"
          fill
          priority
          className="object-cover object-[59.33%_17.25%]"
          sizes="(min-width: 1100px) 1440px, (min-width: 700px) 100vw, 375px"
        />
        {/* Overlay */}
        <div
          className={`
            absolute inset-0
            flex flex-wrap items-end gap-4
           py-[40px] px-[16px] md:py-[64px] md:px-[40px]  
            z-10
          `}
          style={{
            background: `${mobileOverlay}`,
          }}
        >
          {/* Desktop overlay via extra div for best compatibility */}
          <div
            className="hidden lg:block absolute inset-0 pointer-events-none"
            style={{
              background: desktopOverlay,
              zIndex: 1,
            }}
          />
          <div className="relative z-10 w-full max-w-2xl">
            <h2
              className="fs-400 font-bold uppercase"
              style={{ color: "#e6ff5b" }}
            >
              <strong>Limited Edition</strong>
            </h2>
            <h1 className="uppercase text-5xl lg:text-7xl font-extrabold text-white mb-6">
              Iconic.
            </h1>
            <a
              href="/collections/volt-bags"
              className="inline-flex items-center gap-2 px-2 uppercase py-3 bg-transparent border-white border text-white font-semibold hover:bg-white transition"
            >
              <span>Shop Now</span>
              {/* Replace with your SVG icon or use Heroicons/other */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
