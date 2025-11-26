"use client";

import React from "react";
import Link from "next/link";
import { useCart, CartItem } from "@/components/client/CartContext";
import Image from "next/image";

const CartPage = () => {
  const { cartItems, cartCount, updateQuantity, removeFromCart, isLoading } = useCart();

  // Calculate total price
  const totalPrice = cartItems.reduce((total: number, item: CartItem) => {
    return total + (item.product.basePrice * item.quantity);
  }, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <p>Loading cart items...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart ({cartCount} items)</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link 
            href="/shop" 
            className="inline-block bg-black text-white px-6 py-2 hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartItems.map((item: CartItem) => (
                <div key={item.product._id} className="flex gap-6 p-6 border">
                  <div className="w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.product.mainImage[0] || "/placeholder.jpg"}
                      alt={item.product.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{item.product.name}</h3>
                    <p className="text-gray-500 mt-1">
                      ₹{item.product.basePrice?.toFixed(2) || '0.00'}
                    </p>
                    <div className="flex items-center mt-4">
                      <button 
                        onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                        disabled={isLoading}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="mx-3 w-10 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        disabled={isLoading}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <button 
                      onClick={() => removeFromCart(item.product._id)}
                      disabled={isLoading}
                      className="text-gray-400 hover:text-black transition disabled:opacity-50 mb-4"
                      aria-label="Remove item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <p className="font-medium">
                      ₹{(item.product.basePrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <Link 
                href="/checkout" 
                className="block w-full bg-black text-white text-center py-3 hover:bg-gray-800 transition mt-6"
              >
                Proceed to Checkout
              </Link>
              <Link 
                href="/shop" 
                className="block w-full text-center mt-3 text-gray-600 hover:text-black transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;