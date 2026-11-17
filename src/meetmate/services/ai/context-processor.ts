export type ContextType = "pdf" | "url" | "video";

export interface ContextSource {
  type: ContextType;
  content: string; // URL or file path
  fileUri?: string; // For uploaded files
  extractedText?: string; // Cached extracted content
}

/**
 * Upload a PDF file and get its file URI for processing
 * This is handled by the /api/upload-context endpoint
 */
export async function uploadPDFFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload-context", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  const { fileUri } = await response.json();
  return fileUri;
}
