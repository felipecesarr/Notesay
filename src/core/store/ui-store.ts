import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TabId = "interview" | "youtube" | "pdf";

// Sidebar Content Tab
export type SidebarTabId = "chat" | "readAloud" | "flashcards" | "dictionary" | "notes";

// Mobile Navigation Tab
export type MobileTabId = "camera" | "youtube" | "pdf" | "chat";

// View States for Study Tabs
export type YouTubeViewState = "input" | "library" | "practice";
export type PDFViewState = "input" | "library" | "practice" | "processing";

export interface UIState {
  // Global Tabs (Main View)
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Sidebar Logic
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  
  // Sidebar Content
  sidebarTab: SidebarTabId;
  setSidebarTab: (tab: SidebarTabId) => void;

  // Audio/Interview Settings
  isAudioEnabled: boolean;
  toggleAudio: () => void;

  // Feedback Visibility
  isFeedbackSummaryOpen: boolean;
  setFeedbackSummaryOpen: (isOpen: boolean) => void;

  // Mobile Navigation
  mobileActiveTab: MobileTabId;
  setMobileActiveTab: (tab: MobileTabId) => void;
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;

  // YouTube Study Persistence
  currentYouTubeStudyId: string | null;
  setCurrentYouTubeStudyId: (id: string | null) => void;
  youtubeViewState: YouTubeViewState;
  setYoutubeViewState: (view: YouTubeViewState) => void;

  // PDF Study Persistence
  currentPDFStudyId: string | null;
  setCurrentPDFStudyId: (id: string | null) => void;
  pdfViewState: PDFViewState;
  setPdfViewState: (view: PDFViewState) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: "youtube", // Default to YouTube as established
      setActiveTab: (tab) => set({ activeTab: tab }),

      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

      sidebarTab: "chat",
      setSidebarTab: (tab) => set({ sidebarTab: tab }),

      isAudioEnabled: true,
      toggleAudio: () => set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),

      isFeedbackSummaryOpen: false,
      setFeedbackSummaryOpen: (isOpen) => set({ isFeedbackSummaryOpen: isOpen }),

      mobileActiveTab: "camera",
      setMobileActiveTab: (tab) => set({ mobileActiveTab: tab }),
      isMobile: false,
      setIsMobile: (isMobile) => set({ isMobile }),

      // YouTube Study Persistence
      currentYouTubeStudyId: null,
      setCurrentYouTubeStudyId: (id) => set({ currentYouTubeStudyId: id }),
      youtubeViewState: "input",
      setYoutubeViewState: (view) => set({ youtubeViewState: view }),

      // PDF Study Persistence
      currentPDFStudyId: null,
      setCurrentPDFStudyId: (id) => set({ currentPDFStudyId: id }),
      pdfViewState: "input",
      setPdfViewState: (view) => set({ pdfViewState: view }),
    }),
    {
      name: 'meetmate-ui-storage', // Save state to localStorage
      partialize: (state) => ({ 
        // Only persist settings, maybe not activeTab if we want reset on reload?
        // Let's persist activeTab so user stays where they were.
        activeTab: state.activeTab,
        isSidebarOpen: state.isSidebarOpen,
        isAudioEnabled: state.isAudioEnabled
      }),
    }
  )
);
