import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const body = await request.json();
    const { content, isAnonymous, submitterName } = body;

    // Validasi content
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Konten feedback tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (content.trim().length < 10) {
      return NextResponse.json(
        { error: "Konten feedback minimal 10 karakter" },
        { status: 400 }
      );
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { error: "Konten feedback maksimal 1000 karakter" },
        { status: 400 }
      );
    }

    // Validasi nama jika tidak anonymous
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
