import { extractText } from "unpdf";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Extracts and formats text from a PDF file.
 * Uses unpdf for fast extraction + Gemini for formatting.
 */
export async function extractTextFromPdf(file: File): Promise<{
  text: string;
  summary: string;
  title: string;
}> {
  // Step 1: Extract raw text with unpdf (fast, ~2 seconds)
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const { text: pages } = await extractText(buffer);
  
  const rawText = Array.isArray(pages) ? pages.join("\n\n") : (pages || "");
  
  if (!rawText || rawText.length < 100) {
    throw new Error("Could not extract text from this PDF. It may be scanned or image-based.");
  }

  // Step 2: Format with Gemini
  // Gemini 2.5-flash-lite can handle ~1M tokens. We send the full text.
  const textToFormat = rawText;
  
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  
  const prompt = `You are a text formatter. Convert this raw PDF text into clean, readable Markdown.

RULES:
1. Use ## for section/chapter headings (detect from ALL CAPS lines or topic changes)
2. Use - for bullet lists where appropriate
3. Fix broken words (e.g., "invest-\\nment" → "investment")
4. Merge fragmented lines into proper paragraphs
5. Remove page numbers and headers/footers
6. Use **bold** for important terms
7. INSERT <<<PAGE_BREAK>>> every ~800 words for pagination
8. TABLES: When you see data that looks like a table, format as Markdown table
9. NEVER use code blocks (\`\`\`) or backticks (\`). This is study text, not code.

OUTPUT FORMAT:
===TITLE===
(A descriptive title)
===SUMMARY===
(2-3 sentence summary)
===TEXT===
(The formatted Markdown content)

RAW TEXT:
${textToFormat}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse structured output
    const titleMatch = responseText.match(/===TITLE===\s*([\s\S]*?)===SUMMARY===/);
    const summaryMatch = responseText.match(/===SUMMARY===\s*([\s\S]*?)===TEXT===/);
    const textMatch = responseText.match(/===TEXT===\s*([\s\S]*)/);

    const title = titleMatch ? titleMatch[1].trim() : file.name.replace('.pdf', '').replace(/_/g, ' ');
    const summary = summaryMatch ? summaryMatch[1].trim() : 'PDF content extracted.';
    const formattedText = textMatch ? textMatch[1].trim() : responseText;

    return { title, summary, text: formattedText };
    
  } catch (error) {
    console.error("Gemini formatting error:");
    // Fallback: return raw text with basic cleanup
    const cleanedText = rawText
      .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return {
      title: file.name.replace('.pdf', '').replace(/_/g, ' '),
      summary: 'PDF content extracted.',
      text: cleanedText
    };
  }
}
