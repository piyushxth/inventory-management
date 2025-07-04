import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../libs/connnectMongoDB";
import { Order } from "../../../libs/models/order";
import { Product } from "../../../libs/models/product";
import { StockMovement } from "../../../libs/models/stockMovement";

export async function POST(req: NextRequest) {
  try {
    const orderData = await req.json();
    await connectMongoDB();

    // Check stock for each product
    for (const item of orderData.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product not found.` },
          { status: 400 }
        );
      }
      if (product.availableQuantity < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Not enough stock for product: ${product.name}`,
          },
          { status: 400 }
        );
      }
    }

    // All in stock, proceed: decrement stock, increment soldQuantity, and log movement
    const updatedProducts: any[] = [];
    for (const item of orderData.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        // This should not happen due to previous check, but guard for safety
        return NextResponse.json(
          { success: false, message: `Product not found during stock update.` },
          { status: 400 }
        );
      }
      product.availableQuantity -= item.quantity;
      product.soldQuantity += item.quantity;
      await product.save();
      updatedProducts.push({ product, quantity: item.quantity });
      await StockMovement.create({
        product: product._id,
        quantity: -item.quantity,
        type: "sale",
        note: `Order created`,
        // createdBy: can be set if user info is available
      });
    }
    // Create the order
    let savedOrder;
    try {
      const newOrder = new Order(orderData);
      savedOrder = await newOrder.save();
    } catch (err) {
      // Rollback soldQuantity and availableQuantity if order creation fails
      for (const { product, quantity } of updatedProducts) {
        product.availableQuantity += quantity;
        product.soldQuantity -= quantity;
        await product.save();
      }
      throw err;
    }
    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: savedOrder,
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
    const orders = await Order.find();
    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "No order IDs provided" },
        { status: 400 }
      );
    }
    await connectMongoDB();
    const result = await Order.deleteMany({ _id: { $in: ids } });
    return NextResponse.json(
      {
        success: true,
        message: `${result.deletedCount} order(s) deleted successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to bulk delete orders" },
      { status: 500 }
    );
  }
}
