import connectMongoDB from "../connnectMongoDB";
import { User } from "../models/users";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export async function seedUser() {
  try {
    await connectMongoDB({ seed: true });
    await User.deleteMany({});
    console.log("🗑️ All existing users deleted.");

    const hashedPassword = await bcrypt.hash("password123", 10);
    const userData = {
      name: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
      profilePicture: null,
      roles: new mongoose.Types.ObjectId(), // Replace with a real role ObjectId in real seeding
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
