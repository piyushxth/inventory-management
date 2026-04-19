"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, CartItem } from "@/components/client/CartContext";
import Image from "next/image";
import { IProduct } from "@/libs/models/product";
import AddToCartButton from "@/components/client/AddToCartButton";
import NavHeader from "@/components/client/Navheader";
import Navbody from "@/components/client/Navbody";
import Navbar from "@/components/client/Navbar";
import SuggestedProducts from "@/components/client/SuggestedProducts";

const CartPage = () => {
  const { cartItems, cartCount, updateQuantity, removeFromCart, isLoading } = useCart();
  const router = useRouter();
  const [suggestedProducts, setSuggestedProducts] = useState<IProduct[]>([]);

  // Calculate total price
  const subtotal = cartItems.reduce((total: number, item: CartItem) => {
    // Use variant price if available, otherwise use base product price
    const price = item.size?.price || item.product.basePrice || 0;
    return total + (price * item.quantity);
  }, 0);

  // Calculate savings (assuming 10% discount for demo purposes)
  const savings = subtotal * 0.1;
  const total = subtotal - savings;

  // Function to get the display image for a product
  const getProductImage = (item: CartItem) => {
    // Use variant image if available
    if (item.variant && item.variant.images && item.variant.images.length > 0) {
      const image = item.variant.images[0];
      if (typeof image === 'string' && image.length > 0) {
        // Check if it's a valid relative path (starts with /) or absolute URL
        if (image.startsWith('/') || image.startsWith('http://') || image.startsWith('https://')) {
          return image;
        }
      }
    }
    
    // Fallback to main product image
    if (item.product.mainImage && item.product.mainImage.length > 0) {
      const image = item.product.mainImage[0];
      if (typeof image === 'string' && image.length > 0) {
        // Check if it's a valid relative path (starts with /) or absolute URL
        if (image.startsWith('/') || image.startsWith('http://') || image.startsWith('https://')) {
          return image;
        }
      }
    }
    
    // Final fallback
    return "/placeholder.jpg";
  };

  // Fetch suggested products (for demo, we'll get some random products)
  useEffect(() => {
    const fetchSuggestedProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success && data.data) {
          // Get first 4 products as suggestions
          setSuggestedProducts(data.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching suggested products:", error);
      }
    };

    if (cartItems.length > 0) {
      fetchSuggestedProducts();
    }
  }, [cartItems.length]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <p>Loading cart items...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 w-[calc((100%-88px)/12*10+72px)]">  
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link 
            href="/shop" 
            className="inline-block bg-black text-white px-6 py-3 hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-8">
          {/* Your Cart - Left Column */}
          <div className="">
            <div className="bg-white">
              <div className="p-6">
                <h2 className="text-xl font-bold">Your Cart ({cartCount} items)</h2>
              </div>
              
              <div className="divide-y border-b">
                {cartItems.map((item: CartItem) => (
                  <div key={`${item.product._id}-${item.variant?.colorHex || ''}-${item.size?.size || ''}`} className="p-6 flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                        <Image
                          src={getProductImage(item)}
                          alt={item.product.name}
                          width={96}
                          height={96}
                          priority
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.jpg";
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{item.product.name}</h3>
                          {/* Display variant information */}
                          {item.variant && (
                            <div className="flex items-center gap-2 mt-1">
                              <span 
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: item.variant.colorHex }}
                                title={item.variant.color}
                              ></span>
                              <span className="text-gray-600 text-sm">{item.variant.color}</span>
                              {item.size && (
                                <span className="text-gray-600 text-sm">/ {item.size.size}</span>
                              )}
                            </div>
                          )}
                          <p className="text-gray-600 mt-1">
                            ₹{(item.size?.price || item.product.basePrice || 0).toFixed(2)}
                          </p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.product._id, item.variant, item.size)}
                          className="text-gray-400 hover:text-red-500 transition"
                          aria-label="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center mt-4">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button 
                            onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1), item.variant, item.size)}
                            disabled={isLoading}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="px-3 py-1">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.variant, item.size)}
                            disabled={isLoading}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sale Savings</span>
                  <span className="text-green-600">-₹{savings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-[#c9c9c9] pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                   {/* Cart Actions */}
              <div className="p-6 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/shop" 
                    className="flex-1 text-center py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                  >
                    Continue Shopping
                  </Link>
                  <button 
                    onClick={() => router.push('/checkout')}
                    className="flex-1 bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition"
                  >
                    Secure Checkout
                  </button>
                </div>
              </div>
              </div>
          </div>
          
          {/* Right Column - Order Summary and Suggestions */}
          <div className="space-y-6">
           {/* You Might Also Like */}
            {/* You Might Also Like */}
            {suggestedProducts.length > 0 && (
              <SuggestedProducts products={suggestedProducts} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;