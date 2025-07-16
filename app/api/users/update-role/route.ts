import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/libs/connnectMongoDB";
import { registerModels } from "@/libs/registerModels";
import { User } from "@/libs/models/users";
import Roles from "@/libs/models/roles";

export async function POST(req: NextRequest) {
  try {
    const { email, newRole } = await req.json();

    if (!email || !newRole) {
      return NextResponse.json(
        { success: false, message: "Email and newRole are required" },
        { status: 400 }
      );
    }

    await connectMongoDB();
    registerModels();

    // Find the role
    const role = await Roles.findOne({ name: newRole });
    if (!role) {
      return NextResponse.json(
        { success: false, message: `Role '${newRole}' not found` },
        { status: 404 }
      );
    }

    // Update the user's role
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { roles: role._id },
      { new: true }
    ).populate("roles");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `User role updated to ${newRole}`,
        data: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.roles?.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
