// import { NextResponse, NextRequest } from "next/server";
// import { pinata } from "@/utils/pinata-config";

// export const config = {
//   api: { bodyParser: false },
// };

// export async function POST(req: NextRequest) {
//   try {
//     const data = await req.formData();
//     const file: File | null = data.get("file") as unknown as File;
//     const uploadDta = await pinata.upload.file(file);
//     const url = await pinata.gateways.get("cid").optimizeImage({
//       width: 650,
//       format: "webp",
//     });
//     console.log(url);
//     return NextResponse.json(url, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(error, { status: 500 });
//   }
// }

import { writeFile, mkdir, access } from "fs/promises";
import { constants } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { join, parse } from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const savedFiles = [];

    for (const [key, value] of data.entries()) {
      if (key === "files" && value instanceof File) {
        const bytes = await value.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const originalName = value.name;
        const { name, ext } = parse(originalName);

        // Generate unique file name
        let uniqueName = `${name}-${Date.now()}${ext}`;
        let filePath = join(uploadDir, uniqueName);

        // Check if the file exists (to avoid rare timestamp collision)
        let counter = 1;
        while (await fileExists(filePath)) {
          uniqueName = `${name}-${Date.now()}-${counter++}${ext}`;
          filePath = join(uploadDir, uniqueName);
        }

        // Write the file
        await writeFile(filePath, buffer);
        savedFiles.push(`/uploads/${uniqueName}`);
      }
    }

    console.log("Files uploaded:", savedFiles);

    return NextResponse.json({
      success: true,
      message: "Files uploaded successfully",
      files: savedFiles,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({
      success: false,
      message: "An error occurred during file upload",
    });
  }
}

// Helper function to check if a file exists
async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
