import connectMongoDB from "../connnectMongoDB";
import { User } from "../models/users";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export async function seedUser() {
  try {
    await connectMongoDB({ seed: true });
    await User.deleteMany({});
    console.log("🗑️ All existing users deleted.");

    // Fetch the admin role from the Roles collection
    const adminRole = await mongoose.model("Roles").findOne({ name: "admin" });
    if (!adminRole) {
      throw new Error("Admin role not found. Please seed roles first.");
    }

    const hashedPassword = await bcrypt.hash("password123", 10);
    const userData = {
      name: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
      profilePicture: null,
      roles: adminRole._id, // Use the admin role's ObjectId
      address: "123 Main St, Los Angeles, CA",
    };

    const newUser = new User(userData);
    await newUser.save();
    console.log(`✅ Seeded user: ${userData.name}`);
    console.log("🎉 User seeding completed.");
  } catch (err) {
    console.error("❌ Error during user seeding:", err);
    throw err;
  }
}
