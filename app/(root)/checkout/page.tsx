import { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout · Ecommerce",
  description: "Complete your order",
};

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Checkout</h1>
      <CheckoutClient />
    </main>
  );
}
