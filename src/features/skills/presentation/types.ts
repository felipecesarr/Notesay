export type ContextSource = {
  type: "pdf" | "url" | "video";
  content: string;
  title: string;
};

export type Skill = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
  color: string;
  isDefault: boolean;
  contextSources?: ContextSource[] | null;
  interviewMode: "ai-asks" | "user-asks";
  userId: string;
};

export type SkillSelectorProps = {
  selectedSkill: Skill | string; // Allow string for legacy skills (e.g. "Journal")
  onSelectSkill: (skill: Skill | string, options?: {
    context?: ContextSource[];
    systemPrompt?: string;
    interviewMode?: "ai-asks" | "user-asks";
  }) => void;
};
