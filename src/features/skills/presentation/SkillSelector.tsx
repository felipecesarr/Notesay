import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { getUserSkills, createSkill, updateSkill, deleteSkill } from "@/features/skills/controller";
import { SkillCard } from "./SkillCard";
import { SkillForm } from "./SkillForm";
import { Skill, SkillSelectorProps, ContextSource } from "./types";

export function SkillSelector({ selectedSkill, onSelectSkill }: SkillSelectorProps) {
  const [view, setView] = useState<"list" | "form">("list");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  
  // UI State
  const [deletingSkillId, setDeletingSkillId] = useState<string | null>(null);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSkills = useCallback(async () => {
    if (hasLoadedOnce && skills.length > 0) return; // Don't refetch if already loaded
    
    setIsLoadingSkills(true);
    const result = await getUserSkills();
    if (result.success && result.skills) {
      const mappedSkills = result.skills.map(s => ({
        ...s,
        contextSources: s.contextSources as unknown as ContextSource[] | null,
        interviewMode: s.interviewMode as "ai-asks" | "user-asks"
      }));
      setSkills(mappedSkills);
      setHasLoadedOnce(true);
    }
    setIsLoadingSkills(false);
  }, [hasLoadedOnce, skills.length]);

  // Only fetch once when component mounts
  useEffect(() => {
    if (!hasLoadedOnce) {
      fetchSkills();
    }
  }, [hasLoadedOnce, fetchSkills]);

  const handleSaveSkill = async (skillData: Partial<Skill>) => {
    setIsSaving(true);
    try {
      const data = {
        name: skillData.name!,
        description: skillData.description!,
        systemPrompt: skillData.systemPrompt!,
        icon: skillData.icon!,
        color: skillData.color!,
        interviewMode: skillData.interviewMode,
        contextSources: skillData.contextSources || undefined
      };

      let result;
      if (editingSkill?.id) {
        result = await updateSkill(editingSkill.id, data);
      } else {
        result = await createSkill(data);
      }

      if (result.success) {
        // Force refresh after save
        setHasLoadedOnce(false);
        await fetchSkills();
        
        onSelectSkill(skillData.name!, {
          systemPrompt: skillData.systemPrompt,
          context: skillData.contextSources || undefined,
          interviewMode: skillData.interviewMode
        });

        setView("list");
        setEditingSkill(undefined);
      }
    } catch (error) {
      console.error("Failed to save skill");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    const result = await deleteSkill(id);
    if (result.success) {
      setSkills(skills.filter(s => s.id !== id));
      setDeletingSkillId(null);
    }
  };

  if (view === "list") {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-3 py-2.5 border-b border-stone-100 shrink-0">
          <h2 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Library</h2>
        </div>

        <div className="flex-1 overflow-auto scrollbar-hide px-3 py-3">
          {isLoadingSkills ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-1">
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                isSelected={selectedSkill === skill.name}
                isExpanded={expandedSkillId === skill.id}
                isDeleting={deletingSkillId === skill.id}
                onSelect={() => {
                  onSelectSkill(skill.name, {
                    systemPrompt: skill.systemPrompt,
                    context: skill.contextSources || undefined,
                    interviewMode: skill.interviewMode
                  });
                }}
                onExpand={() => setExpandedSkillId(skill.id)}
                onCollapse={() => setExpandedSkillId(null)}
                onEdit={() => {
                  setEditingSkill(skill);
                  setView("form");
                }}
                onDeleteStart={() => setDeletingSkillId(skill.id)}
                onDeleteConfirm={() => handleDeleteSkill(skill.id)}
                onDeleteCancel={() => setDeletingSkillId(null)}
              />
            ))}
            
            {/* New Skill Button */}
            <button
              onClick={() => {
                setEditingSkill(undefined);
                setView("form");
              }}
              className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-stone-200 hover:border-violet-200 hover:bg-violet-50/50 transition-all group h-28 m-2"
            >
              <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-violet-100 flex items-center justify-center mb-2 transition-colors">
                <Plus className="w-4 h-4 text-stone-400 group-hover:text-violet-600" />
              </div>
              <span className="text-[10px] font-medium text-stone-500 group-hover:text-violet-600">
                New Skill
              </span>
            </button>
          </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <SkillForm
      onBack={() => {
        setView("list");
        setEditingSkill(undefined);
      }}
      onSave={handleSaveSkill}
      initialValues={editingSkill}
      isSaving={isSaving}
    />
  );
}
