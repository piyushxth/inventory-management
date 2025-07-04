import connectMongoDB from "../connnectMongoDB";
import { Brand } from "../models/brand";

export async function seedBrand() {
  try {
    await connectMongoDB({ seed: true });
    await Brand.deleteMany({});
    console.log("🗑️ All existing brands deleted.");

    const brandData = {
      name: "Nike",
      logo: "https://example.com/nike-logo.png",
      description:
        "Nike is a global leader in athletic footwear, apparel, and equipment.",
    };

    const newBrand = new Brand(brandData);
    await newBrand.save();
    console.log(`✅ Seeded: ${brandData.name}`);
    console.log("🎉 Brand seeding completed.");
  } catch (err) {
    console.error("❌ Error during brand seeding:", err);
    throw err;
  }
}
