import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/libs/authOptions";
import connectMongoDB from "@/libs/connnectMongoDB";
import { Address, Order, OrderItem, ProductVariant } from "@/libs/models";

export const metadata: Metadata = {
  title: "Order placed · Ecommerce",
};

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

async function loadOrder(orderId: string, userId: string) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) return null;
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  await connectMongoDB();

  const order = await Order.findOne({
    _id: new mongoose.Types.ObjectId(orderId),
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();
  if (!order) return null;

  const [items, address] = await Promise.all([
    OrderItem.find({ orderId: order._id }).lean(),
    Address.findById(order.shippingAddressId).lean(),
  ]);

  const variantIds = items.map((i) => i.productVariantId);
  const variants = await ProductVariant.find({ _id: { $in: variantIds } })
    .select({ sku: 1 })
    .lean();
  const skuByVariant = new Map(variants.map((v) => [String(v._id), v.sku]));

  return {
    order,
    address,
    items: items.map((i) => ({
      variantId: String(i.productVariantId),
      sku: skuByVariant.get(String(i.productVariantId)) ?? "",
      quantity: i.quantity,
      priceAtPurchase: i.priceAtPurchase,
    })),
  };
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const { orderId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/client/login");
  }

  const loaded = await loadOrder(orderId, session.user.id);
  if (!loaded) notFound();
  const { order, address, items } = loaded;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Thanks for your order!
        </h1>
        <p className="text-sm text-neutral-600">
          Order <span className="font-mono">{String(order._id)}</span> was
          placed successfully. Status:{" "}
          <span className="font-medium capitalize">{order.status}</span>.
        </p>
      </header>

      <section className="mb-6 rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Items</h2>
        <ul className="divide-y">
          {items.map((item) => (
            <li
              key={item.variantId}
              className="flex items-baseline justify-between py-3 text-sm"
            >
              <span className="font-mono text-xs text-neutral-500">
                {item.sku || item.variantId}
              </span>
              <span>
                {item.quantity} × {formatPrice(item.priceAtPurchase)}
              </span>
              <span className="font-medium tabular-nums">
                {formatPrice(item.priceAtPurchase * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between border-t pt-4 text-sm">
          <span>Total</span>
          <span className="text-base font-semibold">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </section>

      {address ? (
        <section className="mb-6 rounded-lg border p-6">
          <h2 className="mb-3 text-lg font-semibold">Shipping to</h2>
          <address className="not-italic text-sm leading-6 text-neutral-700">
            {address.fullName}
            <br />
            {address.line1}
            {address.line2 ? (
              <>
                <br />
                {address.line2}
              </>
            ) : null}
            <br />
            {address.city}, {address.state} {address.postalCode}
            <br />
            {address.country}
            {address.phone ? (
              <>
                <br />
                {address.phone}
              </>
            ) : null}
          </address>
        </section>
      ) : null}

      <div className="flex gap-3">
        <Link
          href="/products"
          className="inline-flex h-10 items-center rounded-full border px-5 text-sm font-medium"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
