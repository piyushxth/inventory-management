import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/libs/connnectMongoDB";
import { Order } from "@/libs/models/order";

/**
 * Verify an eSewa UAT v1 payment and mark the order as Paid on success.
 *
 * Security notes:
 * - The `amt` used to query eSewa MUST be the order's server-stored total, not
 *   whatever the client passed — otherwise an attacker can pay a smaller amount
 *   and mark the full order as Paid.
 * - The callback runs *server-side* to eSewa using the merchant scd from env.
 */
export async function POST(req: NextRequest) {
  try {
    const { oid, refId } = await req.json();
    if (!oid || !refId) {
      return NextResponse.json(
        { success: false, message: "Missing oid or refId" },
        { status: 400 }
      );
    }

    await connectMongoDB();
    const order = await Order.findById(oid);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Only eSewa orders can be verified here. Without this guard a caller
    // who knows a COD order id could force paymentStatus = "Failed" on the
    // failure path below.
    if (order.paymentMethod !== "Esewa") {
      return NextResponse.json(
        {
          success: false,
          message: "Order was not paid via eSewa",
        },
        { status: 400 }
      );
    }

    // Already paid — idempotent success response.
    if (order.paymentStatus === "Paid") {
      return NextResponse.json({ success: true, alreadyPaid: true });
    }

    // Verification only runs on an Unpaid order. If the order was already
    // marked Failed by a previous attempt, don't re-run verification (and
    // don't let anyone flip a manually-Refunded order back to Failed).
    if (order.paymentStatus !== "Unpaid") {
      return NextResponse.json(
        {
          success: false,
          message: `Order payment status is '${order.paymentStatus}'; cannot reverify`,
        },
        { status: 400 }
      );
    }

    const serverAmt = order.totalAmount;
    const scd = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
    const verifyUrl =
      process.env.ESEWA_VERIFY_URL || "https://uat.esewa.com.np/epay/transrec";

    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        amt: serverAmt.toString(),
        rid: refId,
        pid: oid,
        scd,
      }),
    });
    const data = await response.text();

    if (!data.includes("Success")) {
      order.paymentStatus = "Failed";
      await order.save();
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    order.paymentStatus = "Paid";
    order.paymentRefId = refId;
    if (order.orderStatus === "Pending") order.orderStatus = "Processing";
    await order.save();

    return NextResponse.json({ success: true, data: { orderId: order._id } });
  } catch (error) {
    console.error("eSewa verification error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during verification" },
      { status: 500 }
    );
  }
}
