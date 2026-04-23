import "server-only";

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { authOptions } from "@/libs/authOptions";
import connectMongoDB from "@/libs/connnectMongoDB";
import {
  Address,
  Cart,
  CartItem,
  Order,
  OrderItem,
  ProductVariant,
} from "@/libs/models";

export const dynamic = "force-dynamic";

type ShippingInput = {
  fullName?: unknown;
  line1?: unknown;
  line2?: unknown;
  city?: unknown;
  state?: unknown;
  postalCode?: unknown;
  country?: unknown;
  phone?: unknown;
  contactEmail?: unknown;
  notes?: unknown;
};

type ItemInput = { variantId?: unknown; quantity?: unknown };

type CreateOrderBody = {
  items?: ItemInput[];
  shipping?: ShippingInput;
};

function trimString(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isNonEmpty(s: string): boolean {
  return s.length > 0;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be signed in to place an order." },
      { status: 401 },
    );
  }
  const userId = session.user.id as string;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  }
  const uid = new mongoose.Types.ObjectId(userId);

  let body: CreateOrderBody;
  try {
    body = (await req.json()) as CreateOrderBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // --- Validate shipping address --------------------------------------------
  const s = body.shipping ?? {};
  const fullName = trimString(s.fullName, 120);
  const line1 = trimString(s.line1, 200);
  const line2 = trimString(s.line2, 200);
  const city = trimString(s.city, 100);
  const state = trimString(s.state, 100);
  const postalCode = trimString(s.postalCode, 20);
  const country = trimString(s.country, 60);
  const phone = trimString(s.phone, 40);
  const contactEmail = trimString(s.contactEmail, 254);
  const notes = trimString(s.notes, 500);

  const missing: string[] = [];
  if (!isNonEmpty(fullName)) missing.push("fullName");
  if (!isNonEmpty(line1)) missing.push("line1");
  if (!isNonEmpty(city)) missing.push("city");
  if (!isNonEmpty(state)) missing.push("state");
  if (!isNonEmpty(postalCode)) missing.push("postalCode");
  if (!isNonEmpty(country)) missing.push("country");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required shipping fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  // --- Validate items -------------------------------------------------------
  const rawItems = Array.isArray(body.items) ? body.items : [];
  // Collapse duplicate variantIds by summing quantities.
  const bucket = new Map<string, number>();
  for (const it of rawItems) {
    const vid = typeof it.variantId === "string" ? it.variantId : "";
    if (!mongoose.Types.ObjectId.isValid(vid)) continue;
    const q =
      typeof it.quantity === "number" && Number.isFinite(it.quantity)
        ? Math.floor(it.quantity)
        : 0;
    if (q <= 0) continue;
    bucket.set(vid, (bucket.get(vid) ?? 0) + q);
  }
  if (bucket.size === 0) {
    return NextResponse.json(
      { error: "Cart is empty" },
      { status: 400 },
    );
  }

  await connectMongoDB();

  // --- Load live variants, re-compute price + verify stock ------------------
  const variantIds = [...bucket.keys()].map(
    (id) => new mongoose.Types.ObjectId(id),
  );
  const variants = await ProductVariant.find({ _id: { $in: variantIds } })
    .select({ price: 1, salePrice: 1, inStock: 1 })
    .lean();
  if (variants.length !== bucket.size) {
    return NextResponse.json(
      { error: "One or more items are no longer available." },
      { status: 409 },
    );
  }

  const outOfStock: string[] = [];
  const lineItems: Array<{
    variantId: mongoose.Types.ObjectId;
    quantity: number;
    priceAtPurchase: number;
  }> = [];
  let totalAmount = 0;
  for (const v of variants) {
    const idStr = String(v._id);
    const qty = bucket.get(idStr) ?? 0;
    if (qty <= 0) continue;
    if (v.inStock < qty) {
      outOfStock.push(idStr);
      continue;
    }
    const unitPrice =
      typeof v.salePrice === "number" && v.salePrice >= 0
        ? v.salePrice
        : v.price;
    lineItems.push({
      variantId: v._id,
      quantity: qty,
      priceAtPurchase: unitPrice,
    });
    totalAmount += unitPrice * qty;
  }
  if (outOfStock.length > 0) {
    return NextResponse.json(
      {
        error: "Insufficient stock for one or more items.",
        variantIds: outOfStock,
      },
      { status: 409 },
    );
  }

  // --- Create Address, Order, OrderItems ------------------------------------
  const address = await Address.create({
    userId: uid,
    fullName,
    line1,
    line2,
    city,
    state,
    postalCode,
    country,
    phone,
    isDefault: false,
  });

  let order;
  try {
    order = await Order.create({
      userId: uid,
      status: "pending",
      totalAmount,
      shippingAddressId: address._id,
      billingAddressId: address._id,
      notes,
      contactEmail,
    });
  } catch (err) {
    await Address.deleteOne({ _id: address._id }).catch(() => {});
    throw err;
  }
  const orderId = order._id;

  try {
    await OrderItem.insertMany(
      lineItems.map((li) => ({
        orderId,
        productVariantId: li.variantId,
        quantity: li.quantity,
        priceAtPurchase: li.priceAtPurchase,
      })),
    );

    // Decrement stock for each variant. Conditional $inc so we don't go
    // negative if two checkouts race.
    for (const li of lineItems) {
      const result = await ProductVariant.updateOne(
        { _id: li.variantId, inStock: { $gte: li.quantity } },
        { $inc: { inStock: -li.quantity } },
      );
      if (result.modifiedCount !== 1) {
        // Best-effort rollback: stock ran out between our check and the
        // decrement. Remove the order and bail out.
        await OrderItem.deleteMany({ orderId });
        await Order.deleteOne({ _id: orderId });
        await Address.deleteOne({ _id: address._id });
        return NextResponse.json(
          {
            error: "Stock changed while placing the order. Please retry.",
          },
          { status: 409 },
        );
      }
    }
  } catch (err) {
    await OrderItem.deleteMany({ orderId }).catch(() => {});
    await Order.deleteOne({ _id: orderId }).catch(() => {});
    await Address.deleteOne({ _id: address._id }).catch(() => {});
    throw err;
  }

  // --- Clear user's server cart (best-effort; never blocks the response) ----
  try {
    const cart = await Cart.findOne({ userId: uid }).select({ _id: 1 }).lean();
    if (cart) {
      await CartItem.deleteMany({ cartId: cart._id });
    }
  } catch {
    // Ignore — order is already persisted.
  }

  return NextResponse.json(
    {
      orderId: String(orderId),
      totalAmount,
      status: "pending",
    },
    { status: 201 },
  );
}
