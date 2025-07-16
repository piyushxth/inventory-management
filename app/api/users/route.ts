import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../libs/connnectMongoDB";
import { User } from "../../../libs/models/users";
import bcrypt from "bcryptjs"; // Import bcryptjs
import Roles from "../../../libs/models/roles";

// POST: Create a new user
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const userData = await req.json();

    // Log the received data for debugging
    console.log("Received user data:", userData);

    // Connect to the MongoDB database
    await connectMongoDB();

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(userData.password, 10); // Hash with salt rounds of 10

    // Assign 'user' role by default if not specified
    let roleId = userData.roles;
    if (!roleId) {
      const userRole = await Roles.findOne({ name: "user" });
      if (!userRole) {
        return NextResponse.json(
          {
            success: false,
            message: "Default 'user' role not found. Please seed roles first.",
          },
          { status: 500 }
        );
      }
      roleId = userRole._id;
    }

    // Create a new user with the hashed password and role
    const newUser = new User({
      ...userData,
      password: hashedPassword, // Set the hashed password
      roles: roleId,
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    // Return the saved user data as a response
    return NextResponse.json(
      { success: true, message: "User created successfully", data: savedUser },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating user:", error.message);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// GET: Fetch all users
export async function GET() {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Fetch all users from the database with populated roles
    const users = await User.find().populate("roles");

    // Return the fetched users as a response
    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
