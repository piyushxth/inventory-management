import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../libs/connnectMongoDB";
import { Brand } from "../../../libs/models/brand";

export async function POST(req: NextRequest) {
  try {
    const brandData = await req.json();
    await connectMongoDB();
    const existingBrand = await Brand.findOne({ name: brandData.name });
    if (existingBrand) {
      return NextResponse.json(
        { success: false, message: "Brand already exists" },
        { status: 400 }
      );
    }
    const newBrand = new Brand(brandData);
    const savedBrand = await newBrand.save();
    return NextResponse.json(
      {
        success: true,
        message: "Brand created successfully",
        data: savedBrand,
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
    const brands = await Brand.find();
    return NextResponse.json({ success: true, data: brands }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "No brand IDs provided" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Check if all brands exist
    const existingBrands = await Brand.find({ _id: { $in: ids } });
    if (existingBrands.length !== ids.length) {
      return NextResponse.json(
        { success: false, message: "Some brands not found" },
        { status: 404 }
      );
    }

    // Delete brands
    await Brand.deleteMany({ _id: { $in: ids } });

    return NextResponse.json(
      {
        success: true,
        message: `${ids.length} brand(s) deleted successfully`,
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
