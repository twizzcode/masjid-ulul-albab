import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  sanitizeString,
  feedbackCreateSchema,
} from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const body = await request.json();
    const { content: rawContent, isAnonymous, submitterName: rawSubmitterName } = body;

    // Sanitize inputs to prevent XSS
    const content = sanitizeString(rawContent);
    const submitterName = rawSubmitterName ? sanitizeString(rawSubmitterName) : null;

    // Validate using Zod schema
    const validation = feedbackCreateSchema.safeParse({
      content,
      isAnonymous: Boolean(isAnonymous),
      submitterName,
    });

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => err.message).join(", ");
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    // Additional validation: if not anonymous, name is required
    if (!isAnonymous && (!submitterName || submitterName.trim().length === 0)) {
      return NextResponse.json(
        { error: "Nama harus diisi jika tidak memilih anonymous" },
        { status: 400 }
      );
    }

    // Buat feedback
    const feedback = await prisma.feedback.create({
      data: {
        content: content.trim(),
        isAnonymous: Boolean(isAnonymous),
        submitterName: isAnonymous ? null : submitterName?.trim() || null,
        userId: session?.user?.id || null,
      },
    });

    return NextResponse.json(
      {
        message: "Feedback berhasil dikirim",
        feedback: {
          id: feedback.id,
          createdAt: feedback.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit feedback error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim feedback. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
