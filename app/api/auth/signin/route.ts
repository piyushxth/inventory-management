import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/libs/authOptions";
import NextAuth from "next-auth";
import connectMongoDB from "@/libs/connnectMongoDB";
import { registerModels } from "@/libs/registerModels";
import { User } from "@/libs/models/users";
import Roles from "@/libs/models/roles";
import bcrypt from "bcryptjs";

const handler = NextAuth(authOptions);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Connect to database and register models
    await connectMongoDB();
    registerModels();

    // Ensure models are registered
    if (!User || !Roles) {
      console.error("Models not properly registered");
      return NextResponse.json(
        { success: false, message: "Database connection error" },
        { status: 500 }
      );
    }

    // Find user with populated roles
    const user = await User.findOne({ email }).populate("roles");
    console.log("Found user:", user);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is admin (for admin login)
    const userRole = user.roles?.name || "user";
    console.log("User role:", userRole);
    console.log("User roles object:", user.roles);

    if (userRole !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: `Access denied. Admin privileges required. Current role: ${userRole}`,
        },
        { status: 403 }
      );
    }

    // Return success with user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: userRole,
      profilePicture: user.profilePicture,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: userData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export { handler as GET };
