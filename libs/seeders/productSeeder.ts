import connectMongoDB from "../connnectMongoDB";
import { Product } from "../models/product";
import { Category } from "../models/category";
import mongoose from "mongoose";
import { Variant } from "../models/variant";

export async function seedProduct() {
  try {
    await connectMongoDB({ seed: true });
    await Product.deleteMany({});
    console.log("🗑️ All existing products deleted.");

    // Fetch first category
    const firstCategory = await Category.findOne();
    if (!firstCategory) {
      throw new Error("No categories found. Please seed categories first.");
    }
    const firstCategoryId = firstCategory._id;

    // Example product data matching the updated model (without embedded variants)
    const productData = {
      name: "Down Shoulder T-Shirt",
      description:
        "Soft cotton down-shoulder t-shirt, perfect for casual wear.",
      category: firstCategoryId,
      costPrice: 400,
      basePrice: 650,
      mainImage: ["/client/product/f1.jpg"],
      tags: ["t-shirt", "casual", "cotton"],
      // Variants will be added separately via variant seeder
      variants: [
        {
          color: "Black",
          colorHex: "#000000",
          images: ["/client/product/f2.jpg"],
          options: [{ size: "L", price: 233, quantity: 123, sku: "asdf" }],
        },
        {
          color: "White",
          colorHex: "#ffffff",
          images: ["/client/product/f1.jpg"],
          options: [
            { size: "L", price: 233, quantity: 123, sku: "asdf" },
            { size: "M", price: 233, quantity: 123, sku: "asdf" },
          ],
        },
      ], // Empty initially, will be populated by variant seeder
    };

    // ✅ STEP 1: extract variants
    const { variants, ...restProduct } = productData;

    // ✅ STEP 2: create variants
    const createdVariants =
      variants && variants.length > 0 ? await Variant.insertMany(variants) : [];

    // ✅ Create final product object properly
    const finalProductData = {
      ...restProduct,
      variants: createdVariants.map((v) => v._id),
    };

    const newProduct = new Product(finalProductData);
    await newProduct.save();

    console.log(`✅ Seeded product: ${finalProductData.name}`);
    console.log("🎉 Product seeding completed.");
  } catch (err) {
    console.error("❌ Error during product seeding:", err);
    throw err;
  }
}
