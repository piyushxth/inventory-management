"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/client/CartContext";

function EsewaSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  // Guards against StrictMode double-invoke and unstable-dep re-runs. We
  // deliberately omit `clearCart` from the effect deps below because it's an
  // inline function from CartContext and gets a fresh reference on every
  // provider render — listing it would re-fire this effect each time
  // clearCart() triggers a cart state update.
  const verifiedRef = useRef(false);

  const oid = searchParams.get("oid");
  const refId = searchParams.get("refId");

  useEffect(() => {
    if (verifiedRef.current) return;
    const verifyPayment = async () => {
      try {
        if (!oid || !refId) {
          setError("Missing payment information");
          return;
        }
        verifiedRef.current = true;
        // Server-side verification against eSewa using the server-stored
        // totalAmount — never trust `amt` from the query string.
        const response = await fetch("/api/esewa-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oid, refId }),
        });
        const data = await response.json();
        if (data.success) {
          await clearCart();
          router.push(`/checkout/order-success?orderId=${oid}`);
        } else {
          setError(data.message || "Payment verification failed");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError("An error occurred during payment verification");
      }
    };
    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oid, refId, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Payment Verification Failed</h1>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => router.push("/checkout")}
            className="inline-block bg-black text-white px-6 py-2 hover:bg-gray-800 transition"
          >
            Retry Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center">
        <p className="text-gray-500">Verifying payment...</p>
      </div>
    </div>
  );
}

export default function EsewaSuccess() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-center text-gray-500">Verifying payment...</div>}>
      <EsewaSuccessInner />
    </Suspense>
  );
}
