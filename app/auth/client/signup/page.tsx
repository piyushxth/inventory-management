"use client";
import ClientSignupForm from "@/components/client/ClientSignupForm";
import React from "react";

export default function ClientSignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-teal-400 to-blue-300">
      <div className="w-full max-w-md bg-white/90 p-8 rounded-2xl shadow-2xl backdrop-blur-md border border-green-100 flex flex-col items-center">
        {/* Logo Placeholder */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-2 shadow-lg">
            <span className="text-white text-3xl font-bold">C</span>
          </div>
          <span className="text-green-700 font-bold text-lg tracking-widest">
            CUSTOMER
          </span>
        </div>
        <h2 className="text-3xl font-extrabold mb-4 text-center text-green-900">
          Create Account
        </h2>
        <p className="mb-6 text-green-700 text-center text-sm">
          Sign up for a new customer account
        </p>
        <ClientSignupForm />
        <div className="mt-6 text-gray-500 text-xs text-center">
          Welcome! Please sign up for a new customer account.
          <br />
          <span className="text-green-600 font-semibold">
            Already have an account? <a href="/auth/client/login" className="underline">Sign in</a>
          </span>
        </div>
      </div>
    </div>
  );
}