import connectMongoDB from "../connnectMongoDB";
import { Product } from "../models/product";
import { Category } from "../models/category";
import mongoose from "mongoose";

export async function seedProduct() {
  try {
    await connectMongoDB({ seed: true });
    await Product.deleteMany({});
    console.log("🗑️ All existing products deleted.");

    // Fetch the first category
    const firstCategory = await Category.findOne();
    if (!firstCategory) {
      throw new Error("No categories found. Please seed categories first.");
    }
    const firstCategoryId = firstCategory._id;

    const productData = {
      name: "Sample T-Shirt",
      description: "A comfortable and stylish t-shirt for everyday wear.",
      category: firstCategoryId, // Use the first category's ObjectId
      cost_price: 10,
      selling_price: 20,
      images: [
        "https://example.com/sample-tshirt-front.jpg",
        "https://example.com/sample-tshirt-back.jpg",
      ],
      variants: [
        {
          size: "M",
          color: "Black",
          quantity: 50,
          sku: "TSHIRT-BLK-M",
        },
        {
          size: "L",
          color: "White",
          quantity: 30,
          sku: "TSHIRT-WHT-L",
        },
      ],
      initialStock: 80,
      availableQuantity: 80,
      soldQuantity: 0,
    };

    const newProduct = new Product(productData);
    await newProduct.save();
    console.log(`✅ Seeded product: ${productData.name}`);
    console.log("🎉 Product seeding completed.");
  } catch (err) {
    console.error("❌ Error during product seeding:", err);
    throw err;
  }
}
