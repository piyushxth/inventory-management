import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../libs/connnectMongoDB";
import { Product } from "../../../libs/models/product";
import "../../../libs/models/category";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const productData = await req.json();
    await connectMongoDB();
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: savedProduct,
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
    const products = await Product.find().populate("category", "name");
    return NextResponse.json(
      { success: true, data: products },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product IDs array is required" },
        { status: 400 }
      );
    }

    // Validate all IDs are valid ObjectIds
    const validIds = ids.filter((id: string) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validIds.length !== ids.length) {
      return NextResponse.json(
        { success: false, message: "Some product IDs are invalid" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Delete multiple products
    const deleteResult = await Product.deleteMany({ _id: { $in: validIds } });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "No products found to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `${deleteResult.deletedCount} product(s) deleted successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
