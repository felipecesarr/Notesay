import { useQuery } from "@tanstack/react-query";
import { generateWordAnalysis } from "../../controller";

export const useWordAnalysis = (text: string | null) => {
  return useQuery({
    queryKey: ["word-analysis", text],
    queryFn: () => {
      if (!text) throw new Error("No text provided");
      return generateWordAnalysis(text);
    },
    enabled: !!text && text.length > 0,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};
