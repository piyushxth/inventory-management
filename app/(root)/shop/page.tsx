import Features from "@/components/client/Features";
import Instagram from "@/components/client/Instagram";
import ProductFilters from "@/components/client/ProductFilters";
import { getProducts } from "@/libs/actions/productAction";
import { IProduct } from "@/libs/models/product";
import { Category } from "@/libs/models/category";
import { Brand } from "@/libs/models/brand";
import connectMongoDB from "@/libs/connnectMongoDB";
import Image from "next/image";
import Link from "next/link";
import React from "react";

async function page() {
  const products = await getProducts();
  
  // Fetch categories and brands for filter options
  await connectMongoDB();
  const categories = await Category.find();
  const brands = await Brand.find();
  
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
          aspect-[375/460] max-h -auto md:max-h-[464px] lg:max-h-auto lg:aspect-[1440/450] w-full
        `}
      >
        <Image
          src="/client/shop.webp"
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
            background:
              // Use desktop overlay on large screens, mobile overlay otherwise
              // This is a CSS trick: two backgrounds, one hidden by media query
              // But in React, we can use window.innerWidth or just let CSS handle it
              // For best performance, use both and let CSS media queries override
              // Here, we use mobile as default, desktop as override
              // You can also use a custom CSS class if you want
              `${mobileOverlay}`,
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
      <section className="">
        <div className="flex flex-col gap-4 mx-auto p-4 lg:px-10 lg:pt-8 lg:pb-6">
          <div className="">
            <nav>
              <ol>
                <li className="text-[#818181]">Home</li>
                <li>Shop</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>
      {/* Pass all data to the client component */}
      <section className="relative mx-auto px-4 lg:px-10 lg:pb-12 w-full">
        <ProductFilters 
          initialCategories={JSON.parse(JSON.stringify(categories))} 
          initialBrands={JSON.parse(JSON.stringify(brands))} 
          initialProducts={JSON.parse(JSON.stringify(products))} 
        />
      </section>
      <Features />
      <Instagram />
    </section>
  );
}

export default page;