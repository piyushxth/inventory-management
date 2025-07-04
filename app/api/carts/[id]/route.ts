import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/libs/connnectMongoDB";
import { Cart } from "@/libs/models/cart";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    await connectMongoDB();
    const cart = await Cart.findById(id)
      .populate("user")
      .populate("items.product");
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: cart }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart" },
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
    const updatedCart = await Cart.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("user")
      .populate("items.product");
    if (!updatedCart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Cart updated successfully",
        data: updatedCart,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update cart" },
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
    const deletedCart = await Cart.findByIdAndDelete(id);
    if (!deletedCart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: "Cart deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete cart" },
      { status: 500 }
    );
  }
}
