import ClientProviders from "@/components/client/ClientProviders";
import { ShoppingCart } from "lucide-react";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
import "@/app/(checkout)/checkoutGlobals.css";

const outfit = Outfit({
  subsets: ["latin"],
});
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
            <div className="border-b bg-white/90 backdrop-blur">
              <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-3 items-center h-14">
                  <div />
                  <div className="flex justify-center">
                    <Link href={"/"} className="text-xl font-semibold tracking-widest">
                      ICONIC
                    </Link>
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