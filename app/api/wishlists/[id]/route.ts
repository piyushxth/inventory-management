import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/libs/connnectMongoDB";
import { Wishlist } from "@/libs/models/wishlist";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    await connectMongoDB();
    const wishlist = await Wishlist.findById(id)
      .populate("user")
      .populate("products");
    if (!wishlist) {
      return NextResponse.json(
        { success: false, message: "Wishlist not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, data: wishlist },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    const updateData = await req.json();
    await connectMongoDB();
    const updatedWishlist = await Wishlist.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("user")
      .populate("products");
    if (!updatedWishlist) {
      return NextResponse.json(
        { success: false, message: "Wishlist not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Wishlist updated successfully",
        data: updatedWishlist,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    await connectMongoDB();
    const deletedWishlist = await Wishlist.findByIdAndDelete(id);
    if (!deletedWishlist) {
      return NextResponse.json(
        { success: false, message: "Wishlist not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: "Wishlist deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete wishlist" },
      { status: 500 }
    );
  }
}
