import { useState, useCallback, useMemo } from "react";
import { processPDF, processURL, processVideo } from "@/features/interview/controller/context";
import { ContextSource } from "@/features/skills/presentation/types";

export function useContextProcessing() {
  const [contextData, setContextData] = useState<string | undefined>();
  const [isProcessingContext, setIsProcessingContext] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  const processContexts = useCallback(async (sources: ContextSource[]) => {
    if (!sources || sources.length === 0) {
      setContextData(undefined);
      return;
    }

    setIsProcessingContext(true);
    setProcessingStatus("Processing context sources...");

    try {
      const processedContexts: string[] = [];
      
      for (const source of sources) {
        let extracted = "";
        try {
          switch (source.type) {
            case "pdf":
              extracted = await processPDF(source.content);
              break;
            case "url":
              extracted = await processURL(source.content);
              break;
            case "video":
              extracted = await processVideo(source.content);
              break;
          }
          if (extracted) {
            processedContexts.push(`Source: ${source.title}\n${extracted}`);
          }
        } catch (err) {
          console.error("Notesay operation failed.");
        }
      }

      if (processedContexts.length > 0) {
        const combined = processedContexts.join("\n\n---\n\n");
        setContextData(combined);
        setProcessingStatus("Context loaded!");
        return combined;
      } else {
        setContextData(undefined);
        setProcessingStatus("Failed to process context sources.");
        return undefined;
      }
    } catch (error) {
      console.error("Error processing context:");
      setContextData(undefined);
      setProcessingStatus("Error processing context.");
      return undefined;
    } finally {
      setIsProcessingContext(false);
    }
  }, []);

  return useMemo(() => ({
    contextData,
    isProcessingContext,
    processingStatus,
    processContexts,
    setContextData,
    setProcessingStatus
  }), [contextData, isProcessingContext, processingStatus, processContexts]);
}
