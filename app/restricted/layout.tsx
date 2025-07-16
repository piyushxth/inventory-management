import React from "react";

export default function RestrictedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
        {children}
      </body>
    </html>
  );
}
