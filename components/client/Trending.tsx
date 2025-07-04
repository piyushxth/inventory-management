import Image from "next/image";
import React from "react";

const Trending = () => {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="fs-700 leading-none font-bold pb-3">Trending</h1>
        <button className="border py-3 px-5 rounded-3xl cursor-pointer hover:bg-amber-50">
          Browse Inspiration
        </button>
      </div>

      <div className="flex flex-col lg:flex-row h-full w-full items-center justify-center px-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {/* Box 1 */}
          <div className="relative col-span-1 row-span-1 min-h-[180px] rounded-3xl overflow-hidden">
            <Image
              src="/client/product/product1.png"
              alt="Trending 1"
              fill
              className="object-cover"
            />
          </div>

          {/* Box 2 */}
          <div className="relative col-span-1 row-span-1 min-h-[180px] rounded-3xl overflow-hidden">
            <Image
              src="/client/product/product1.png"
              alt="Trending 2"
              fill
              className="object-cover"
            />
          </div>

          {/* Box 3 - Larger image spans 2 columns */}
          <div className="relative col-span-2 md:col-span-3 lg:col-span-2 row-span-1 min-h-[220px] rounded-3xl overflow-hidden">
            <Image
              src="/client/product/product3.png"
              alt="Trending 3"
              fill
              className="object-cover"
            />
          </div>

          {/* Box 4 - Full width below on mobile */}
          <div className="relative col-span-2 row-span-1 min-h-[220px] rounded-3xl overflow-hidden">
            <Image
              src="/client/product/product3.png"
              alt="Trending 4"
              fill
              className="object-cover"
            />
          </div>

          {/* Box 5 */}
          <div className="relative col-span-1 row-span-1 min-h-[180px] rounded-3xl overflow-hidden">
            <Image
              src="/client/product/product1.png"
              alt="Trending 5"
              fill
              className="object-cover"
            />
          </div>

          {/* Box 6 */}
          <div className="relative col-span-1 row-span-1 min-h-[180px] rounded-3xl overflow-hidden">
            <Image
              src="/client/product/product1.png"
              alt="Trending 6"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trending;
