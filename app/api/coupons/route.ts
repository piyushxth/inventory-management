import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../libs/connnectMongoDB";
import { Coupon } from "../../../libs/models/coupon";

export async function POST(req: NextRequest) {
  try {
    const couponData = await req.json();
    await connectMongoDB();
    const existingCoupon = await Coupon.findOne({ code: couponData.code });
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, message: "Coupon already exists" },
        { status: 400 }
      );
    }
    const newCoupon = new Coupon(couponData);
    const savedCoupon = await newCoupon.save();
    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully",
        data: savedCoupon,
      },
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
    const coupons = await Coupon.find();
    return NextResponse.json({ success: true, data: coupons }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}
