"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/client/CartContext";

export default function EsewaSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get parameters from eSewa
  const oid = searchParams.get("oid"); // Order ID
  const refId = searchParams.get("refId"); // Reference ID from eSewa
  const amt = searchParams.get("amt"); // Amount

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!oid || !refId || !amt) {
          setError("Missing payment information");
          setLoading(false);
          return;
        }

        // Verify payment with eSewa
        const response = await fetch("/api/esewa-verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oid,
            refId,
            amt: parseFloat(amt),
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Payment verified, update order status
          const updateResponse = await fetch(`/api/orders/${oid}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentStatus: "Paid",
              orderStatus: "Processing",
            }),
          });

          const updateData = await updateResponse.json();

          if (updateData.success) {
            // Clear cart and redirect to success page
            await clearCart();
            router.push(`/checkout/order-success?orderId=${oid}`);
          } else {
            setError("Failed to update order status");
          }
        } else {
          setError("Payment verification failed");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError("An error occurred during payment verification");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [oid, refId, amt, router, clearCart]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <p className="text-gray-500">Verifying payment...</p>
        </div>
      </div>
    );
  }

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

  return null; // This shouldn't be reached
}