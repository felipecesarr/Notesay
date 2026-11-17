"use client";

import React, { useState } from "react";
import { Button } from "@/core/components/ui/button";
import { Label } from "@/core/components/ui/label";
import { Input } from "@/core/components/ui/input";
import { ArrowLeft, Sparkles, ChevronDown, Wand2 } from "lucide-react";
import { enhanceSystemPrompt } from "@/meetmate/services/ai/gemini";
import { generateSkillIcon } from "@/features/skills/controller";
import { ICON_MAP } from "./constants";
import { Skill, ContextSource } from "./types";
import { ContextSourceInput } from "./ContextSourceInput";
import "./custom-radio.css";

type SkillFormProps = {
  onBack: () => void;
  onSave: (skill: Partial<Skill>) => void;
  initialValues?: Partial<Skill>;
  isSaving?: boolean;
};

export const SkillForm = React.memo(({
  onBack,
  onSave,
  initialValues,
  isSaving = false
}: SkillFormProps) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [systemPrompt, setSystemPrompt] = useState(initialValues?.systemPrompt || "");
  const [icon, setIcon] = useState(initialValues?.icon || "Sparkles");
  // Enforce brand color
  const color = "bg-[#defcc8] text-[#1b5f4a]";
  const [interviewMode, setInterviewMode] = useState<"ai-asks" | "user-asks">(initialValues?.interviewMode || "ai-asks");
  const [contextSources, setContextSources] = useState<ContextSource[]>(initialValues?.contextSources || []);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false);

  const handleGenerateIcon = async () => {
    if (!name && !description) return;
    setIsGeneratingIcon(true);
    try {
      const result = await generateSkillIcon(name, description);
      if (result.success && result.icon) {
        setIcon(result.icon);
      }
    } finally {
      setIsGeneratingIcon(false);
    }
  };

  const handleSave = () => {
    if (!name || !description || !systemPrompt) return;
    onSave({
      name,
      description,
      systemPrompt,
      icon,
      color,
      interviewMode,
      contextSources
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-stone-100 shrink-0 flex items-center gap-2">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-stone-100 rounded-full"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-stone-500" />
        </Button>
        <h2 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
          {initialValues ? "Edit Skill" : "New Skill"}
        </h2>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-5">
        {/* Basic Info */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-xs bg-stone-100 border-0 focus-visible:ring-stone-200"
              placeholder="e.g. Python Interviewer"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Description *</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-8 text-xs bg-stone-100 border-0 focus-visible:ring-stone-200"
              placeholder="Short description of the skill"
            />
          </div>
        </div>

        {/* Appearance Section */}
        <div className="space-y-4 pt-5 border-t border-stone-200">
          <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Appearance</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Icon Dropdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Icon</Label>
                 <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateIcon}
                    disabled={isGeneratingIcon || (!name && !description)}
                    className="h-5 px-1.5 text-[10px] text-[#1b5f4a] hover:text-[#1b5f4a] hover:bg-[#dfecc870]"
                 >
                    <Wand2 className={`w-3 h-3 mr-1 ${isGeneratingIcon ? 'animate-spin' : ''}`} />
                    {isGeneratingIcon ? "Selecting..." : "Auto-Select"}
                 </Button>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIconDropdownOpen(!iconDropdownOpen)}
                  className="w-full h-11 px-3 bg-stone-100 rounded-lg flex items-center justify-between hover:bg-stone-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = ICON_MAP[icon] || Sparkles;
                      return <Icon className="w-5 h-5 text-stone-600" />;
                    })()}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${iconDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {iconDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white rounded-lg border border-stone-200 shadow-lg z-50">
                    <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto scrollbar-hide">
                      {Object.keys(ICON_MAP).map((iconName) => {
                        const Icon = ICON_MAP[iconName];
                        return (
                          <button
                            type="button"
                            key={iconName}
                            onClick={() => {
                              setIcon(iconName);
                              setIconDropdownOpen(false);
                            }}
                            className={`p-2 rounded-md flex items-center justify-center transition-all ${
                              icon === iconName 
                                ? "bg-stone-200 text-stone-700" 
                                : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                            }`}
                            title={iconName}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* System Prompt Section */}
        <div className="space-y-3 pt-5 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">System Prompt</h3>
              <p className="text-[9px] text-stone-400 mt-0.5">Define AI behavior and question style</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (!systemPrompt.trim()) return;
                setIsEnhancing(true);
                try {
                  const enhanced = await enhanceSystemPrompt(systemPrompt);
                  setSystemPrompt(enhanced);
                } finally {
                  setIsEnhancing(false);
                }
              }}
              disabled={isEnhancing || !systemPrompt.trim()}
              className="h-6 px-2 text-[10px] text-[#1b5f4a] hover:text-[#1b5f4a] hover:bg-[#dfecc870]"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {isEnhancing ? "Enhancing..." : "Enhance"}
            </Button>
          </div>
          <textarea 
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="flex min-h-[100px] w-full rounded-lg border-0 bg-stone-100 px-3 py-2.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-stone-200"
            placeholder="e.g., You are an expert Python interviewer. Ask technical questions about data structures, algorithms, and best practices..."
          />
        </div>

        {/* Interview Mode Section - Minimalist */}
        <div className="space-y-2 pt-5 border-t border-stone-200">
          <Label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Interview Mode</Label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="interviewMode"
                checked={interviewMode === "ai-asks"}
                onChange={() => setInterviewMode("ai-asks")}
                className="w-4 h-4 text-[#1b5f4a] border-stone-300 focus:ring-[#dfecc8]"
              />
              <span className="text-xs text-stone-600">AI asks → I answer</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="interviewMode"
                checked={interviewMode === "user-asks"}
                onChange={() => setInterviewMode("user-asks")}
                className="w-4 h-4 text-[#1b5f4a] border-stone-300 focus:ring-[#dfecc8]"
              />
              <span className="text-xs text-stone-600">I ask → AI answers</span>
            </label>
          </div>
        </div>

        {/* Context Sources Section */}
        <div className="pt-5 border-t border-stone-200">
          <div className="p-4 bg-[#dfecc870] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-[#dfecc8] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-[#1b5f4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-[10px] font-bold text-[#1b5f4a] uppercase tracking-wider">Context Sources</h3>
                <p className="text-[9px] text-[#1b5f4a] mt-0.5">Select from your library or add new sources</p>
              </div>
            </div>
            <div className="mb-3 p-2 bg-white rounded-lg border border-[#dfecc8]">
              <p className="text-[9px] text-[#1b5f4a] leading-relaxed">
                💡 <strong>Interview Practice:</strong> Add materials for AI to use during interview sessions. The AI will ask questions or answer based on these sources.
              </p>
            </div>
            <ContextSourceInput 
              sources={contextSources} 
              onChange={setContextSources} 
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/50">
        <Button
          onClick={handleSave}
          disabled={!name || !description || !systemPrompt || isSaving}
          className="w-full h-9 bg-stone-200 text-stone-700 hover:bg-stone-300 shadow-none"
        >
          {isSaving ? "Saving..." : initialValues ? "Save Changes" : "Create Skill"}
        </Button>
      </div>
    </div>
  );
});

SkillForm.displayName = "SkillForm";
