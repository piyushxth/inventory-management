import connectMongoDB from "../connnectMongoDB";
import { Cart } from "../models/cart";
import { User } from "../models/users";
import { Product } from "../models/product";
import mongoose from "mongoose";

export async function seedCart() {
  try {
    await connectMongoDB({ seed: true });
    await Cart.deleteMany({});
    console.log("🗑️ All existing carts deleted.");

    // Fetch the first user and product
    const firstUser = await User.findOne();
    if (!firstUser) throw new Error("No users found. Please seed users first.");
    const firstUserId = firstUser._id;
    const firstProduct = await Product.findOne();
    if (!firstProduct)
      throw new Error("No products found. Please seed products first.");
    const firstProductId = firstProduct._id;

    const cartData = {
      user: firstUserId, // Use the first user's ObjectId
      items: [
        {
          product: firstProductId, // Use the first product's ObjectId
          quantity: 2,
        },
      ],
    };

    const newCart = new Cart(cartData);
    await newCart.save();
    console.log(`✅ Seeded cart for user: ${cartData.user}`);
    console.log("🎉 Cart seeding completed.");
  } catch (err) {
    console.error("❌ Error during cart seeding:", err);
    throw err;
  }
}
