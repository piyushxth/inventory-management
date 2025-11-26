import { Inter } from "next/font/google";
import "@/app/(root)/homeGlobals.css";
import ClientProviders from "@/components/client/ClientProviders";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <ClientProviders>
          <div className={`${inter.className}`}>
            <div className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
              <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-3 items-center h-14">
                  <div />
                  <div className="flex justify-center">
                    <span className="text-xl font-semibold tracking-widest">
                      ICONIC
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <Link
                      href="/cart"
                      className="inline-flex items-center rounded-full p-2 hover:bg-gray-100"
                    >
                      <ShoppingCart className="h-6 w-6" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {children}
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
