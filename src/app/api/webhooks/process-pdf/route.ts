import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { prisma } from "@/meetmate/services/db/prisma";
import { extractTextFromPdf } from "@/features/pdf-study/procedure";
import {
  getOrCreateDefaultStore,
  uploadTextToStore,
} from "@/meetmate/services/ai/gemini-file-search";

// This is the maximum time this function can run (Vercel Pro: 300s, Enterprise: 900s)
export const maxDuration = 300;

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { studyId, fileBase64, fileName } = body;

    if (!studyId || !fileBase64) {
      return NextResponse.json(
        { error: "Missing studyId or fileBase64" },
        { status: 400 }
      );
    }

    // Update status to PROCESSING
    await prisma.pDFStudy.update({
      where: { id: studyId },
      data: { status: "PROCESSING" },
    });

    // Convert base64 back to File
    const buffer = Buffer.from(fileBase64, "base64");
    const file = new File([buffer], fileName || "document.pdf", {
      type: "application/pdf",
    });

    // Extract content using unpdf + Gemini formatting
    const extractionResult = await extractTextFromPdf(file);

    // Update study with extracted content
    await prisma.pDFStudy.update({
      where: { id: studyId },
      data: {
        status: "COMPLETED",
        title: extractionResult.title || fileName,
        extractedContent: extractionResult.text,
        summary: extractionResult.summary,
      },
    });

    // Upload to File Search store (for RAG/Quiz) - optional, don't fail if this errors
    try {
      const storeResult = await getOrCreateDefaultStore();
      if (storeResult.success && storeResult.store) {
        await uploadTextToStore(
          storeResult.store.name,
          `${extractionResult.title} (PDF: ${fileName})`,
          extractionResult.text
        );
      }
    } catch (fileSearchError) {
      console.error("Error uploading to File Search store:");
    }

    return NextResponse.json({ success: true, studyId });

  } catch (error) {
    console.error("PDF processing webhook error:");

    // Try to update the study with error status
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (body.studyId) {
        await prisma.pDFStudy.update({
          where: { id: body.studyId },
          data: {
            status: "FAILED",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    } catch (updateError) {
      console.error("Failed to update study status:");
    }

    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}

// Wrap with QStash signature verification
export const POST = verifySignatureAppRouter(handler);

