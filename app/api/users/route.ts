import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import connectMongoDB from "../../../libs/connnectMongoDB";
import { User } from "../../../libs/models/users";
import Roles from "../../../libs/models/roles";
import { UserSignupSchema } from "@/libs/zod_schema/user";

// POST: Public signup. Roles/profilePicture/address are NEVER taken from the
// request body — the server always assigns the "user" role.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UserSignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid signup data",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;

    await connectMongoDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      roles: userRole._id,
    });

    const savedUser = await newUser.save();

    const safeUser = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
    };

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: safeUser,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Error creating user:", message);
    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 }
    );
  }
}

// GET: Admin-only — fetch all users.
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongoDB();

    const users = await User.find()
      .select("-password")
      .populate("roles");

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
