import Webcam from "react-webcam";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Repeat, ScanText, StickyNote } from "lucide-react";
import { type TabId, TranscriptSidebar } from "@/features/ai-interaction/presentation/TranscriptSidebar";
import { CameraPreview } from "@/features/recording/presentation/CameraPreview";
import { StudioWithTabs } from "./StudioWithTabs";
import { type Skill } from "@/meetmate/services/ai/gemini";
import type { ChatMessage, ChatConversation } from "@/features/chat/procedure";
import { type SkillData } from "@/features/skills/hooks/useSkills";
import { MobileBottomNav } from "@/core/components/MobileBottomNav";
import { MobileHeader } from "@/core/components/MobileHeader";
import { useUIStore } from "@/core/store/ui-store";
import { useMobileDetection } from "@/core/hooks/use-mobile-detection";
import { YouTubeStudyTab } from "@/features/youtube-study/presentation/YouTubeStudyTab";
import { PDFStudyTab } from "@/features/pdf-study/presentation/PDFStudyTab";

type SelectSkillOptions = {
  context?: Array<{ type: "pdf" | "url" | "video"; content: string; title: string }>;
  interviewMode?: "ai-asks" | "user-asks";
  systemPrompt?: string;
};

interface InterviewLayoutProps {
  // State
  selectedSkillName: string;
  transcript: string;
  chatMessages: ChatMessage[];
  savedChats: ChatConversation[];
  currentChatId: string | null;
  currentChatTitle: string;
  sidebarTab: TabId;
  showTranscript: boolean;
  capturing: boolean;
  elapsedTime: number;
  currentInterviewQuestion: string;
  isProcessingAI: boolean;
  isChatProcessing: boolean;
  webcamRef: React.RefObject<Webcam>;
  userImage?: string;
  skills: SkillData[];
  isListening: boolean;

  // Handlers
  onSelectSkill: (skillName: string, options?: SelectSkillOptions) => void;
  onSendChatMessage: (message: string, selectedVideoIds?: string[], isQuizMode?: boolean, chatMode?: string) => void;
  onStartCapture: () => void;
  onStopCapture: () => void;
  onToggleSidebar: () => void;
  onSendTranscript: () => void;
  onTabChange: (tab: TabId) => void;
  onNewChat: (saveCurrent?: boolean) => void;
  onChatSelect: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  formatTime: (seconds: number) => string;
}

export const InterviewLayout = React.memo(function InterviewLayout({
  selectedSkillName,
  transcript,
  chatMessages,
  savedChats,
  currentChatId,
  currentChatTitle,
  sidebarTab,
  showTranscript,
  capturing,
  elapsedTime,
  currentInterviewQuestion,
  isProcessingAI,
  isChatProcessing,
  webcamRef,
  userImage,
  skills,
  isListening,
  onSelectSkill,
  onSendChatMessage,
  onStartCapture,
  onStopCapture,
  onToggleSidebar,
  onSendTranscript,
  onTabChange,
  onNewChat,
  onChatSelect,
  onDeleteChat,
  formatTime,
}: InterviewLayoutProps) {
  // Mobile detection and state
  const isMobile = useMobileDetection();
  const mobileActiveTab = useUIStore((state) => state.mobileActiveTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);

  // Sync mobile tab with global activeTab (for YouTube/PDF)
  useEffect(() => {
    if (isMobile) {
      if (mobileActiveTab === "youtube") {
        setActiveTab("youtube");
      } else if (mobileActiveTab === "pdf") {
        setActiveTab("pdf");
      } else if (mobileActiveTab === "camera") {
        setActiveTab("interview");
      }
    }
  }, [mobileActiveTab, setActiveTab, isMobile]);

  // Memoize the tab list to prevent re-creation
  const tabs = React.useMemo(() => [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "flashcards", label: "Flashcards", icon: Repeat },
    { id: "readAloud", label: "Read Aloud", icon: ScanText },
    { id: "notes", label: "Notes", icon: StickyNote },
  ], []);

  // Shared CameraPreview props
  const cameraPreviewProps = {
    webcamRef,
    capturing,
    elapsedTime,
    currentQuestion: currentInterviewQuestion,
    isProcessingAI,
    onStartCapture,
    onStopCapture,
    formatTime,
    showSidebar: showTranscript,
    onToggleSidebar,
    selectedSkillName,
    onSelectSkill,
    skills,
    transcript,
    onSendTranscript,
  };

  // Shared TranscriptSidebar props
  const transcriptSidebarProps = {
    isListening,
    transcript,
    messages: chatMessages,
    selectedSkillName,
    activeTab: sidebarTab,
    onTabChange,
    onSendChatMessage,
    isChatProcessing,
    userImage,
    onNewChat,
    savedChats,
    currentChatId: currentChatId || undefined,
    currentChatTitle,
    onChatSelect,
    onDeleteChat,
    // onFeedbackGenerated,
  };

  return (
    <div className="flex flex-col w-full h-full max-w-[1800px] mx-auto gap-2 md:gap-0">
      {/* Mobile Header */}
      <MobileHeader />

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 gap-5 p-2 min-h-0">
        {/* Studio with Tabs */}
        <StudioWithTabs
          selectedSkill={selectedSkillName as unknown as Skill}
          onSelectSkill={(skillName, options) => onSelectSkill(skillName as string, options as SelectSkillOptions)}
          onSendChatMessage={onSendChatMessage}
        >
          <CameraPreview {...cameraPreviewProps} />
        </StudioWithTabs>

        {/* Sidebar with Tabs */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 440, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col"
            >
              {/* Tabs Outside Sidebar */}
              <div data-tour="sidebar-tabs" className="flex items-center gap-1 px-2 py-3 shrink-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = sidebarTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id as TabId)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap
                        ${
                          isActive
                            ? "bg-[#dfecc870] text-[#1b5f4a]"
                            : "bg-stone-200/50 text-stone-500 hover:bg-stone-200 hover:text-stone-900"
                        }
                      `}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Sidebar Content */}
              <TranscriptSidebar {...transcriptSidebarProps} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col flex-1 pb-nav min-h-[500px] overflow-y-auto">
        {mobileActiveTab === "camera" && (
          <div className="flex-1 flex flex-col min-h-0 p-2">
            <StudioWithTabs
              selectedSkill={selectedSkillName as unknown as Skill}
              onSelectSkill={(skillName, options) => onSelectSkill(skillName as string, options as SelectSkillOptions)}
              onSendChatMessage={onSendChatMessage}
            >
              <CameraPreview {...cameraPreviewProps} isMobile />
            </StudioWithTabs>
          </div>
        )}
        {mobileActiveTab === "youtube" && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <YouTubeStudyTab onSendChatMessage={onSendChatMessage} />
          </div>
        )}
        {mobileActiveTab === "pdf" && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <PDFStudyTab onSendChatMessage={onSendChatMessage} />
          </div>
        )}
        {mobileActiveTab === "chat" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Mobile Sidebar Tabs */}
            <div className="flex items-center gap-1 px-2 py-3 shrink-0 bg-stone-50 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = sidebarTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id as TabId)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap
                      ${
                        isActive
                          ? "bg-[#dfecc870] text-[#1b5f4a]"
                          : "bg-stone-200/50 text-stone-500 hover:bg-stone-200 hover:text-stone-900"
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {/* Mobile Sidebar Content */}
            <div className="flex-1 min-h-0">
              <TranscriptSidebar {...transcriptSidebarProps} isMobile />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
});
