"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/client/CartContext";

export default function EsewaFailure() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  // Get parameters from eSewa
  const oid = searchParams.get("oid"); // Order ID

  useEffect(() => {
    // In a real application, you might want to log this failure or notify admins
    console.log("eSewa payment failed for order:", oid);
  }, [oid]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">Your payment was not completed. Please try again or choose another payment method.</p>
        
        {oid && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-yellow-800">
              <span className="font-medium">Order ID:</span> {oid}
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              Your order has been saved. You can complete the payment later.
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => router.push("/checkout")}
            className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition"
          >
            Retry Payment
          </button>
          <button 
            onClick={() => router.push("/")}
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}