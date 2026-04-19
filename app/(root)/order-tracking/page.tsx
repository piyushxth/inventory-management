"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IOrder } from "@/libs/models/order";

function OrderTrackingInner() {
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
        const data = await response.json();
        
        if (data.success) {
          setOrder(data.data);
        } else {
          setError("Order not found. Please check the order ID.");
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
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link href="/" className="inline-block bg-black text-white px-6 py-2 hover:bg-gray-800 transition">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Status timeline steps
  const statusSteps = [
    { id: "Pending", label: "Order Placed", description: "We've received your order" },
    { id: "Processing", label: "Processing", description: "Preparing your order" },
    { id: "Dispatched", label: "Dispatched", description: "On the way to you" },
    { id: "Delivered", label: "Delivered", description: "Successfully delivered" },
  ];

  // Get current status index
  const getCurrentStatusIndex = () => {
    return statusSteps.findIndex(step => step.id === order?.orderStatus);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Tracking</h1>
        <p className="text-gray-600">Track your order status and delivery updates</p>
      </div>

      {order && (
        <div className="max-w-4xl mx-auto">
          {/* Order Summary */}
          <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold">Order #{order._id?.toString().substring(0, 8)}</h2>
                <p className="text-gray-500">Placed on {new Date(order.createdDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.orderStatus === "Delivered" ? "bg-green-100 text-green-800" :
                  order.orderStatus === "Cancelled" ? "bg-red-100 text-red-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {order.orderStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-500 text-sm mb-1">Total Amount</h3>
                <p className="font-bold">₹{order.totalAmount.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-500 text-sm mb-1">Payment Status</h3>
                <p className="font-bold">{order.paymentStatus}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-500 text-sm mb-1">Payment Method</h3>
                <p className="font-bold">{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">Order Status</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 transform translate-x-[-1px]"></div>
              
              <div className="space-y-6">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= getCurrentStatusIndex();
                  const isCurrent = step.id === order.orderStatus;
                  
                  return (
                    <div key={step.id} className="relative flex items-start">
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                        isCompleted 
                          ? "bg-green-500 text-white" 
                          : isCurrent 
                            ? "bg-blue-500 text-white" 
                            : "bg-gray-200 text-gray-500"
                      }`}>
                        {isCompleted ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className={`font-medium ${isCurrent ? "text-blue-600" : ""}`}>
                          {step.label}
                        </h3>
                        <p className="text-gray-500 text-sm">{step.description}</p>
                        {isCurrent && (
                          <p className="text-sm text-gray-400 mt-1">
                            Updated: {new Date(order.modifiedDate).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.product?.mainImage?.[0] ? (
                      <img 
                        src={
                          item.product.variants && item.product.variants.length > 0 && 
                          (item.product.variants[0] as any).images && (item.product.variants[0] as any).images.length > 0 ?
                            (item.product.variants[0] as any).images[0] :
                            item.product.mainImage[0]
                        } 
                        alt={item.product.name} 
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.jpg";
                        }}
                      />
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product?.name || "Product"}</h3>
                    <p className="text-gray-500 text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t flex justify-end">
              <div className="w-full max-w-xs">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="inline-block px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderTracking() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-center text-gray-500">Loading order details...</div>}>
      <OrderTrackingInner />
    </Suspense>
  );
}