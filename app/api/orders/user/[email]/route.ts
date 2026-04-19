import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectMongoDB from "@/libs/connnectMongoDB";
import { Order } from "@/libs/models/order";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const email = decodeURIComponent((await params).email).toLowerCase();

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    // Only the owner of this email or an admin can list these orders.
    const isAdmin = token.role === "admin";
    const requesterEmail =
      typeof token.email === "string" ? token.email.toLowerCase() : null;
    if (!isAdmin && requesterEmail !== email) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    await connectMongoDB();
    const orders = await Order.find({ "customer.email": email })
      .populate("items.product", "name mainImage")
      .sort({ createdDate: -1 });

    return NextResponse.json(
      { success: true, data: orders },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
