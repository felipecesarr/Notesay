import { serve } from "@upstash/workflow/nextjs";
import { prisma } from "@/meetmate/services/db/prisma";
import { extractText } from "unpdf";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  trackTokenUsage,
  extractTokenMetadata
} from "@/meetmate/services/token-tracking";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type WorkflowInput = {
  studyId: string;
  fileBase64: string;
  fileName: string;
};

export const { POST } = serve<WorkflowInput>(async (context) => {
  const { studyId, fileBase64, fileName } = context.requestPayload;
  void 0;

  // Step 0: Get userId from PDFStudy for token tracking
  const userId = await context.run("get-user-id", async () => {
    const study = await prisma.pDFStudy.findUnique({
      where: { id: studyId },
      select: { userId: true }
    });
    return study?.userId || null;
  });

  // Step 1: Update status to PROCESSING
  await context.run("update-status-processing", async () => {
    await prisma.pDFStudy.update({
      where: { id: studyId },
      data: { status: "PROCESSING" },
    });
    return { success: true };
  });

  // Step 2: Extract text from PDF
  const rawText = await context.run("extract-text", async () => {
    // Fetch base64 from DB (it was stored in extractedContent via chunked upload)
    const study = await prisma.pDFStudy.findUnique({
      where: { id: studyId },
      select: { extractedContent: true }
    });

    if (!study || !study.extractedContent) {
      throw new Error("Study content not found in DB");
    }

    const buffer = Buffer.from(study.extractedContent, "base64");
    const uint8Array = new Uint8Array(buffer);
    const { text: pages } = await extractText(uint8Array);

    const text = Array.isArray(pages) ? pages.join("\n\n") : (pages || "");

    if (!text || text.length < 100) {
      throw new Error("Could not extract text from PDF");
    }

    return text;
  });

  // Step 3: Split text into chunks for processing (each chunk ~20k chars)
  const chunks = await context.run("split-chunks", async () => {
    const chunkSize = 20000;
    const result: string[] = [];

    for (let i = 0; i < rawText.length; i += chunkSize) {
      result.push(rawText.slice(i, i + chunkSize));
    }

    return result;
  });

  // Step 4: Format each chunk with Gemini (separate step for each to stay under timeout)
  const formattedChunks: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const formatted = await context.run(`format-chunk-${i}`, async () => {
      // User explicitly insisted on gemini-2.5-flash-lite
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

      const isFirstChunk = i === 0;
      const prompt = isFirstChunk
        ? `You are a text formatter. Convert this raw PDF text into clean, readable Markdown.

RULES:
1. Use ## for section/chapter headings
2. Use - for bullet lists
3. Fix broken words (e.g., "invest-\\nment" → "investment")
4. Merge fragmented lines into paragraphs
5. Remove page numbers and headers/footers
6. Use **bold** for important terms
7. INSERT <<<PAGE_BREAK>>> every ~800 words

OUTPUT FORMAT:
===TITLE===
(A descriptive title)
===SUMMARY===
(2-3 sentence summary)
===TEXT===
(The formatted Markdown)

TEXT TO FORMAT:
${chunks[i]}`
        : `Continue formatting this raw PDF text as clean Markdown. Keep the same style.

RULES:
1. Use ## for headings, - for bullets
2. Fix broken words, merge fragraphs
3. INSERT <<<PAGE_BREAK>>> every ~800 words

TEXT TO FORMAT:
${chunks[i]}`;

      const result = await model.generateContent(prompt);

      // Track token usage for each chunk
      if (userId) {
        const tokens = extractTokenMetadata(result);
        trackTokenUsage({
          userId,
          feature: 'pdf-processing',
          action: `processChunk_${i}`,
          model: 'gemini-2.5-flash-lite',
          ...tokens,
        });
      }

      return result.response.text();
    });

    formattedChunks.push(formatted);
  }

  // Step 5: Combine and save
  await context.run("save-result", async () => {
    // Parse title and summary from first chunk
    const firstChunk = formattedChunks[0] || "";
    const titleMatch = firstChunk.match(/===TITLE===\s*([\s\S]*?)===SUMMARY===/);
    const summaryMatch = firstChunk.match(/===SUMMARY===\s*([\s\S]*?)===TEXT===/);
    const textMatch = firstChunk.match(/===TEXT===\s*([\s\S]*)/);

    const title = titleMatch ? titleMatch[1].trim() : fileName.replace('.pdf', '').replace(/_/g, ' ');
    const summary = summaryMatch ? summaryMatch[1].trim() : 'PDF content extracted.';

    // Get formatted text from first chunk
    const firstText = textMatch ? textMatch[1].trim() : firstChunk;

    // Combine all chunks
    const allFormattedText = [firstText, ...formattedChunks.slice(1)].join("\n\n<<<PAGE_BREAK>>>\n\n");

    await prisma.pDFStudy.update({
      where: { id: studyId },
      data: {
        status: "COMPLETED",
        title,
        summary,
        extractedContent: allFormattedText,
      },
    });

    return { success: true };
  });

  return { success: true, studyId };
}, {
  // Retry configuration
  retries: 3,
});
