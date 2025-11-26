"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Profile() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-500 mb-4">You need to be logged in to view this page</p>
          <Link href="/auth/client/login" className="inline-block bg-black text-white px-6 py-2 hover:bg-gray-800 transition">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="text-gray-900">{session.user.name || "Not provided"}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="text-gray-900">{session.user.email || "Not provided"}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <div className="text-gray-900 capitalize">{session.user.role || "user"}</div>
              </div>
            </div>
            
            <div className="mt-8">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Quick Links</h2>
            <nav className="space-y-2">
              <Link href="/my-orders" className="block py-2 text-gray-700 hover:text-black transition">
                My Orders
              </Link>
              <a href="#" className="block py-2 text-gray-700 hover:text-black transition">
                Saved Addresses
              </a>
              <a href="#" className="block py-2 text-gray-700 hover:text-black transition">
                Wishlist
              </a>
              <a href="#" className="block py-2 text-gray-700 hover:text-black transition">
                Payment Methods
              </a>
            </nav>
          </div>
          
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Account Settings</h2>
            <nav className="space-y-2">
              <a href="#" className="block py-2 text-gray-700 hover:text-black transition">
                Change Password
              </a>
              <a href="#" className="block py-2 text-gray-700 hover:text-black transition">
                Privacy Settings
              </a>
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full text-left py-2 text-gray-700 hover:text-black transition"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}