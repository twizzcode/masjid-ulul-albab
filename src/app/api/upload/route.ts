// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { requireAuth } from "@/lib/auth-helpers";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await requireAuth();

    // 2. Get file from form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 3. Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // 4. Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 2MB" },
        { status: 400 }
      );
    }

    // 5. Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const uniqueId = nanoid(10);
    const timestamp = Date.now();
    const fileName = `${session.user.id}/${timestamp}-${uniqueId}.${fileExtension}`;

    // 6. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 7. Upload to R2
    const uploadCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedBy: session.user.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    await r2Client.send(uploadCommand);

    // 8. Generate public URL
    const fileUrl = `${R2_PUBLIC_URL}/${fileName}`;

    // 9. Return success response
    return NextResponse.json({
      success: true,
      file: {
        url: fileUrl,
        fileName: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}