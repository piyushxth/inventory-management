import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/libs/connnectMongoDB";
import { Order } from "@/libs/models/order";
import { Product } from "@/libs/models/product";
import { StockMovement } from "@/libs/models/stockMovement";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    await connectMongoDB();
    const order = await Order.findById(id).populate("items.product");
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
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
  const id = (await params).id;
  try {
    const updateData = await req.json();
    await connectMongoDB();
    const prevOrder = await Order.findById(id);
    if (!prevOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }
    // If order is being cancelled and was not already cancelled
    if (
      updateData.orderStatus === "Cancelled" &&
      prevOrder.orderStatus !== "Cancelled"
    ) {
      // Restock products and log stock movement
      for (const item of prevOrder.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.availableQuantity += item.quantity;
          product.soldQuantity -= item.quantity;
          await product.save();
          await StockMovement.create({
            product: product._id,
            quantity: item.quantity,
            type: "return",
            note: `Order cancelled`,
            // createdBy: can be set if user info is available
          });
        }
      }
    }
    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    });
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
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
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
    return NextResponse.json(
      { success: false, message: "Failed to delete order" },
      { status: 500 }
    );
  }
}
