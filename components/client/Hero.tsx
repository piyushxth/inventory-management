'use client'
import Image from "next/image";
import React, { useEffect } from "react";
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Hero = () => {
  useEffect(() => {
    const swiper = new Swiper('.swiper', {
      modules: [Navigation, Pagination, Autoplay],
      direction: 'horizontal',
      loop: false,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '"></span>';
        },
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });

    return () => {
      swiper.destroy();
    };
  }, []);

  const slides = [
    {
      image: '/client/hero/hero1.png',
      title: 'Unevil Your Beauty with Every Wear',
      subtitle: 'Shop the Latest Trends',
    },
    {
      image: '/client/hero/hero2.png',
      title: 'Unevil Your Beauty with Every Wear',
      subtitle: 'Elevate Your Wardrobe',
    },
    {
      image: '/client/hero/hero3.png',
      title: 'Unevil Your Beauty with Every Wear',
      subtitle: 'Be the First to Shop',
    },
  ];

  return (
    <section className="relative w-full min-h-[600px] rounded-2xl">
      <div className="swiper h-[600px]">
        <div className="swiper-wrapper h-full">
          {slides.map((slide, index) => (
            <div key={index} className="swiper-slide relative h-full">
              <div className="absolute inset-0 h-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover rounded-2xl"
                />
                <div className="rounded-2xl absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              </div>
              
              <div className="relative  h-full container mx-auto px-4 md:px-6 lg:px-8">
                <div className="flex flex-col justify-center h-full max-w-xl gap-2">
                  <h1 className="fw-regular text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300 text-lg">
                      See Collections
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Pagination */}
        <div className="swiper-pagination !bottom-8 !z-50"></div>
      </div>

      <style jsx global>{`
        .swiper-pagination {
          position: absolute;
          bottom: 2rem;
          left: 0;
          right: 0;
          z-index: 50;
        }

        .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          transition: all 0.3s ease;
          margin: 0 4px !important;
        }
        
        .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 4px;
          background: white;
        }
      `}</style>
    </section>
  );
};

export default Hero;
