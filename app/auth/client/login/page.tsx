"use client";
import React from "react";
import SignInForm from "@/components/admin/auth/SignInForm";

export default function ClientLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-teal-400 to-blue-300 animate-gradient-x">
      <div className="w-full max-w-md bg-white/90 p-8 rounded-2xl shadow-2xl backdrop-blur-md border border-green-100 flex flex-col items-center animate-fade-in">
        {/* Logo Placeholder */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-2 shadow-lg">
            <span className="text-white text-3xl font-bold">C</span>
          </div>
          <span className="text-green-700 font-bold text-lg tracking-widest">
            CUSTOMER
          </span>
        </div>
        <h2 className="text-3xl font-extrabold mb-4 text-center text-green-900 drop-shadow">
          Customer Login
        </h2>
        <p className="mb-6 text-green-700 text-center text-sm">
          Sign in to your customer account
        </p>
        <SignInForm />
        <div className="mt-6 text-gray-500 text-xs text-center">
          Welcome! Please sign in to your customer account.
          <br />
          <span className="text-green-600 font-semibold">
            Need help? Contact support.
          </span>
        </div>
      </div>
      <style jsx global>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
