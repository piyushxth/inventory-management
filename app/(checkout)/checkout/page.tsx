"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart, CartItem } from "@/components/client/CartContext";

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  );
}

export default function Checkout() {
  const { cartItems, clearCart, isLoading } = useCart();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [useSameAddress, setUseSameAddress] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    shippingProvince: "",
    shippingCity: "",
    shippingAddress: "",
    shippingLandmark: "",
    billingProvince: "",
    billingCity: "",
    billingAddress: "",
    billingLandmark: "",
    paymentMethod: "COD" as "COD" | "Online",
    orderNote: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((t: number, i: CartItem) => t + i.product.basePrice * i.quantity, 0),
    [cartItems]
  );
  const total = subtotal;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // If using same address, copy shipping to billing
    if (useSameAddress && name.startsWith("shipping")) {
      const billingField = name.replace("shipping", "billing");
      setForm((prev) => ({ ...prev, [billingField]: value }));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    // Validate required fields
    if (!form.name || !form.email || !form.phone) {
      setError("Please fill in all required customer information");
      setIsSubmitting(false);
      return;
    }
    
    if (!form.shippingProvince || !form.shippingCity || !form.shippingAddress) {
      setError("Please fill in all required shipping address fields");
      setIsSubmitting(false);
      return;
    }
    
    if (!useSameAddress && (!form.billingProvince || !form.billingCity || !form.billingAddress)) {
      setError("Please fill in all required billing address fields");
      setIsSubmitting(false);
      return;
    }
    
    try {
      if (cartItems.length === 0) {
        setError("Your cart is empty");
        return;
      }
      
      // Prepare order data
      const order = {
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          province: form.shippingProvince,
          city: form.shippingCity,
          address: form.shippingAddress,
          landmark: form.shippingLandmark,
        },
        items: cartItems.map((i) => ({ 
          product: i.product._id, 
          quantity: i.quantity, 
          price: i.product.basePrice 
        })),
        totalAmount: total,
        paymentMethod: form.paymentMethod,
        orderNote: form.orderNote,
      };
      
      const res = await fetch("/api/orders", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(order) 
      });
      
      const data = await res.json();
      if (data.success) {
        await clearCart();
        router.push(`/checkout/order-success?orderId=${data.data._id}`);
      } else {
        setError(data.message || "Failed to create order");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      setError("An error occurred while processing your order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <p className="text-gray-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-500 mb-4">Add some items to your cart before checking out</p>
          <Link href="/shop" className="inline-block bg-black text-white px-6 py-2 hover:bg-gray-800 transition">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={submit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Customer Information</h2>
              <div className="space-y-4">
                <Field label="Full Name" name="name" required value={form.name} onChange={handleChange} placeholder="John Doe" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="john@example.com" />
                  <Field label="Phone" name="phone" type="tel" required value={form.phone} onChange={handleChange} placeholder="+977 9800000000" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Province" name="shippingProvince" required value={form.shippingProvince} onChange={handleChange} placeholder="Bagmati" />
                  <Field label="City" name="shippingCity" required value={form.shippingCity} onChange={handleChange} placeholder="Kathmandu" />
                </div>
                <Field label="Address" name="shippingAddress" required value={form.shippingAddress} onChange={handleChange} placeholder="Street address, P.O. box, company name" />
                <Field label="Landmark (Optional)" name="shippingLandmark" value={form.shippingLandmark} onChange={handleChange} placeholder="Near XYZ building" />
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="useSameAddress" 
                  checked={useSameAddress} 
                  onChange={(e) => {
                    setUseSameAddress(e.target.checked);
                    // If checking the box, copy shipping to billing
                    if (e.target.checked) {
                      setForm(prev => ({
                        ...prev,
                        billingProvince: prev.shippingProvince,
                        billingCity: prev.shippingCity,
                        billingAddress: prev.shippingAddress,
                        billingLandmark: prev.shippingLandmark,
                      }));
                    }
                  }} 
                  className="w-4 h-4 mr-2" 
                />
                <label htmlFor="useSameAddress" className="text-sm font-medium">Billing address same as shipping address</label>
              </div>
              {!useSameAddress ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field 
                      label="Province" 
                      name="billingProvince" 
                      required 
                      value={form.billingProvince} 
                      onChange={handleChange} 
                      placeholder="Bagmati" 
                    />
                    <Field 
                      label="City" 
                      name="billingCity" 
                      required 
                      value={form.billingCity} 
                      onChange={handleChange} 
                      placeholder="Kathmandu" 
                    />
                  </div>
                  <Field 
                    label="Address" 
                    name="billingAddress" 
                    required 
                    value={form.billingAddress} 
                    onChange={handleChange} 
                    placeholder="Street address, P.O. box, company name" 
                  />
                  <Field 
                    label="Landmark (Optional)" 
                    name="billingLandmark" 
                    value={form.billingLandmark} 
                    onChange={handleChange} 
                    placeholder="Near XYZ building" 
                  />
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input type="radio" id="cod" name="paymentMethod" value="COD" checked={form.paymentMethod === "COD"} onChange={handleChange} className="w-4 h-4 mr-2" />
                  <label htmlFor="cod" className="text-sm font-medium">Cash on Delivery (COD)</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="online" name="paymentMethod" value="Online" checked={form.paymentMethod === "Online"} onChange={handleChange} className="w-4 h-4 mr-2" disabled />
                  <label htmlFor="online" className="text-sm font-medium text-gray-400">Online Payment (Coming Soon)</label>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Order Notes (Optional)</h2>
              <textarea name="orderNote" value={form.orderNote} onChange={handleChange} rows={4} className="w-full rounded-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" placeholder="Notes about your order, e.g. special notes for delivery" />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item: CartItem) => (
                  <div key={item.product._id} className="flex gap-4">
                    <div className="w-16 h-16 flex-shrink-0 relative">
                      <Image src={item.product.mainImage[0] || "/placeholder.jpg"} alt={item.product.name} fill sizes="64px" className="object-cover" />
                      <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">₹{item.product.basePrice?.toFixed(2)}</p>
                    </div>
                    <div className="text-sm font-medium">₹{(item.product.basePrice * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Shipping</span><span className="text-green-600">Free</span></div>
                <div className="flex justify-between text-sm"><span>Taxes</span><span>Calculated at checkout</span></div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
              </div>
              {error ? <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div> : null}
              <button type="submit" disabled={isSubmitting || isLoading} className="w-full bg-black text-white py-3 hover:bg-gray-800 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? "Processing..." : "Place Order"}
              </button>
              <Link href="/cart" className="block w-full text-center mt-3 text-gray-600 hover:text-black transition">Return to Cart</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

