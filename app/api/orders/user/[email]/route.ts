import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/libs/connnectMongoDB";
import { Order } from "@/libs/models/order";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const email = (await params).email;
  
  try {
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