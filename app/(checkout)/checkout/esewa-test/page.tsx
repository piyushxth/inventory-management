"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function EsewaTest() {
  const router = useRouter();

  const testEsewaPayment = () => {
    // Create a form to submit to eSewa
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = process.env.NEXT_PUBLIC_ESEWA_PAYMENT_URL || 'https://uat.esewa.com.np/epay/main';
    
    // Add eSewa required fields
    const fields = {
      amt: 100,
      psc: 0,
      pdc: 0,
      txAmt: 0,
      tAmt: 100,
      pid: "TEST_ORDER_123",
      scd: process.env.NEXT_PUBLIC_ESEWA_MERCHANT_ID || 'EPAYTEST',
      su: `${window.location.origin}/checkout/esewa-success`,
      fu: `${window.location.origin}/checkout/esewa-failure`
    };
    
    // Add hidden input fields
    Object.keys(fields).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = fields[key as keyof typeof fields].toString();
      form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">eSewa Test Page</h1>
        <p className="text-gray-600 mb-6">Click the button below to test eSewa payment integration</p>
        
        <button
          onClick={testEsewaPayment}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
        >
          Test eSewa Payment
        </button>
        
        <div className="mt-8 p-4 bg-gray-100 rounded-md text-left max-w-2xl mx-auto">
          <h2 className="font-bold mb-2">Debug Information:</h2>
          <p><strong>NEXT_PUBLIC_ESEWA_PAYMENT_URL:</strong> {process.env.NEXT_PUBLIC_ESEWA_PAYMENT_URL || 'Not set'}</p>
          <p><strong>NEXT_PUBLIC_ESEWA_MERCHANT_ID:</strong> {process.env.NEXT_PUBLIC_ESEWA_MERCHANT_ID || 'Not set'}</p>
          <p><strong>Window Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Unknown'}</p>
        </div>
        
        <button
          onClick={() => router.push('/checkout')}
          className="mt-6 text-blue-600 hover:text-blue-800 underline"
        >
          Back to Checkout
        </button>
      </div>
    </div>
  );
}