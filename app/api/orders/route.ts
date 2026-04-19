import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import connectMongoDB from "../../../libs/connnectMongoDB";
import { Order, IOrderItem } from "../../../libs/models/order";
import { Product } from "../../../libs/models/product";
import { Variant, IVariant } from "../../../libs/models/variant";
import { StockMovement } from "../../../libs/models/stockMovement";
import { User } from "../../../libs/models/users";
import { OrderCreateSchema } from "@/libs/zod_schema/orderCreate";

/**
 * Create an order.
 *
 * The client only sends product/variant/size/quantity. All pricing is computed
 * server-side from the Variant.options entries so the client cannot tamper
 * with totals. Stock is decremented atomically against variant.options[].quantity
 * using a positional filter so concurrent orders can't oversell.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OrderCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order data",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }
    const input = parsed.data;

    await connectMongoDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Resolve authenticated user (if any) so we can attach user ref to order.
    let userId: mongoose.Types.ObjectId | undefined;
    if (token?.email) {
      const authedUser = await User.findOne({ email: token.email }).select("_id");
      if (authedUser) userId = authedUser._id;
    }

    // Pre-compute all items with server-side price + stock validation.
    type Resolved = {
      productId: mongoose.Types.ObjectId;
      variantId?: mongoose.Types.ObjectId;
      size?: string;
      quantity: number;
      price: number;
      productName: string;
      productImage?: string;
      color?: string;
      colorHex?: string;
      sku?: string;
    };
    const resolved: Resolved[] = [];
    let subtotal = 0;

    for (const item of input.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          { success: false, message: "Product not found." },
          { status: 400 }
        );
      }

      let price = product.basePrice;
      let variant: IVariant | null = null;
      let sizeOption:
        | { size: string; price: number; quantity: number; sku: string }
        | undefined;

      if (item.variant) {
        variant = await Variant.findById(item.variant);
        if (!variant) {
          return NextResponse.json(
            { success: false, message: "Variant not found." },
            { status: 400 }
          );
        }
        if (!item.size) {
          return NextResponse.json(
            {
              success: false,
              message: `Size is required for ${product.name}`,
            },
            { status: 400 }
          );
        }
        sizeOption = variant.options.find((o) => o.size === item.size);
        if (!sizeOption) {
          return NextResponse.json(
            {
              success: false,
              message: `Size "${item.size}" not available for ${product.name}`,
            },
            { status: 400 }
          );
        }
        if (sizeOption.quantity < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              message: `Not enough stock for ${product.name} (${variant.color}, ${sizeOption.size}). Only ${sizeOption.quantity} left.`,
            },
            { status: 400 }
          );
        }
        price = sizeOption.price;
      }

      subtotal += price * item.quantity;
      resolved.push({
        productId: product._id as unknown as mongoose.Types.ObjectId,
        variantId: variant
          ? (variant._id as unknown as mongoose.Types.ObjectId)
          : undefined,
        size: sizeOption?.size,
        quantity: item.quantity,
        price,
        productName: product.name,
        productImage: product.mainImage?.[0],
        color: variant?.color,
        colorHex: variant?.colorHex,
        sku: sizeOption?.sku,
      });
    }

    const shippingFee = 0;
    const tax = 0;
    const discount = 0;
    const totalAmount = subtotal + shippingFee + tax - discount;

    // Atomically decrement each variant's size quantity.
    const decremented: Resolved[] = [];
    for (const r of resolved) {
      if (!r.variantId || !r.size) continue;
      const updated = await Variant.findOneAndUpdate(
        {
          _id: r.variantId,
          options: { $elemMatch: { size: r.size, quantity: { $gte: r.quantity } } },
        },
        { $inc: { "options.$.quantity": -r.quantity } },
        { new: true }
      );
      if (!updated) {
        // Rollback previous decrements.
        for (const d of decremented) {
          if (!d.variantId || !d.size) continue;
          await Variant.updateOne(
            { _id: d.variantId, "options.size": d.size },
            { $inc: { "options.$.quantity": d.quantity } }
          );
        }
        return NextResponse.json(
          {
            success: false,
            message: `Stock changed for ${r.productName}. Please try again.`,
          },
          { status: 409 }
        );
      }
      decremented.push(r);
    }

    // Build order items conforming to IOrderItem.
    const orderItems: IOrderItem[] = resolved.map((r) => ({
      product: r.productId,
      productName: r.productName,
      productImage: r.productImage,
      variant: r.variantId,
      color: r.color,
      colorHex: r.colorHex,
      size: r.size,
      sku: r.sku,
      quantity: r.quantity,
      price: r.price,
    }));

    try {
      const newOrder = new Order({
        user: userId,
        customer: input.customer,
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress,
        items: orderItems,
        subtotal,
        shippingFee,
        tax,
        discount,
        totalAmount,
        currency: "NPR",
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === "COD" ? "Unpaid" : "Unpaid",
        orderNote: input.orderNote,
        stockDecremented: true,
      });
      const savedOrder = await newOrder.save();

      // Record stock movements (non-critical — don't roll back order on failure).
      for (const r of resolved) {
        try {
          await StockMovement.create({
            product: r.productId,
            quantity: -r.quantity,
            type: "sale",
            note: `Order ${savedOrder._id}`,
          });
        } catch (movementErr) {
          console.error("Failed to create stock movement:", movementErr);
        }
      }

      return NextResponse.json(
        {
          success: true,
          message: "Order created successfully",
          data: savedOrder,
        },
        { status: 201 }
      );
    } catch (err) {
      // Order save failed — roll back the variant decrements so stock is consistent.
      for (const d of decremented) {
        if (!d.variantId || !d.size) continue;
        await Variant.updateOne(
          { _id: d.variantId, "options.size": d.size },
          { $inc: { "options.$.quantity": d.quantity } }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

// List orders — admin only.
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    await connectMongoDB();
    const orders = await Order.find()
      .populate("items.product", "name mainImage")
      .sort({ createdDate: -1 });
    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
