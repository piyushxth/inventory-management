import Home from "@/app/(root)/page";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import MobileNav from "./MobileNav";

const Navlinks = ["All Categories", "Gift Cards", "Special Events"];

const Navbar = () => {
  return (
    <div className="container py-2 fs-400  flex items-center justify-between h-14">
      <div className="flex gap-6 items-center">
        <h1 className="fs-300 lg:fs-700 fw-bold ff-fashionwacks">ECOMMERCE</h1>
        <input
          type="text"
          className="hidden lg:flex border border-[#E3E3E3] px-2 py-1 rounded-2xl w-60"
          placeholder="Search here"
        />

        <div className="hidden lg:flex items-center gap-6">
          {Navlinks.map((link) => (
            <Link
              href={link}
              key={link}
              className="hidden md:block fw-semibold text-black/80"
            >
              {link}
            </Link>
          ))}
        </div>
      </div>
      <div className="hidden lg:flex items-center gap-6 text-black">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-heart-icon lucide-heart"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-user-icon lucide-user"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-shopping-cart-icon lucide-shopping-cart"
        >
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      </div>
      <div className="lg:hidden flex items-center gap-6 text-black">
        <MobileNav />
      </div>
    </div>
  );
};

export default Navbar;
