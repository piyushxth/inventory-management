import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "../../../libs/connnectMongoDB";
import Roles from "../../../libs/models/roles";

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

// GET: Fetch all roles
export async function GET() {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Fetch all roles from the database
    const roles = await Roles.find();
    return NextResponse.json({ success: true, data: roles }, { status: 200 });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}
