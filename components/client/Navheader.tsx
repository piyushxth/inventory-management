"use client";
import React from "react";
import { motion } from "framer-motion";

const marqueeItems = [
  "Free Delivery Available",
  "+50,000 reviews rated 4.9/5",
  "Taxes + Duties Included",
];

const NavHeader = () => {
  return (
    <section className="relative bg-black py-[6px]">
      {/* Marquee for small screens */}
      <div className="block md:hidden overflow-x-hidden w-full">
        <motion.ul
          className="flex gap-16 whitespace-nowrap fs-100 uppercase fw-semibold text-white"
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 12,
            ease: "linear",
          }}
        >
          {marqueeItems.concat(marqueeItems).map((item, idx) => (
            <li key={idx} className="px-4">
              {item}
            </li>
          ))}
        </motion.ul>
      </div>
      {/* Static for medium and up */}
      <div className="hidden md:flex justify-center">
        <ul className="flex justify-center gap-[240px] fs-100 uppercase fw-semibold text-white">
          {marqueeItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default NavHeader;
