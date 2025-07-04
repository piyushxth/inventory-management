import connectMongoDB from "../connnectMongoDB";
import { Address } from "../models/address";
import { User } from "../models/users";
import mongoose from "mongoose";

export async function seedAddress() {
  try {
    await connectMongoDB({ seed: true });
    await Address.deleteMany({});
    console.log("🗑️ All existing addresses deleted.");

    // Fetch the first user
    const firstUser = await User.findOne();
    if (!firstUser) throw new Error("No users found. Please seed users first.");
    const firstUserId = firstUser._id;

    const addressData = {
      user: firstUserId, // Use the first user's ObjectId
      fullName: "John Doe",
      phone: "+1234567890",
      province: "California",
      city: "Los Angeles",
      addressLine: "123 Main St",
      landmark: "Near Central Park",
      isDefault: true,
      type: "shipping",
    };

    const newAddress = new Address(addressData);
    await newAddress.save();
    console.log(`✅ Seeded address for: ${addressData.fullName}`);
    console.log("🎉 Address seeding completed.");
  } catch (err) {
    console.error("❌ Error during address seeding:", err);
    throw err;
  }
}
