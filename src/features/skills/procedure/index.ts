import { type Skill } from "@/meetmate/services/ai/gemini";
import {
  GraduationCap,
  Rocket,
  Briefcase,
  BookOpen,
  HeartHandshake,
  Sparkles,
  Brain,
  Zap,
  Target,
  MessageCircle,
  Award,
  Coffee,
  Music,
  Code,
  Lightbulb,
  Cake,
  Star,
  Users,
  Globe,
  Heart,
} from "lucide-react";

// Default skills available in the app
export const DEFAULT_SKILLS: Skill[] = [
  "English Teacher",
  "YC Interview",
  "Job Interview",
  "Journal",
  "Therapist",
];

// Icon mapping for skills
export const SKILL_ICONS: Record<Skill, React.ElementType> = {
  "English Teacher": GraduationCap,
  "YC Interview": Rocket,
  "Job Interview": Briefcase,
  "Journal": BookOpen,
  "Therapist": HeartHandshake,
};

// Color schemes for skills (pastel theme)
export const SKILL_COLORS: Record<Skill, string> = {
  "English Teacher": "bg-amber-50 text-amber-500",
  "YC Interview": "bg-sky-50 text-sky-500",
  "Job Interview": "bg-purple-50 text-purple-500",
  "Journal": "bg-emerald-50 text-emerald-500",
  "Therapist": "bg-violet-50 text-violet-500",
};

// Descriptions for each skill
export const SKILL_DESCRIPTIONS: Record<Skill, string> = {
  "English Teacher": "Improve your language skills.",
  "YC Interview": "Practice for the big pitch.",
  "Job Interview": "Get ready for your dream job.",
  "Journal": "Record your daily thoughts.",
  "Therapist": "A safe space to vent.",
};

// Available pastel colors for new custom skills
export const PASTEL_COLORS = [
  { value: "bg-purple-50 text-purple-500", label: "Purple" },
  { value: "bg-blue-50 text-blue-500", label: "Blue" },
  { value: "bg-sky-50 text-sky-500", label: "Sky" },
  { value: "bg-cyan-50 text-cyan-500", label: "Cyan" },
  { value: "bg-teal-50 text-teal-500", label: "Teal" },
  { value: "bg-emerald-50 text-emerald-500", label: "Emerald" },
  { value: "bg-green-50 text-green-500", label: "Green" },
  { value: "bg-lime-50 text-lime-500", label: "Lime" },
  { value: "bg-amber-50 text-amber-500", label: "Amber" },
  { value: "bg-orange-50 text-orange-500", label: "Orange" },
  { value: "bg-violet-50 text-violet-500", label: "Violet" },
  { value: "bg-indigo-50 text-indigo-500", label: "Indigo" },
];

// Available icons for custom skills
export const AVAILABLE_ICONS = [
  { name: "Sparkles", component: Sparkles },
  { name: "Brain", component: Brain },
  { name: "Zap", component: Zap },
  { name: "Target", component: Target },
  { name: "MessageCircle", component: MessageCircle },
  { name: "GraduationCap", component: GraduationCap },
  { name: "Rocket", component: Rocket },
  { name: "Briefcase", component: Briefcase },
  { name: "BookOpen", component: BookOpen },
  { name: "HeartHandshake", component: HeartHandshake },
  { name: "Award", component: Award },
  { name: "Coffee", component: Coffee },
  { name: "Music", component: Music },
  { name: "Code", component: Code },
  { name: "Lightbulb", component: Lightbulb },
  { name: "Cake", component: Cake },
  { name: "Star", component: Star },
  { name: "Users", component: Users },
  { name: "Globe", component: Globe },
  { name: "Heart", component: Heart },
];

// Icon name to component mapping
export const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Brain,
  Zap,
  Target,
  MessageCircle,
  GraduationCap,
  Rocket,
  Briefcase,
  BookOpen,
  HeartHandshake,
  Award,
  Coffee,
  Music,
  Code,
  Lightbulb,
  Cake,
  Star,
  Users,
  Globe,
  Heart,
};

// Get icon component by name
export function getIconByName(iconName: string): React.ElementType {
  return ICON_MAP[iconName] || Sparkles;
}

// Get color classes for a skill
export function getSkillColor(skill: Skill): string {
  return SKILL_COLORS[skill] || "bg-purple-50 text-purple-500";
}

// Get icon component for a skill
export function getSkillIcon(skill: Skill): React.ElementType {
  return SKILL_ICONS[skill] || BookOpen;
}

// Get description for a skill
export function getSkillDescription(skill: Skill): string {
  return SKILL_DESCRIPTIONS[skill] || "Custom skill";
}

// Validate skill name (no special characters, max 50 chars)
export function validateSkillName(name: string): {
  isValid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Skill name is required" };
  }

  if (name.length > 50) {
    return { isValid: false, error: "Skill name must be 50 characters or less" };
  }

  // Allow letters, numbers, spaces, and basic punctuation
  const validPattern = /^[a-zA-Z0-9\s\-']+$/;
  if (!validPattern.test(name)) {
    return {
      isValid: false,
      error: "Skill name can only contain letters, numbers, spaces, and hyphens",
    };
  }

  return { isValid: true };
}

// Validate skill description
export function validateSkillDescription(description: string): {
  isValid: boolean;
  error?: string;
} {
  if (!description || description.trim().length === 0) {
    return { isValid: false, error: "Description is required" };
  }

  if (description.length > 200) {
    return {
      isValid: false,
      error: "Description must be 200 characters or less",
    };
  }

  return { isValid: true };
}

// Validate system prompt
export function validateSystemPrompt(prompt: string): {
  isValid: boolean;
  error?: string;
} {
  if (!prompt || prompt.trim().length === 0) {
    return { isValid: false, error: "System prompt is required" };
  }

  if (prompt.length < 20) {
    return {
      isValid: false,
      error: "System prompt should be at least 20 characters",
    };
  }

  if (prompt.length > 2000) {
    return { isValid: false, error: "System prompt must be 2000 characters or less" };
  }

  return { isValid: true };
}

// Type for custom skill
export type CustomSkill = {
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
  color: string;
};

// Validate entire custom skill
export function validateCustomSkill(skill: CustomSkill): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const nameValidation = validateSkillName(skill.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error!;
  }

  const descValidation = validateSkillDescription(skill.description);
  if (!descValidation.isValid) {
    errors.description = descValidation.error!;
  }

  const promptValidation = validateSystemPrompt(skill.systemPrompt);
  if (!promptValidation.isValid) {
    errors.systemPrompt = promptValidation.error!;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
