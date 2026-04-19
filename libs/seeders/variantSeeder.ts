import connectMongoDB from "../connnectMongoDB";
import { Variant } from "../models/variant";
import { Product } from "../models/product";
import { Category } from "../models/category";
import mongoose from "mongoose";

export async function seedVariant() {
  try {
    await connectMongoDB({ seed: true });
    await Variant.deleteMany({});
    console.log("🗑️ All existing variants deleted.");

    // Fetch first category and product
    const firstCategory = await Category.findOne();
    if (!firstCategory) {
      throw new Error("No categories found. Please seed categories first.");
    }

    // Example variant data
    const variantData = [
      {
        color: "Black",
        colorHex: "#000000",
        images: ["/client/product/f1.jpg", "/client/product/f1.jpg"],
        options: [
          { size: "S", price: 699, quantity: 20, sku: "DS-BLK-S" },
          { size: "M", price: 749, quantity: 25, sku: "DS-BLK-M" },
          { size: "L", price: 799, quantity: 15, sku: "DS-BLK-L" },
        ],
      },
      {
        color: "White",
        colorHex: "#ffffff",
        images: ["/client/product/f1.jpg"],
        options: [
          { size: "S", price: 699, quantity: 18, sku: "DS-WHT-S" },
          { size: "M", price: 749, quantity: 22, sku: "DS-WHT-M" },
          { size: "L", price: 799, quantity: 10, sku: "DS-WHT-L" },
        ],
      },
    ];

    for (const variant of variantData) {
      const newVariant = new Variant(variant);
      await newVariant.save();

      console.log(`✅ Seeded variant: ${variant.color}`);
    }

    console.log("🎉 Variant seeding completed.");
  } catch (err) {
    console.error("❌ Error during variant seeding:", err);
    throw err;
  }
}
