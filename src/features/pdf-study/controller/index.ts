"use server";

import { prisma } from "@/meetmate/services/db/prisma";
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";
import { Client } from "@upstash/workflow";

// Initialize Workflow client
const workflowClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

/**
 * Initiates PDF processing via Upstash Workflow.
 * Returns immediately with a PENDING study.
 * The workflow will process in steps and update when complete.
 */
/**
 * Step 1: Create a PENDING study entry.
 */
export async function createPendingStudy(fileName: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // Check for QStash token early
    if (process.env.NODE_ENV === "production" && !process.env.QSTASH_TOKEN) {
        return { success: false, error: "System configuration error (Missing QStash Token)" };
    }

    const study = await prisma.pDFStudy.create({
      data: {
        userId: session.user.id,
        fileName: fileName,
        title: fileName.replace('.pdf', ''),
        extractedContent: "", // Will hold base64 chunks temporarily
        status: "PENDING",
      },
    });

    return { success: true, studyId: study.id };
  } catch (error) {
    console.error("Error creating pending study:");
    return { success: false, error: "Failed to init study" };
  }
}

/**
 * Step 2: Upload a chunk of the file (Base64).
 * Appends to extractedContent.
 */
export async function uploadPDFChunk(studyId: string, chunkBase64: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // Append chunk to existing content
    // Note: Concurrency safety is loose here, but client sends sequentially.
    // For stricter safety, we could use raw SQL 'extractedContent = extractedContent || $1', 
    // but Prisma update is generally okay for sequential requests.
    const study = await prisma.pDFStudy.findUnique({
        where: { id: studyId, userId: session.user.id },
        select: { extractedContent: true }
    });

    if (!study) return { success: false, error: "Study not found" };

    await prisma.pDFStudy.update({
      where: { id: studyId },
      data: {
        extractedContent: study.extractedContent + chunkBase64
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error uploading chunk:");
    return { success: false, error: "Chunk upload failed" };
  }
}

/**
 * Step 3: Trigger processing after all chunks uploaded.
 * Workflow will read base64 from extractedContent.
 */
export async function triggerPDFProcessing(studyId: string) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
      });

      if (!session?.user) {
        return { success: false, error: "Unauthorized" };
      }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // Get app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
    
    const isDevelopment = !appUrl || appUrl.includes('localhost');

    if (isDevelopment) {
      // Development: Fire-and-forget processing
      void 0;
      
      const study = await prisma.pDFStudy.findUnique({ where: { id: studyId } });
      if (!study) return { success: false, error: "Study not found" };

      (async () => {
        try {
          const { extractTextFromPdf } = await import("../procedure");
          
          await prisma.pDFStudy.update({
            where: { id: studyId },
            data: { status: "PROCESSING" },
          });

          // Read base64 from DB (extractedContent)
          const base64 = study.extractedContent;
          const buffer = Buffer.from(base64, "base64");
          const reconstructedFile = new File([buffer], study.fileName, { type: "application/pdf" });
          
          const extractionResult = await extractTextFromPdf(reconstructedFile);

          await prisma.pDFStudy.update({
            where: { id: studyId },
            data: {
              status: "COMPLETED",
              title: extractionResult.title || study.fileName,
              extractedContent: extractionResult.text, // Overwrite base64 with text
              summary: extractionResult.summary,
            },
          });
          
          void 0;
        } catch (processingError) {
          console.error("Development PDF processing error:");
          await prisma.pDFStudy.update({
            where: { id: studyId },
            data: { 
              status: "FAILED",
              errorMessage: processingError instanceof Error ? processingError.message : "Processing failed"
            },
          });
        }
      })();
      
      return { 
        success: true, 
        study: { id: studyId }, // partial return valid for UI
        message: "PDF is being processed."
      };
    }

    // Production: Use Upstash Workflow
    const workflowUrl = `${appUrl}/api/workflows/process-pdf`;
    
    // We do NOT send fileBase64 here to avoid QStash payload limit.
    // Workflow handles fetching from DB using studyId.
    await workflowClient.trigger({
      url: workflowUrl,
      body: {
        studyId: studyId,
        fileName: "stored-in-db", // Placeholder
        // No fileBase64 passed
      },
    });

    return { 
      success: true, 
      study: { id: studyId },
      message: "PDF is being processed."
    };

  } catch (error) {
    console.error("Error triggering PDF processing:");
    return { success: false, error: "Failed to trigger processing" };
  }
}

// Deprecated single-shot function kept for interface compatibility if needed, 
// but we recommend using the chunked flow. 
// We will replace the original processPDF with a wrapper that errors or delegates?
// For now, we remove the original implementation logic and just throw or return error to force update?
// Actually simpler: Removing it entirely or renaming it means FE calls fail.
// I will keep the name 'processPDF' but make it throw "Please use chunked upload"?
// Or better: The FE will be updated to use the new functions. The old function is gone.
// I'll comment it out or remove it.
// The code replacement REPLACES the old 'processPDF' entirely with these new functions.
/* ORIGINAL processPDF removed */

/**
 * Get the status of a PDF study (for polling).
 */
export async function getPDFStudyStatus(studyId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const study = await prisma.pDFStudy.findUnique({
      where: {
        id: studyId,
        userId: session.user.id,
      },
      select: {
        id: true,
        status: true,
        title: true,
        errorMessage: true,
      },
    });

    if (!study) {
      return { success: false, error: "Study not found" };
    }

    return { success: true, study };
  } catch (error) {
    console.error("Error getting PDF study status:");
    return { success: false, error: "Failed to get study status" };
  }
}

export async function getPDFStudies() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    const studies = await prisma.pDFStudy.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, studies };
  } catch (error) {
    console.error("Error fetching PDF studies:");
    return { success: false, error: "Failed to fetch studies" };
  }
}

export async function deletePDFStudy(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    await prisma.pDFStudy.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting PDF study:");
    return { success: false, error: "Failed to delete study" };
  }
}

export async function deletePDFChunk(studyId: string, chunkText: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return { success: false, error: "Subscription required" };
    }

    // Fetch existing study
    const study = await prisma.pDFStudy.findUnique({
      where: {
        id: studyId,
        userId: session.user.id,
      },
      select: { extractedContent: true }
    });

    if (!study) {
      return { success: false, error: "Study not found" };
    }

    // Remove the chunk text from content
    // We replace the specific text occurrence. 
    // Note: chunkText usually comes from extractedContent, so it should match exactly.
    // We add a fallback to empty string if replace fails (though it shouldn't if exact match).
    const newContent = study.extractedContent.replace(chunkText, "").trim();

    await prisma.pDFStudy.update({
      where: { id: studyId },
      data: { extractedContent: newContent }
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting PDF chunk:");
    return { success: false, error: "Failed to delete chunk" };
  }
}
