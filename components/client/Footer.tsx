import Image from "next/image";
import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="mx-auto pt-[64px] px-[16px] pb-[48px]">
        <section className="px-[16px] lg:px-[40px]">
          <div className="flex flex-wrap justify-between gap-6">
            <Image
              src="/client/logo2.svg" // your image path
              alt="Stubble and Co logo mark in black" // use descriptive alt text
              width={200} // same as original
              height={200} // same as original
              loading="lazy" // optional, Next.js does lazy loading by default
              className="block w-auto max-w-[72px] max-h-[40px]"
              sizes="200px" // similar to srcset behavior
              priority={false} // optional (lazy by default)
            />
            <ul className="flex flex-wrap gap-6 items-center">
              <li>
                <Image
                  src="/client/logo3.svg" // your image path
                  alt="Stubble and Co logo mark in black" // use descriptive alt text
                  width={200} // same as original
                  height={200} // same as original
                  loading="lazy" // optional, Next.js does lazy loading by default
                  className="block w-auto max-w-[72px] max-h-[40px]"
                  sizes="200px" // similar to srcset behavior
                  priority={false} // optional (lazy by default)
                />
              </li>
              <li>
                <Image
                  src="/client/logo4.png" // your image path
                  alt="Stubble and Co logo mark in black" // use descriptive alt text
                  width={200} // same as original
                  height={200} // same as original
                  loading="lazy" // optional, Next.js does lazy loading by default
                  className="block w-auto max-w-[72px] max-h-[40px]"
                  sizes="200px" // similar to srcset behavior
                  priority={false} // optional (lazy by default)
                />
              </li>
              <li>
                <Image
                  src="/client/logo5.svg" // your image path
                  alt="Stubble and Co logo mark in black" // use descriptive alt text
                  width={200} // same as original
                  height={200} // same as original
                  loading="lazy" // optional, Next.js does lazy loading by default
                  className="block w-auto max-w-[72px] max-h-[40px]"
                  sizes="200px" // similar to srcset behavior
                  priority={false} // optional (lazy by default)
                />
              </li>
            </ul>
          </div>
          <div className="mt-10 lg:mt-8 pt-8 grid grid-cols-12 gap-8">
            {/* Signup Section */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
              <h2 className="text-sm lg:text-sm text-balance fw-semibold leading-snug">
                Sign up to unlock access to new products, promotions, and
                community events. Do.More. with Stubble &amp; Co.
              </h2>

              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
                />
                <button className="bg-black text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-800 transition">
                  Subscribe
                </button>

                <h2 className="text-xs  leading-snug">
                  By signing up you are agreeing to the Terms & Conditions. Read
                  our{" "}
                  <a
                    href="/pages/t-cs-privacy-policy"
                    className="underline hover:text-black"
                  >
                    Privacy Policy
                  </a>
                  .
                </h2>
              </div>
            </div>

            {/* Empty Middle Space */}
            <div className="hidden lg:block col-span-2"></div>

            {/* Links Section */}

            <ul className="col-span-12 lg:col-span-5 flex flex-wrap gap-10">
              <li className="flex-1 font-semibold flex flex-col gap-2">
                <h1 className="text-sm fw-bold">About</h1>
                <ul className="flex flex-col gap-3">
                  <li className="uppercase text-xs text-gray-600 hover:text-black">
                    Our Mission
                  </li>
                  <li className="uppercase text-xs text-gray-600 hover:text-black">
                    Our Impact
                  </li>
                  <li className="uppercase text-xs text-gray-600 hover:text-black">
                    Shop All
                  </li>
                  <li className="uppercase text-xs text-gray-600 hover:text-black">
                    Do More Hub
                  </li>
                </ul>
              </li>
              <li className="flex-1 font-semibold flex flex-col gap-2">
                <h1 className="text-sm fw-bold">About</h1>
                <ul className="flex flex-col gap-3">
                  <li className="uppercase text-xs text-gray-600 hover:text-black">
                    Our Mission
                  </li>
                  <li className="uppercase text-xs text-gray-600 hover:text-black">
                    Our Mission
                  </li>
                  <li className="uppercase text-xs text-gray-600 hover:text-black">
                    Our Mission
                  </li>
                  <li className="uppercase text-xs text-gray-600 hover:text-black">
                    Our Mission
                  </li>
                </ul>
              </li>
              <li className="flex-1 font-semibold flex flex-col gap-2">
                <h1 className="text-sm fw-bold">About</h1>
                <ul className="flex flex-col gap-3">
                  <li className="uppercase text-xs text-gray-600 hover:text-black">
                    Our Mission
                  </li>
                  <li className="uppercase text-xs text-gray-600 hover:text-black">
                    Our Mission
                  </li>
                  <li className="uppercase text-xs text-gray-600 hover:text-black">
                    Our Mission
                  </li>
                  <li className="uppercase text-xs text-gray-600 hover:text-black">
                    Our Mission
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </section>
      </footer>
      <section className="bg-black py-2">asdf</section>
    </>
  );
};

export default Footer;
