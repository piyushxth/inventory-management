import connectMongoDB from "../connnectMongoDB";
import { Wishlist } from "../models/wishlist";
import { User } from "../models/users";
import { Product } from "../models/product";
import mongoose from "mongoose";

export async function seedWishlist() {
  try {
    await connectMongoDB({ seed: true });
    await Wishlist.deleteMany({});
    console.log("🗑️ All existing wishlists deleted.");

    // Fetch the first user and product
    const firstUser = await User.findOne();
    if (!firstUser) throw new Error("No users found. Please seed users first.");
    const firstUserId = firstUser._id;
    const firstProduct = await Product.findOne();
    if (!firstProduct)
      throw new Error("No products found. Please seed products first.");
    const firstProductId = firstProduct._id;

    const wishlistData = {
      user: firstUserId, // Use the first user's ObjectId
      products: [firstProductId], // Use the first product's ObjectId
    };

    const newWishlist = new Wishlist(wishlistData);
    await newWishlist.save();
    console.log(`✅ Seeded wishlist for user: ${wishlistData.user}`);
    console.log("🎉 Wishlist seeding completed.");
  } catch (err) {
    console.error("❌ Error during wishlist seeding:", err);
    throw err;
  }
}
