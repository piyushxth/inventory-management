import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../libs/connnectMongoDB";
import { Review } from "../../../libs/models/review";

export async function POST(req: NextRequest) {
  try {
    const reviewData = await req.json();
    await connectMongoDB();
    const newReview = new Review(reviewData);
    const savedReview = await newReview.save();
    return NextResponse.json(
      {
        success: true,
        message: "Review created successfully",
        data: savedReview,
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
    const reviews = await Review.find()
      .populate("product", "name")
      .populate("user", "name email");
    return NextResponse.json({ success: true, data: reviews }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "No review IDs provided" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Check if all reviews exist
    const existingReviews = await Review.find({ _id: { $in: ids } });
    if (existingReviews.length !== ids.length) {
      return NextResponse.json(
        { success: false, message: "Some reviews not found" },
        { status: 404 }
      );
    }

    // Delete reviews
    await Review.deleteMany({ _id: { $in: ids } });

    return NextResponse.json(
      {
        success: true,
        message: `${ids.length} review(s) deleted successfully`,
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
