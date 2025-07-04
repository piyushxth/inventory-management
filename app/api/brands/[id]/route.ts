import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../../libs/connnectMongoDB";
import { Brand } from "../../../../libs/models/brand";

// GET single brand
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    await connectMongoDB();
    const brand = await Brand.findById(id);

    if (!brand) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: brand }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}

// PUT update brand
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const brandData = await req.json();
    await connectMongoDB();

    // Check if brand exists
    const existingBrand = await Brand.findById(id);
    if (!existingBrand) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 }
      );
    }

    // Check if name already exists (excluding current brand)
    if (brandData.name) {
      const duplicateBrand = await Brand.findOne({
        name: brandData.name,
        _id: { $ne: id },
      });

      if (duplicateBrand) {
        return NextResponse.json(
          { success: false, message: "Brand name already exists" },
          { status: 400 }
        );
      }
    }

    const updatedBrand = await Brand.findByIdAndUpdate(id, brandData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Brand updated successfully",
        data: updatedBrand,
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

// DELETE brand
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    await connectMongoDB();

    const brand = await Brand.findById(id);
    if (!brand) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 }
      );
    }

    await Brand.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Brand deleted successfully",
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
