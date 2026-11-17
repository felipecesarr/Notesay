"use client";

import { useState } from "react";
import { Video, Settings2, Cog } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/core/components/ui/button";
import { ResponsivePopover } from "@/core/components/ResponsivePopover";
import { SkillSelector } from "@/features/skills/presentation/SkillSelector";
import { SettingsPopover } from "@/features/auth/presentation/SettingsPopover";
import { type Skill } from "@/meetmate/services/ai/gemini";
import { useUIStore, type TabId } from "@/core/store/ui-store";

const YouTubeStudyTab = dynamic(
  () =>
    import("@/features/youtube-study/presentation/YouTubeStudyTab").then(
      (mod) => ({ default: mod.YouTubeStudyTab })
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-white rounded-[3rem]">
        <div className="animate-pulse text-stone-400">Loading...</div>
      </div>
    ),
  }
);

const PDFStudyTab = dynamic(
  () =>
    import("@/features/pdf-study/presentation/PDFStudyTab").then(
      (mod) => ({ default: mod.PDFStudyTab })
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-white rounded-[3rem]">
        <div className="animate-pulse text-stone-400">Loading...</div>
      </div>
    ),
  }
);

interface StudioWithTabsProps {
  children: React.ReactNode;
  selectedSkill: Skill;
  onSelectSkill: (skill: Skill, options?: unknown) => void;
  onSendChatMessage?: (message: string) => void;
}

export function StudioWithTabs({
  children,
  selectedSkill,
  onSelectSkill,
  onSendChatMessage,
}: StudioWithTabsProps) {
  const { activeTab, setActiveTab } = useUIStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const tabs = [
    { id: "interview", label: "Interview", icon: Video, isYouTube: false },
    { id: "youtube", label: "YouTube", icon: null, isYouTube: true },
    { id: "pdf", label: "PDF Study", icon: null, isYouTube: false, isPdf: true },
  ];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Tabs Row with Skills Button - Hidden on mobile */}
      <div className="hidden md:flex items-center justify-between px-4 py-3 shrink-0">
        {/* Tabs */}
        <div data-tour="studio-tabs" className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isPdf = tab.isPdf;

            return (
              <button
                key={tab.id}
                data-tour={`${tab.id}-tab`}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap
                  ${
                    isActive
                      ? "bg-stone-200 text-stone-500"
                      : "bg-stone-200/50 text-stone-500 hover:bg-stone-200 hover:text-stone-900"
                  }
                `}
              >
                {tab.isYouTube ? (
                  <div className="w-3.5 h-3.5 shrink-0">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-full h-full text-red-600 fill-current"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </div>
                ) : isPdf ? (
                     <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-full h-full text-stone-500"
                        >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <path d="M16 13H8"/>
                            <path d="M16 17H8"/>
                            <path d="M10 9H8"/>
                        </svg>
                     </div>
                ) : Icon ? (
                  <Icon className="w-3.5 h-3.5 fill-stone-500 hover:fil-stone-900" />
                ) : null}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Skills & Settings Buttons */}
        <div className="flex items-center gap-2">
          <ResponsivePopover
            trigger={
              <Button
                data-tour="skills-button"
                variant="ghost"
                size="sm"
                className="px-4 py-2 text-stone-500 bg-stone-200/50 hover:text-stone-900 hover:bg-stone-200"
              >
                <Settings2 className="w-4 h-4" />
              </Button>
            }
            desktopWidth="w-[420px]"
            desktopHeight="h-[480px]"
          >
            <div className="h-full border-white/40 bg-white/10 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
              <SkillSelector
                selectedSkill={selectedSkill}
                onSelectSkill={(skill, options) => {
                  const skillName = typeof skill === "string" ? skill : skill.name;
                  onSelectSkill(skillName as Skill, options);
                }}
              />
            </div>
          </ResponsivePopover>

          <ResponsivePopover
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            trigger={
              <Button
                data-tour="settings-button"
                variant="ghost"
                size="sm"
                className="px-4 py-2 text-stone-500 bg-stone-200/50 hover:text-stone-900 hover:bg-stone-200"
              >
                <Cog className="w-8 h-8" />
              </Button>
            }
            desktopWidth="w-[420px]"
            desktopHeight="h-[480px]"
          >
            <div className="h-full border-white/40 bg-white/10 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
              <SettingsPopover onClose={() => setSettingsOpen(false)} />
            </div>
          </ResponsivePopover>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {activeTab === "interview" ? (
            children
        ) : activeTab === "youtube" ? (
            <YouTubeStudyTab onSendChatMessage={onSendChatMessage} />
        ) : (
            <PDFStudyTab onSendChatMessage={onSendChatMessage} />
        )}
      </div>
    </div>
  );
}
