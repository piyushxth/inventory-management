import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../libs/connnectMongoDB";
import { Wishlist } from "../../../libs/models/wishlist";

export async function POST(req: NextRequest) {
  try {
    const wishlistData = await req.json();
    await connectMongoDB();
    const newWishlist = new Wishlist(wishlistData);
    const savedWishlist = await newWishlist.save();
    return NextResponse.json(
      {
        success: true,
        message: "Wishlist created successfully",
        data: savedWishlist,
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
    const wishlists = await Wishlist.find()
      .populate("user")
      .populate("products");
    return NextResponse.json(
      { success: true, data: wishlists },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch wishlists" },
      { status: 500 }
    );
  }
}
