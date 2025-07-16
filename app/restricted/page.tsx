import React from "react";

const RestrictedPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
    <h1 className="text-4xl font-bold text-red-600 mb-4">Access Restricted</h1>
    <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
      You are not authorized to access the admin panel.
    </p>
    <a
      href="/"
      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Go to Home
    </a>
  </div>
);

export default RestrictedPage;
