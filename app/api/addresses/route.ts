import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../libs/connnectMongoDB";
import { Address } from "../../../libs/models/address";

export async function POST(req: NextRequest) {
  try {
    const addressData = await req.json();
    await connectMongoDB();
    const newAddress = new Address(addressData);
    const savedAddress = await newAddress.save();
    return NextResponse.json(
      {
        success: true,
        message: "Address created successfully",
        data: savedAddress,
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
    const addresses = await Address.find();
    return NextResponse.json(
      { success: true, data: addresses },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}
