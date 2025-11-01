// import connectMongoDB from "../connnectMongoDB";
// import { Product } from "../models/product";
// import { Category } from "../models/category";
// import mongoose from "mongoose";

// export async function seedProduct() {
//   try {
//     await connectMongoDB({ seed: true });
//     await Product.deleteMany({});
//     console.log("🗑️ All existing products deleted.");

//     // Fetch the first category
//     const firstCategory = await Category.findOne();
//     if (!firstCategory) {
//       throw new Error("No categories found. Please seed categories first.");
//     }
//     const firstCategoryId = firstCategory._id;

//     const productData = {
//       name: "Sample T-Shirt",
//       description: "A comfortable and stylish t-shirt for everyday wear.",
//       category: firstCategoryId, // Use the first category's ObjectId
//       cost_price: 10,
//       selling_price: 20,
//       images: [
//         "https://example.com/sample-tshirt-front.jpg",
//         "https://example.com/sample-tshirt-back.jpg",
//       ],
//       variants: [
//         {
//           size: "M",
//           color: "Black",
//           quantity: 50,
//           sku: "TSHIRT-BLK-M",
//         },
//         {
//           size: "L",
//           color: "White",
//           quantity: 30,
//           sku: "TSHIRT-WHT-L",
//         },
//       ],
//       initialStock: 80,
//       availableQuantity: 80,
//       soldQuantity: 0,
//     };

//     const newProduct = new Product(productData);
//     await newProduct.save();
//     console.log(`✅ Seeded product: ${productData.name}`);
//     console.log("🎉 Product seeding completed.");
//   } catch (err) {
//     console.error("❌ Error during product seeding:", err);
//     throw err;
//   }
// }

import connectMongoDB from "../connnectMongoDB";
import { Product } from "../models/product";
import { Category } from "../models/category";
import mongoose from "mongoose";

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

    // Example product data matching the updated model
    const productData = {
      name: "Down Shoulder T-Shirt",
      description:
        "Soft cotton down-shoulder t-shirt, perfect for casual wear.",
      category: firstCategoryId,
      costPrice: 400,
      basePrice: 650,
      mainImage: ["/client/product/f1.jpg"],
      tags: ["t-shirt", "casual", "cotton"],
      variants: [
        {
          color: "Black",
          colorHex: "#000000",
          
          images: [
            "/client/product/f1.jpg",
            "/client/product/f1.jpg",
          ],
          options: [
            { size: "S", price: 699, quantity: 20, sku: "DS-BLK-S" },
            { size: "M", price: 749, quantity: 25, sku: "DS-BLK-M" },
            { size: "L", price: 799, quantity: 15, sku: "DS-BLK-L" },
          ],
        },
        {
          color: "White",
          colorHex: "#ffffff",
          images: [
                      "/client/product/f1.jpg",

          ],
          options: [
            { size: "S", price: 699, quantity: 18, sku: "DS-WHT-S" },
            { size: "M", price: 749, quantity: 22, sku: "DS-WHT-M" },
            { size: "L", price: 799, quantity: 10, sku: "DS-WHT-L" },
          ],
        },
      ],
      availableQuantity: 110,
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
