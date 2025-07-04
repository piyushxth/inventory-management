import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../../libs/connnectMongoDB";
import { Review } from "../../../../libs/models/review";

// GET single review
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    await connectMongoDB();
    const review = await Review.findById(id)
      .populate("product", "name")
      .populate("user", "name email");

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: review }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

// PUT update review
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const reviewData = await req.json();
    await connectMongoDB();

    // Check if review exists
    const existingReview = await Review.findById(id);
    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    const updatedReview = await Review.findByIdAndUpdate(id, reviewData, {
      new: true,
      runValidators: true,
    })
      .populate("product", "name")
      .populate("user", "name email");

    return NextResponse.json(
      {
        success: true,
        message: "Review updated successfully",
        data: updatedReview,
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

// DELETE review
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    await connectMongoDB();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    await Review.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Review deleted successfully",
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
