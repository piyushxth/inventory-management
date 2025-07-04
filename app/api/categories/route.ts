import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../libs/connnectMongoDB";
import { Category } from "../../../libs/models/category";

export async function POST(req: NextRequest) {
  try {
    const categoryData = await req.json();
    await connectMongoDB();
    const existingCategory = await Category.findOne({
      name: categoryData.name,
    });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 400 }
      );
    }
    const newCategory = new Category(categoryData);
    const savedCategory = await newCategory.save();
    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: savedCategory,
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
    const categories = await Category.find();
    return NextResponse.json(
      { success: true, data: categories },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "No category IDs provided" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Check if all categories exist
    const existingCategories = await Category.find({ _id: { $in: ids } });
    if (existingCategories.length !== ids.length) {
      return NextResponse.json(
        { success: false, message: "Some categories not found" },
        { status: 404 }
      );
    }

    // Delete categories
    await Category.deleteMany({ _id: { $in: ids } });

    return NextResponse.json(
      {
        success: true,
        message: `${ids.length} category(ies) deleted successfully`,
      },
      { status: 200 }
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
