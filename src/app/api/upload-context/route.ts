import { NextRequest, NextResponse } from "next/server";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { auth } from "@/features/auth/controller/auth";
import { headers } from "next/headers";
import { hasActiveSubscription } from "@/features/subscription/utils/subscription-guard";

const apiKey = process.env.GEMINI_API_KEY || "";
const fileManager = new GoogleAIFileManager(apiKey);

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verificar subscription
    const hasSubscription = await hasActiveSubscription();
    if (!hasSubscription) {
      return NextResponse.json({ error: "Subscription required" }, { status: 402 });
    }

    // 3. Validar arquivo
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const tempPath = path.join(tmpdir(), `upload-${Date.now()}-${file.name}`);
    await writeFile(tempPath, buffer);

    try {
      // Upload to Gemini
      const uploadResult = await fileManager.uploadFile(tempPath, {
        mimeType: file.type,
        displayName: file.name,
      });

      // Clean up temp file
      await unlink(tempPath);

      return NextResponse.json({
        fileUri: uploadResult.file.uri,
        fileName: file.name,
        mimeType: file.type,
      });
    } catch (uploadError) {
      // Clean up temp file on error
      await unlink(tempPath);
      throw uploadError;
    }
  } catch (error) {
    console.error("Error uploading file:");
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
