import { existsSync } from "fs";
import { unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

// DELETE: Delete a destination by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const imagePath = (await params).id;
    const { entityType, key } = await req.json();
    console.log("Image path from upload-demo", imagePath);

    console.log(
      `Deleting file with ID: ${imagePath}, Entity: ${entityType}, Key: ${key}`
    );

    const uploadDir = join(process.cwd(), "public", "uploads", entityType, key);
    const filePath = join(uploadDir, imagePath); // Construct the full file path
    console.log("File path:", filePath);

    // Check if the file exists
    if (existsSync(filePath)) {
      // File exists, proceed with deletion
      await unlink(filePath);
      console.log(`File deleted successfully: ${filePath}`);
      return NextResponse.json({
        success: true,
        message: "File deleted successfully",
      });
    } else {
      // File doesn't exist, do nothing
      console.log(`File not found: ${filePath}`);
      return NextResponse.json({
        success: true,
        message: "File not found, nothing to delete",
      });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete file" },
      { status: 500 }
    );
  }
}

// export async function HEAD(
//   req: NextRequest,
//   { params }: { params: { entityType: string; key: string; imagePath: string } }
// ) {
//   try {
//     const { entityType, key, imagePath } = params;

//     console.log("Received params:", { entityType, key, imagePath });

//     // Construct the full file path inside /public/uploads/
//     const filePath = join(
//       process.cwd(),
//       "public",
//       "uploads",
//       entityType,
//       key,
//       imagePath
//     );

//     console.log("Checking file at:", filePath);

//     await stat(filePath); // Check if file exists

//     return new NextResponse(null, { status: 200 }); // File exists
//   } catch (error) {
//     console.log("Error checking file:", error);
//     return new NextResponse(null, { status: 404 }); // File not found
//   }
// }
