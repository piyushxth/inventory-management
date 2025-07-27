"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import MobileNav from "./MobileNav";
import Image from "next/image";
import { title } from "process";
import { usePathname } from "next/navigation";
import path from "path";

const Navlinks = [
  {
    title: "Shop",
    href: "/shop",
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Special Events",
    href: "/events",
  },
];

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const navbarRef = useRef<HTMLElement | null>(null);
  const [offsetTop, setOffsetTop] = useState(0);
  const pathname = usePathname();

  const borderColor =
    isSticky || pathname.includes("/product")
      ? "border border-black"
      : "border border-white";

  // Measure offsetTop after DOM is painted and on resize
  useLayoutEffect(() => {
    const measure = () => {
      if (navbarRef.current) {
        setOffsetTop(
          navbarRef.current.getBoundingClientRect().top + window.scrollY
        );
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= offsetTop) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [offsetTop]);

  return (
    <nav
      ref={navbarRef}
      className={`group ${borderColor} ${
        isSticky
          ? "fixed top-0 left-0 right-0 z-50 bg-white"
          : "absolute top-0 left-0 right-0 z-50 hover:bg-white hover:border-black"
      } fs-200 flex items-center justify-between transition-all duration-300`}
    >
      <ul className="flex items-center w-full">
        <li className="flex">
          <Link
            href="/"
            className={`text-lg lg:text-lg py-2.5 px-6 fw-bold transition-colors duration-300 ${
              isSticky || pathname.includes("/product")
                ? "text-black group-hover:text-black"
                : "text-white group-hover:text-black"
            }`}
          >
            <div className="relative block w-[136px] h-[15px] lg:w-[145px] lg:h-[16px]">
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 127 14"
                fill="none"
                aria-hidden="true"
                className="w-full h-full transition-colors duration-300 group-hover:fill-black"
              >
                <path
                  fill={
                    isSticky || pathname.includes("/product")
                      ? "#000000"
                      : "#FFFFFF"
                  }
                  className="transition-colors duration-300 group-hover:fill-black"
                  d="M8.08 3.83c-.832-.811-1.913-1.39-2.861-1.39-.89 0-1.702.462-1.702 1.274 0 .618.385 1.1 1.469 1.602l1.123.52c2.145 1.007 3.439 2.127 3.439 4.155 0 2.029-1.721 4-4.698 4-2.048 0-3.575-.793-4.85-2.03l1.488-2.009c1.007 1.026 2.281 1.605 3.304 1.605 1.158 0 1.873-.637 1.873-1.469 0-.928-.831-1.45-2.126-2.048l-.948-.443C1.776 6.746.634 5.51.634 3.808.634 1.43 2.76 0 5.157 0c1.566 0 3.171.773 4.465 1.896L8.076 3.828l.003.003ZM22.264.236v2.398h-4.042v11.13h-2.666V2.634h-4.038V.236h10.745ZM32.332 9.03V.236h2.628V9.28c0 2.628-1.722 4.715-5.064 4.715s-5.044-2.087-5.044-4.715V.236h2.685V9.03c0 1.47.812 2.495 2.398 2.495 1.585 0 2.397-1.026 2.397-2.495ZM45.488 6.5v.039c1.566.637 2.514 1.776 2.514 3.342 0 2.165-1.605 3.883-4.465 3.883h-5.258V.236h4.815c2.782 0 4.173 1.721 4.173 3.459 0 1.178-.579 2.242-1.776 2.802l-.003.003Zm-4.523-3.98v3.016h1.818c.964 0 1.757-.485 1.757-1.527 0-1.042-.832-1.489-1.757-1.489h-1.818Zm0 8.989h1.837c1.625 0 2.398-.754 2.398-1.854s-.948-1.722-2.262-1.722h-1.973v3.576ZM58.113 6.5v.039c1.566.637 2.51 1.776 2.51 3.342 0 2.165-1.604 3.883-4.464 3.883H50.9V.236h4.814c2.783 0 4.174 1.721 4.174 3.459 0 1.178-.579 2.242-1.776 2.802V6.5ZM53.59 2.52v3.016h1.818c.967 0 1.757-.485 1.757-1.527 0-1.042-.832-1.489-1.757-1.489H53.59Zm0 8.989h1.837c1.625 0 2.398-.754 2.398-1.854s-.948-1.722-2.262-1.722H53.59v3.576ZM63.862 13.764V.236h2.686v11.227h5.74v2.3h-8.425ZM84.133 2.556h-6.49v3.17h4.31v2.301h-4.31v3.44h6.49v2.3h-9.176V.237h9.176v2.319ZM107.995 11.525c1.796 0 3.171-.968 3.672-2.57h2.957c-.792 3.191-3.575 5.045-6.629 5.045-3.983 0-7.054-2.918-7.054-6.995S104.015.01 107.995.01c3.051 0 5.837 1.857 6.629 5.044h-2.957c-.501-1.605-1.873-2.57-3.672-2.57-2.553 0-4.252 1.932-4.252 4.524s1.702 4.523 4.252 4.523v-.006ZM121.597.23c-2.87 0-5.038 2.145-5.038 4.986 0 2.84 2.165 4.986 5.038 4.986s5.038-2.146 5.038-4.986c0-2.841-2.165-4.986-5.038-4.986Zm0 2.407c1.424 0 2.417 1.061 2.417 2.582 0 1.52-.993 2.582-2.417 2.582s-2.414-1.061-2.414-2.582c0-1.52.994-2.582 2.414-2.582ZM125.402 11.467h-7.607v2.3h7.607v-2.3ZM96.612 10.383c.657-.987 1.43-2.437 2.068-4.06H95.76c-.213.617-.579 1.488-.986 2.241-.502-.501-1.777-1.854-2.764-2.918-.695-.754-1.041-1.43-1.041-2.029 0-.695.482-1.333 1.372-1.333.656 0 1.255.54 1.255 1.275 0 .233-.039.595-.188.912l1.57 1.676c1.064-1.271 1.035-2.617 1.035-3.073C96.014 1.41 94.506 0 92.419 0c-2.86 0-4.04 1.97-4.04 3.498 0 .986.33 1.854 1.102 2.743-1.488 1.081-2.339 2.437-2.339 3.964 0 2.223 1.818 3.789 4.116 3.789 1.546 0 2.802-.54 3.691-1.683l1.372 1.45h3.187v-.385L96.61 10.38l.003.003Zm-5.16 1.294c-.773 0-1.624-.618-1.624-1.566 0-.715.29-1.255 1.064-2.029.793.832 1.586 1.663 2.359 2.511-.424.696-1.14 1.084-1.796 1.084h-.003Z"
                />
              </svg> */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 700 100"
                className="w-full h-auto group-hover:fill-black"
                fill={
                  isSticky || pathname.includes("/product")
                    ? "#000000"
                    : "#FFFFFF"
                }
              >
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
                  fontSize="90"
                  letterSpacing="8"
                  className=""
                >
                  ICONIC & CLO
                </text>
              </svg>
            </div>
          </Link>
        </li>
        <li
          className={`flex flex-1 group-hover:border-l group-hover:border-black ${
            isSticky || pathname.includes("/product")
              ? "border-l border-black"
              : "border-l border-white"
          }`}
        >
          <nav className="hidden lg:flex items-center">
            {Navlinks.map((link, index) => (
              <Link
                href={link.href}
                key={index}
                className={`py-2.5 px-6 hidden md:block uppercase fw-semibold transition-colors duration-300 ${
                  isSticky || pathname.includes("/product")
                    ? "text-black group-hover:text-black"
                    : "text-white group-hover:text-black"
                }`}
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </li>
        {/* <li
          className={`flex items-center py-2.5 px-6 leading-none group-hover:border-l group-hover:border-black ${
            isSticky ? "border-l border-black" : "border-l border-white"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24" 
            fill="none"
            stroke={isSticky ? "#000000" : "#FFFFFF"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="block h-5 w-5 hover:scale-110 transition-transform cursor-pointer group-hover:stroke-black"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </li> */}
        <li
          className={`flex py-2.5 px-6 fw-semibold group-hover:border-l group-hover:border-black ${
            isSticky || pathname.includes("/product")
              ? "border-l border-black text-black group-hover:text-black"
              : "border-l text-white border-white group-hover:text-black"
          }`}
        >
          HELP
        </li>
        <li
          className={`flex py-2.5 px-6 fw-semibold group-hover:border-l group-hover:border-black ${
            isSticky || pathname.includes("/product")
              ? "border-l border-black text-black group-hover:text-black"
              : "border-l text-white border-white group-hover:text-black"
          }`}
        >
          CART
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
