"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const FeaturedProducts = () => {
  useEffect(() => {
    const swiper = new Swiper(".featured-products-swiper", {
      modules: [Navigation],
      slidesPerView: 3.5,
      spaceBetween: 24,
      navigation: {
        nextEl: ".featured-products-next",
        prevEl: ".featured-products-prev",
      },
      breakpoints: {
        320: {
          slidesPerView: 1.5,
          spaceBetween: 16,
        },
        640: {
          slidesPerView: 2.5,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3.5,
          spaceBetween: 24,
        },
      },
    });

    return () => {
      swiper.destroy();
    };
  }, []);

  const products = [
    {
      id: 1,
      name: "Classic White Tee",
      price: 29.99,
      image: "/client/product/product1.png",
      category: "T-Shirts",
    },
    {
      id: 2,
      name: "Slim Fit Jeans",
      price: 79.99,
      image: "/client/product/product2.jpg",
      category: "Jeans",
    },
    {
      id: 3,
      name: "Casual Hoodie",
      price: 59.99,
      image: "/client/product/product3.png",
      category: "Hoodies",
    },
    {
      id: 4,
      name: "Summer Dress",
      price: 89.99,
      image: "/client/product/product3.png",
      category: "Dresses",
    },
    {
      id: 5,
      name: "Leather Jacket",
      price: 199.99,
      image: "/client/product/product2.jpg",
      category: "Outerwear",
    },
  ];

  return (
    <section className="overflow-hidden">
      <div className="">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl fw-semibold tracking-wider ff-fashionwacks">
            Featured Products
          </h2>
          <div className="flex gap-4">
            <button className="featured-products-prev !static !w-8 !h-8 !m-0 !border !border-gray-200 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
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
            <button className="featured-products-next !static !w-8 !h-8 !m-0 !border !border-gray-200 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
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
        </div>

        <div className="featured-products-swiper">
          <div className="swiper-wrapper">
            {products.map((product) => (
              <div key={product.id} className="swiper-slide">
                <div className="group">
                  {/* Product Image */}
                  <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="border object-cover rounded-lg transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">{product.category}</p>
                    <h3 className="font-medium text-gray-900">
                      {product.name}
                    </h3>
                    <p className="font-semibold text-gray-900">
                      ${product.price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .featured-products-swiper {
          overflow: visible;
        }
        .featured-products-swiper .swiper-slide {
          height: auto;
        }
      `}</style>
    </section>
  );
};

export default FeaturedProducts;
