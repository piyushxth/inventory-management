// import { writeFile, mkdir } from "fs/promises";
// import { NextRequest, NextResponse } from "next/server";
// import { join, parse } from "path";

// export async function POST(request: NextRequest) {
//   try {
//     const data = await request.formData();

//     // Get entity type (e.g., "destination", "package", "country")
//     const entityType = data.get("entityType") as string;
//     if (!entityType) {
//       return NextResponse.json(
//         { success: false, message: "Entity type is required." },
//         { status: 400 }
//       );
//     }

//     const baseUploadDir = join(process.cwd(), "public", "uploads");
//     const savedFiles: { [key: string]: string | string[] } = {};

//     for (const [key, value] of data.entries()) {
//       if (value instanceof File) {
//         const file = value;
//         const bytes = await file.arrayBuffer();
//         const buffer = Buffer.from(bytes);
//         const originalName = file.name;
//         const { name, ext } = parse(originalName);

//         // Determine subdirectory based on entity and field
//         const subDir =
//           entityType === "destination"
//             ? key // Use `coverPhoto` or `gallery` directly for destination
//             : "image"; // For package and country, always save in the "image" subdirectory

//         const uploadDir = join(baseUploadDir, entityType, subDir);

//         // Ensure directory exists
//         await mkdir(uploadDir, { recursive: true });

//         // Generate unique file name
//         const uniqueName = `${name}-${Date.now()}${ext}`;
//         const filePath = join(uploadDir, uniqueName);

//         // Save file
//         await writeFile(filePath, buffer);

//         // Generate file URL
//         const fileUrl = `/uploads/${entityType}/${subDir}/${uniqueName}`;

//         // Save to the appropriate field
//         if (entityType === "destination") {
//           if (key === "coverPhoto") {
//             savedFiles.coverPhoto = fileUrl;
//           } else if (key === "gallery") {
//             if (!savedFiles.gallery) savedFiles.gallery = [];
//             (savedFiles.gallery as string[]).push(fileUrl);
//           }
//         } else {
//           savedFiles.image = fileUrl; // For package and country
//         }

//         // Save to the appropriate field
//         if (entityType === "country") {
//           if (key === "image") {
//             savedFiles.image = fileUrl;
//           }
//         } else {
//           savedFiles.image = fileUrl; // For package and country
//         }

//         // Save to the appropriate field
//         if (entityType === "packages") {
//           if (key === "image") {
//             savedFiles.image = fileUrl;
//           }
//         } else {
//           savedFiles.image = fileUrl; // For package and country
//         }
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Files uploaded successfully",
//       files: savedFiles,
//     });
//   } catch (error) {
//     console.error("File upload error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "An error occurred during file upload.",
//       },
//       { status: 500 }
//     );
//   }
// }

import { writeFile, mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join, parse } from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    // Get entity type (e.g., "destination", "packages", "country")
    const entityType = data.get("entityType") as string;
    if (!entityType) {
      return NextResponse.json(
        { success: false, message: "Entity type is required." },
        { status: 400 }
      );
    }

    const baseUploadDir = join(process.cwd(), "public", "uploads");
    const savedFiles: { [key: string]: string | string[] } = {};

    for (const [key, value] of data.entries()) {
      if (value instanceof File) {
        const file = value;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const originalName = file.name;
        const { name, ext } = parse(originalName);
        const uniqueName = `${name}-${Date.now()}${ext}`;

        let subDir = "";

        if (entityType === "country" && key === "image") {
          subDir = "country/image";
        } else if (entityType === "destination" && key === "coverPhoto") {
          subDir = "destination/coverPhoto";
        } else if (entityType === "packages" && key === "coverPhoto") {
          subDir = "packages/coverPhoto";
        } else if (entityType === "packages" && key === "gallery") {
          subDir = "packages/gallery";
        } else if (entityType === "products" && key === "gallery") {
          subDir = "products/gallery";
        } else if (entityType === "brands" && key === "gallery") {
          subDir = "brands/gallery";
        } else {
          return NextResponse.json(
            { success: false, message: "Invalid entity type or key." },
            { status: 400 }
          );
        }

        const uploadDir = join(baseUploadDir, subDir);

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        const filePath = join(uploadDir, uniqueName);

        // Save file
        await writeFile(filePath, buffer);

        // Generate file URL
        const fileUrl = `/uploads/${subDir}/${uniqueName}`;

        if (entityType === "packages" && key === "gallery") {
          if (!savedFiles.gallery) savedFiles.gallery = [];
          (savedFiles.gallery as string[]).push(fileUrl);
        } else if (entityType === "products" && key === "gallery") {
          if (!savedFiles.gallery) savedFiles.gallery = [];
          (savedFiles.gallery as string[]).push(fileUrl);
        } else if (entityType === "brands" && key === "gallery") {
          if (!savedFiles.gallery) savedFiles.gallery = [];
          (savedFiles.gallery as string[]).push(fileUrl);
        } else {
          savedFiles[key] = fileUrl;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Files uploaded successfully",
      files: savedFiles,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during file upload." },
      { status: 500 }
    );
  }
}
