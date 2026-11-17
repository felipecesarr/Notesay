import { useQuery } from "@tanstack/react-query";
import { getUserSkills } from "@/features/skills/controller";
import React, { useMemo } from "react";
import { 
  GraduationCap, Rocket, Briefcase, BookOpen, HeartHandshake, 
  Sparkles, Brain, Zap, Target, MessageCircle, 
  Award, Coffee, Music, Code, Lightbulb, Cake, Star, Users, Globe, Heart
} from "lucide-react";

export const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles, Brain, Zap, Target, MessageCircle, GraduationCap, Rocket, Briefcase,
  BookOpen, HeartHandshake, Award, Coffee, Music, Code, Lightbulb, Cake, Star, Users, Globe, Heart
};

export interface SkillData {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon: React.ElementType; // Lucide icon component
  color: string;
  isDefault: boolean;
  contextSources?: Array<{
    type: "pdf" | "url" | "video";
    content: string;
    title: string;
  }>;
  interviewMode: "ai-asks" | "user-asks";
}

// Fetcher function separating data logic from hook
const fetchSkillsData = async (): Promise<SkillData[]> => {
  const result = await getUserSkills();
  if (result.success && result.skills) {
    // Map database skills to UI format with icon components
    return result.skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      systemPrompt: skill.systemPrompt,
      icon: ICON_MAP[skill.icon] || Sparkles,
      color: skill.color,
      isDefault: skill.isDefault,
      contextSources: skill.contextSources as SkillData["contextSources"],
      interviewMode: skill.interviewMode as "ai-asks" | "user-asks",
    }));
  }
  return [];
};

export function useSkills() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["skills"],
    queryFn: fetchSkillsData,
    // Optimization for 100k Users:
    // 1. Cache for 5 minutes (dedupes requests)
    // 2. Do not refetch on window focus (reduces noise)
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });

  return useMemo(() => ({
    skills: data || [],
    isLoading,
    refreshSkills: refetch
  }), [data, isLoading, refetch]);
}
