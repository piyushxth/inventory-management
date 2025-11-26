"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import MobileNav from "./MobileNav";
import { usePathname } from "next/navigation";
import CartDrawer from "./CartDrawer";
import { useCart } from "./CartContext";
import { useSession, signOut } from "next-auth/react";

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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount } = useCart(); // Get cart count
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const borderColor =
    isSticky || pathname.includes("/product")
      ? "border border-black"
      : "border border-white";

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if the click is outside the user menu
      if (isUserMenuOpen && navbarRef.current && !navbarRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

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
    <>
      <nav
        ref={navbarRef}
        className={`group ${borderColor} ${isSticky
          ? "fixed top-0 left-0 right-0 z-50 bg-white"
          : "absolute top-0 left-0 right-0 z-50 hover:bg-white hover:border-black"
          } fs-200 flex items-center justify-between transition-all duration-300`}
      >
        <ul className="flex items-center w-full">
          <li className="flex">
            <Link
              href="/"
              className={`text-lg lg:text-lg py-2.5 px-6 fw-bold transition-colors duration-300 ${isSticky || pathname.includes("/product")
                ? "text-black group-hover:text-black"
                : "text-white group-hover:text-black"
                }`}
            >
              <div className="relative block w-[136px] h-[15px] lg:w-[145px] lg:h-[16px]">
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
                  >
                    ICONIC & CLO
                  </text>
                </svg>
              </div>
            </Link>
          </li>
          <li
            className={`flex flex-1 group-hover:border-l group-hover:border-black ${isSticky || pathname.includes("/product")
              ? "border-l border-black"
              : "border-l border-white"
              }`}
          >
            <nav className="hidden lg:flex items-center">
              {Navlinks.map((link, index) => (
                <Link
                  href={link.href}
                  key={index}
                  className={`py-2.5 px-6 hidden md:block uppercase fw-semibold transition-colors duration-300 ${isSticky || pathname.includes("/product")
                    ? "text-black group-hover:text-black"
                    : "text-white group-hover:text-black"
                    }`}
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </li>
          <Link
            href={"/help"}
            className={`py-2.5 px-6 hidden md:block uppercase fw-semibold transition-colors duration-300 ${isSticky || pathname.includes("/product")
              ? "border-l border-black"
              : "border-l border-white text-white group-hover:border-black group-hover:text-black"
              }`}
          >
            HELP
          </Link>
          
          {/* User Menu */}
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`py-2.5 px-6 hidden md:block uppercase fw-semibold transition-colors duration-300 cursor-pointer ${isSticky || pathname.includes("/product")
                  ? "border-l border-black text-black group-hover:text-black"
                  : "border-l border-white text-white group-hover:border-black group-hover:text-black"
                  }`}
              >
                ACCOUNT
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <Link
                      href="/my-orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          setIsUserMenuOpen(false);
                          await signOut({ callbackUrl: "/" });
                        } catch (error) {
                          console.error("Sign out error:", error);
                          // Fallback: redirect to home page
                          window.location.href = "/";
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/client/login"
              className={`py-2.5 px-6 hidden md:block uppercase fw-semibold transition-colors duration-300 ${isSticky || pathname.includes("/product")
                ? "border-l border-black text-black group-hover:text-black"
                : "border-l border-white text-white group-hover:border-black group-hover:text-black"
                }`}
            >
              LOGIN
            </Link>
          )}
          
          <button
            onClick={() => setIsCartOpen(true)}
            className={`py-2.5 px-6 hidden md:block uppercase fw-semibold transition-colors duration-300 cursor-pointer ${isSticky || pathname.includes("/product")
              ? "border-l border-black text-black group-hover:text-black"
              : "border-l border-white text-white group-hover:border-black group-hover:text-black"
              }`}
          >
            CART {cartCount > 0 && `(${cartCount})`}
          </button>
        </ul>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
              
    </>
  );
};

export default Navbar;