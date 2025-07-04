import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../libs/connnectMongoDB";
import { Cart } from "../../../libs/models/cart";

export async function POST(req: NextRequest) {
  try {
    const cartData = await req.json();
    await connectMongoDB();
    const newCart = new Cart(cartData);
    const savedCart = await newCart.save();
    return NextResponse.json(
      { success: true, message: "Cart created successfully", data: savedCart },
      { status: 201 }
    );
  } catch (error) {
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

export async function GET() {
  try {
    await connectMongoDB();
    const carts = await Cart.find().populate("user").populate("items.product");
    return NextResponse.json({ success: true, data: carts }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch carts" },
      { status: 500 }
    );
  }
}
