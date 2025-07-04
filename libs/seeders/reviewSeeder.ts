import connectMongoDB from "../connnectMongoDB";
import { Review } from "../models/review";
import { User } from "../models/users";
import { Product } from "../models/product";
import mongoose from "mongoose";

export async function seedReview() {
  try {
    await connectMongoDB({ seed: true });
    await Review.deleteMany({});
    console.log("🗑️ All existing reviews deleted.");

    // Fetch the first user and product
    const firstUser = await User.findOne();
    if (!firstUser) throw new Error("No users found. Please seed users first.");
    const firstUserId = firstUser._id;
    const firstProduct = await Product.findOne();
    if (!firstProduct)
      throw new Error("No products found. Please seed products first.");
    const firstProductId = firstProduct._id;

    const reviewData = {
      product: firstProductId, // Use the first product's ObjectId
      user: firstUserId, // Use the first user's ObjectId
      rating: 5,
      comment: "Excellent product! Highly recommended.",
    };

    const newReview = new Review(reviewData);
    await newReview.save();
    console.log(`✅ Seeded review for product: ${reviewData.product}`);
    console.log("🎉 Review seeding completed.");
  } catch (err) {
    console.error("❌ Error during review seeding:", err);
    throw err;
  }
}
