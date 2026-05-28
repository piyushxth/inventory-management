"use client";
import React, { useEffect, useRef, useState } from "react";

const OrderAdminDetails = ({ onClose }: { onClose: () => void }) => {
  const [isOpen, setIsOpen] = useState(true);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Lock body scroll + listen for Escape while drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Move focus into the panel so screen readers announce it.
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close order details"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px]
transition-opacity duration-500 ease-out
${isOpen ? "opacity-100" : "opacity-0"}`}
      />

      {/* Drawer */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Order details"
        tabIndex={-1}
        className={`
    fixed bottom-0 right-0 z-[60]
    flex h-[92vh] w-full flex-col
    bg-[#f1f3f5] shadow-2xl outline-none

    md:h-screen
    md:w-[65vw]
    md:max-w-[950px]



    transform-gpu
    transition-transform
    duration-500
    ease-[cubic-bezier(0.22,1,0.36,1)]

    ${
      isOpen
        ? "translate-y-0 md:translate-x-0"
        : "translate-y-full md:translate-y-0 md:translate-x-[100%]"
    }
  `}
      >
        {/* Drag Indicator - Mobile */}
        <div className="flex justify-center pt-3 md:hidden">
          <div className="h-1.5 w-14 rounded-full bg-neutral-300" />
        </div>

        {/* Main Content */}
        <div className="flex h-full flex-col overflow-hidden p-5 md:p-8">
          {/* Header */}
          <header className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-5">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-neutral-900">
                  Order #1006
                </h2>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Delivered
                </span>
              </div>

              <div className="space-y-1 text-sm text-neutral-500">
                <p>
                  Created:{" "}
                  <span className="font-medium text-neutral-700">
                    May 21, Monday
                  </span>
                </p>

                <p>
                  Customer:{" "}
                  <span className="font-medium text-neutral-700">John Doe</span>
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close order details"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-900 hover:text-white"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M4.28 4.28a.75.75 0 011.06 0L10 8.94l4.66-4.66a.75.75 0 111.06 1.06L11.06 10l4.66 4.66a.75.75 0 11-1.06 1.06L10 11.06l-4.66 4.66a.75.75 0 01-1.06-1.06L8.94 10 4.28 5.34a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </header>

          {/* Scrollable Body */}
          <div className="mt-6 flex-1 overflow-y-auto">
            {/* Order Summary */}
            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Order Summary
                </h3>

                <span className="text-sm text-neutral-500">3 Items</span>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-3"
                  >
                    <div className="h-20 w-20 rounded-2xl bg-neutral-200" />

                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900">
                        Premium Hoodie
                      </h4>

                      <p className="mt-1 text-sm text-neutral-500">
                        Size: XL • Black
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-neutral-500">Qty: 1</span>

                        <p className="font-semibold text-neutral-900">$120</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Shipping + Payment */}
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <section className="rounded-3xl bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                  Shipping Address
                </h3>

                <div className="space-y-2 text-sm text-neutral-600">
                  <p className="font-medium text-neutral-900">John Doe</p>

                  <p>New Baneshwor, Kathmandu</p>
                  <p>Nepal</p>
                  <p>+977 9800000000</p>
                </div>
              </section>

              <section className="rounded-3xl bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                  Payment Details
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="font-medium">$320</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Shipping</span>
                    <span className="font-medium">$10</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Tax</span>
                    <span className="font-medium">$5</span>
                  </div>

                  <div className="border-t border-dashed pt-3">
                    <div className="flex items-center justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>$335</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default OrderAdminDetails;
