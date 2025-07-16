import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../libs/connnectMongoDB";
import Roles from "../../../libs/models/roles";
import { User } from "../../../libs/models/users";

// POST: Create a new role
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const roleData = await req.json();

    // Log the received data for debugging
    console.log("Received role data:", roleData);

    // Connect to the MongoDB database
    await connectMongoDB();
    // Check if a role with the same name already exists
    const existingRole = await Roles.findOne({ name: roleData.name });
    if (existingRole) {
      return NextResponse.json(
        { success: false, message: "Role already exists" },
        { status: 400 }
      );
    }

    // Create a new role using the received data
    const newRole = new Roles(roleData); // Correctly assign the roleData

    // Save the new role to the database
    const savedRole = await newRole.save();

    // Return success response with the saved role
    return NextResponse.json(
      { success: true, message: "Role created successfully", data: savedRole },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating role:", error.message);
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

// GET: Fetch all roles with user counts and user lists
export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();
    const roles = await Roles.find();
    // For each role, count and list users
    const rolesWithUsers = await Promise.all(
      roles.map(async (role) => {
        const users = await User.find({ roles: role._id }).select(
          "_id name email profilePicture"
        );
        return {
          _id: role._id,
          name: role.name,
          userCount: users.length,
          users,
        };
      })
    );
    return NextResponse.json(
      { success: true, data: rolesWithUsers },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching roles with users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch roles with users" },
      { status: 500 }
    );
  }
}
