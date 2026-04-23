import Features from "@/components/client/Features";
import Instagram from "@/components/client/Instagram";
import Image from "next/image";
import React from "react";

import type { Metadata } from "next";

import {
  getProductFilterOptions,
  listProducts,
  parseSlugList,
  parseSort,
} from "@/libs/products";

import { ProductFilters } from "./ProductFilters";
import { SortSelect } from "./SortSelect";
import { ProductCard } from "@/components/client/ProductCard copy";

export const metadata: Metadata = {
  title: "Shop all · Ecommerce",
  description: "Browse the full product catalog.",
};

// Opt out of caching: filters + sort come from searchParams at request time
// and we want fresh stock/prices on every view.
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const query = {
    genders: parseSlugList(sp.gender),
    categories: parseSlugList(sp.category),
    colors: parseSlugList(sp.color),
    sizes: parseSlugList(sp.size),
    sort: parseSort(sp.sort),
  };

  const [options, products] = await Promise.all([
    getProductFilterOptions(),
    listProducts(query),
  ]);

  const totalFiltersApplied =
    query.genders.length +
    query.categories.length +
    query.colors.length +
    query.sizes.length;

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
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Shop all
            </h1>
            <p className="mt-2 text-sm ">
              {" "}
              {products.length === 1 ? "product" : "products"}
              {totalFiltersApplied > 0
                ? ` · ${totalFiltersApplied} filter${totalFiltersApplied === 1 ? "" : "s"} applied`
                : ""}
            </p>
          </div>
          <SortSelect current={query.sort} />
        </header>

        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <ProductFilters options={options} />

          <section aria-label="Products">
            {products.length === 0 ? (
              <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-black/10 text-sm">
                No products match these filters.
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Features />
      <Instagram />
    </section>
  );
}
