import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import { HydratedDocument } from "mongoose";
import connectMongoDB from "@/libs/connnectMongoDB";
import { Order, IOrder } from "@/libs/models/order";
import { Variant } from "@/libs/models/variant";
import { StockMovement } from "@/libs/models/stockMovement";
import { User } from "@/libs/models/users";

type OrderDoc = HydratedDocument<IOrder>;

// GET is intentionally permissive: POST /api/orders supports guest checkout,
// so guests need to be able to load their order on /checkout/order-success
// and /order-tracking using only the order id (which is a 96-bit Mongo
// ObjectId and effectively unguessable). If a session *is* present and the
// caller is not the owner or an admin, we still return 403 to prevent a
// logged-in user from enumerating somebody else's order via the UI.
async function fetchOrderForRead(
  req: NextRequest,
  orderId: string
): Promise<
  | { ok: true; order: OrderDoc }
  | { ok: false; status: number; message: string }
> {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { ok: false, status: 400, message: "Invalid order id" };
  }
  await connectMongoDB();
  const order = await Order.findById(orderId).populate("items.product");
  if (!order) {
    return { ok: false, status: 404, message: "Order not found" };
  }
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token && token.role !== "admin") {
    const user = token.email
      ? await User.findOne({ email: token.email }).select("_id email")
      : null;
    const ownsByUserId =
      order.user && user && order.user.toString() === user._id.toString();
    const ownsByEmail = user?.email === order.customer?.email;
    if (!ownsByUserId && !ownsByEmail) {
      return { ok: false, status: 403, message: "Forbidden" };
    }
  }
  return { ok: true, order };
}

// Restock items from a cancelled order. Uses an atomic conditional update on
// `stockDecremented` so that concurrent cancels / retries can't re-increment
// the same variant stock more than once, and wraps StockMovement.create in
// try/catch so a failed audit row can't stop the restock loop (leaving the
// order in a partially-restocked state that would double-up on retry).
async function restockCancelledOrder(order: OrderDoc): Promise<void> {
  const mark = await Order.updateOne(
    { _id: order._id, stockDecremented: true },
    { $set: { stockDecremented: false } }
  );
  if (mark.modifiedCount === 0) {
    return; // already restocked (or never decremented)
  }
  for (const item of order.items) {
    if (!item.variant || !item.size) continue;
    try {
      await Variant.updateOne(
        { _id: item.variant, "options.size": item.size },
        { $inc: { "options.$.quantity": item.quantity } }
      );
    } catch (err) {
      console.error(
        `Failed to restock variant ${item.variant} / ${item.size} for order ${order._id}:`,
        err
      );
      continue;
    }
    try {
      await StockMovement.create({
        product: item.product,
        quantity: item.quantity,
        type: "return",
        note: `Order ${order._id} cancelled`,
      });
    } catch (err) {
      // Audit-log failures are non-fatal — the stock itself is already
      // restored. Swallow so the loop keeps going.
      console.error(
        `Failed to log StockMovement for order ${order._id}, item ${item.product}:`,
        err
      );
    }
  }
}

// Write access always requires a session + ownership (or admin).
async function ensureOrderWriteAccess(
  req: NextRequest,
  orderId: string
): Promise<
  | { ok: true; order: OrderDoc; isAdmin: boolean }
  | { ok: false; status: number; message: string }
> {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { ok: false, status: 400, message: "Invalid order id" };
  }
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
  await connectMongoDB();
  const order = await Order.findById(orderId).populate("items.product");
  if (!order) {
    return { ok: false, status: 404, message: "Order not found" };
  }
  const isAdmin = token.role === "admin";
  if (!isAdmin) {
    const user = token.email
      ? await User.findOne({ email: token.email }).select("_id email")
      : null;
    const ownsByUserId =
      order.user && user && order.user.toString() === user._id.toString();
    const ownsByEmail = user?.email === order.customer?.email;
    if (!ownsByUserId && !ownsByEmail) {
      return { ok: false, status: 403, message: "Forbidden" };
    }
  }
  return { ok: true, order, isAdmin };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const access = await fetchOrderForRead(req, id);
    if (!access.ok) {
      return NextResponse.json(
        { success: false, message: access.message },
        { status: access.status }
      );
    }
    return NextResponse.json(
      { success: true, data: access.order },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const access = await ensureOrderWriteAccess(req, id);
    if (!access.ok) {
      return NextResponse.json(
        { success: false, message: access.message },
        { status: access.status }
      );
    }
    const prevOrder = access.order!;
    const updateData = await req.json();

    // Non-admin callers can only cancel their own order (while still cancellable)
    // and may add/update an order note.
    let allowed: Record<string, unknown> = {};
    if (access.isAdmin) {
      allowed = updateData;
    } else {
      if (updateData.orderStatus === "Cancelled") {
        if (!["Pending", "Processing"].includes(prevOrder.orderStatus)) {
          return NextResponse.json(
            { success: false, message: "Order can no longer be cancelled" },
            { status: 400 }
          );
        }
        allowed.orderStatus = "Cancelled";
      }
      if (typeof updateData.orderNote === "string") {
        allowed.orderNote = updateData.orderNote;
      }
    }

    // If order is being cancelled and wasn't already cancelled, restock.
    if (
      allowed.orderStatus === "Cancelled" &&
      prevOrder.orderStatus !== "Cancelled"
    ) {
      await restockCancelledOrder(prevOrder);
      // restockCancelledOrder already flips stockDecremented atomically, so
      // we don't include it in `allowed` here.
      delete (allowed as Record<string, unknown>).stockDecremented;
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, allowed, {
      new: true,
    });
    return NextResponse.json(
      {
        success: true,
        message: "Order updated successfully",
        data: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 }
    );
  }
}

// Admin-only partial update. Runs the same cancellation restock logic as
// PUT so that an admin flipping orderStatus → "Cancelled" via PATCH doesn't
// skip the variant stock restore.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order id" },
        { status: 400 }
      );
    }
    await connectMongoDB();
    const updateData = await req.json();

    const prevOrder = await Order.findById(id).populate("items.product");
    if (!prevOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (
      updateData.orderStatus === "Cancelled" &&
      prevOrder.orderStatus !== "Cancelled"
    ) {
      await restockCancelledOrder(prevOrder);
      // Don't let the caller override stockDecremented — restockCancelledOrder
      // owns that flag.
      delete updateData.stockDecremented;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate("items.product");

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order updated successfully",
        data: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 }
    );
  }
}

// Admin-only hard delete.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    await connectMongoDB();
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete order" },
      { status: 500 }
    );
  }
}
