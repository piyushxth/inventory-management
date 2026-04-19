"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IOrder } from "@/libs/models/order";

// Define the API response structure
interface OrderApiResponse {
  success: boolean;
  data?: IOrder;
  message?: string;
}

function OrderSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data: OrderApiResponse = await response.json();
        
        if (data.success && data.data) {
          setOrder(data.data);
        } else {
          setError(data.message || "Failed to load order details");
        }
      } catch (err) {
        setError("An error occurred while fetching order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link href="/" className="inline-block bg-black text-white px-6 py-2 hover:bg-gray-800 transition">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600">Thank you for your purchase. Your order has been received.</p>
      </div>

      {order && (
        <div className="bg-white rounded-xl border shadow-sm p-6 max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">Order Details</h2>
              <p className="text-gray-500">Order ID: {order._id?.toString() || orderId}</p>
            </div>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {order.orderStatus}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-gray-600">{order.customer.email}</p>
              <p className="text-gray-600">{order.customer.phone}</p>
              {order.shippingAddress ? (
                <p className="text-gray-600 mt-2">
                  {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.province}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium">{item.product?.name || "Product"}</p>
                    <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
              <span>Total</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/" 
              className="px-6 py-3 bg-black text-white text-center rounded-md hover:bg-gray-800 transition"
            >
              Continue Shopping
            </Link>
            <Link 
              href={`/order-tracking?orderId=${order._id?.toString() || orderId}`} 
              className="px-6 py-3 border border-gray-300 text-center rounded-md hover:bg-gray-50 transition"
            >
              Track Order
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderSuccess() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-center text-gray-500">Loading order details...</div>}>
      <OrderSuccessInner />
    </Suspense>
  );
}