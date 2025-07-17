import Image from "next/image";
import React from "react";

const images = [
  "/client/hero-media/hero-media1.webp",
  "/client/hero-media/hero-media2.webp",
  "/client/hero-media/hero-media3.webp",
  "/client/hero-media/hero-media4.webp",
];

const MediaCard = () => {
  return (
    <section className="mx-auto  py-[60px] px-[16px] md:px-[16px] lg:py-[72px] lg:px-[40px]">
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
      <main className="relative pt-6 lg:pt-10">
        <ul className="flex gap-2 mx-[-16px] px-[16px] my-0 lg:mx-[-40px] py-0 lg:px-[40px] scroll-pl-4 lg:scroll-pl-[40px] overflow-x-auto overflow-y-hidden">
          {images.map((image, index) => (
            <li
              key={index}
              className="basis-[250px] md:basis-[360px] lg:basis-[410px] flex-none w-[220px] snap-start"
            >
              <div className="relative overflow-hidden aspect-[261/363] lg:aspect-[410/517]">
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
            </li>
          ))}{" "}
        </ul>
      </main>
    </section>
  );
};

export default MediaCard;
