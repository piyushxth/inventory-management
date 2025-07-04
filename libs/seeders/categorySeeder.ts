import connectMongoDB from "../connnectMongoDB";
import { Category } from "../models/category";

export async function seedCategory() {
  try {
    await connectMongoDB({ seed: true });
    await Category.deleteMany({});
    console.log("🗑️ All existing categories deleted.");

    const categoryData = {
      name: "Sneakers",
      slug: "sneakers",
      description: "Sneakers for men and women.",
    };

    const newCategory = new Category(categoryData);
    await newCategory.save();
    console.log(`✅ Seeded: ${categoryData.name}`);
    console.log("🎉 Category seeding completed.");
  } catch (err) {
    console.error("❌ Error during category seeding:", err);
    throw err;
  }
}
