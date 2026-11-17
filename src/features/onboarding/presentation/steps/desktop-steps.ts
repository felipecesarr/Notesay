import type { Step } from 'react-joyride';
import type { UIState } from '@/core/store/ui-store';

export interface OnboardingStep extends Step {
  tabAction?: (store: UIState) => void;
  sidebarAction?: (store: UIState) => void;
}

export const desktopSteps: OnboardingStep[] = [
  // Step 1: Welcome
  {
    target: '[data-tour="studio-tabs"]',
    title: 'Welcome to Notesay AI!',
    content: 'Here you will find the main study modes: AI Interview, YouTube videos, and PDF documents.',
    placement: 'bottom',
    disableBeacon: true,
  },
  // Step 2: Interview Tab
  {
    target: '[data-tour="interview-tab"]',
    title: 'Interview Mode',
    content: 'Practice English conversation with AI. It asks questions and you respond using your camera.',
    placement: 'bottom',
    tabAction: (store) => store.setActiveTab('interview'),
  },
  // Step 3: Camera Preview
  {
    target: '[data-tour="camera-preview"]',
    title: 'Camera Preview',
    content: 'Your video appears here. Click the green button to start recording.',
    placement: 'right',
  },
  // Step 4: Recording Controls
  {
    target: '[data-tour="recording-controls"]',
    title: 'Controls',
    content: 'Use these buttons to start/stop recording and toggle video and audio.',
    placement: 'top',
  },
  // Step 5: Skill Pills
  {
    target: '[data-tour="skill-pills"]',
    title: 'Skills',
    content: 'Choose the conversation context: work, travel, job interview, and more.',
    placement: 'top',
  },
  // Step 6: YouTube Tab
  {
    target: '[data-tour="youtube-tab"]',
    title: 'YouTube Study',
    content: 'Learn English with YouTube videos! Paste a URL and practice with the captions.',
    placement: 'bottom',
    tabAction: (store) => store.setActiveTab('youtube'),
  },
  // Step 7: YouTube Input
  {
    target: '[data-tour="youtube-input"]',
    title: 'Video URL',
    content: 'Paste the YouTube link here. The system extracts captions automatically.',
    placement: 'bottom',
  },
  // Step 8: PDF Tab
  {
    target: '[data-tour="pdf-tab"]',
    title: 'PDF Study',
    content: 'Upload PDFs in English to study. Great for articles, books, and documents.',
    placement: 'bottom',
    tabAction: (store) => store.setActiveTab('pdf'),
  },
  // Step 9: PDF Input
  {
    target: '[data-tour="pdf-input"]',
    title: 'PDF Upload',
    content: 'Drag or click to upload your PDF. The text will be extracted for study.',
    placement: 'bottom',
  },
  // Step 10: Sidebar Toggle (back to interview)
  {
    target: '[data-tour="sidebar-toggle"]',
    title: 'Side Panel',
    content: 'Open or close the panel with chat, flashcards, and notes.',
    placement: 'left',
    tabAction: (store) => store.setActiveTab('interview'),
    sidebarAction: (store) => store.setSidebarOpen(true),
  },
  // Step 11: Sidebar Tabs
  {
    target: '[data-tour="sidebar-tabs"]',
    title: 'Tools',
    content: 'Chat, Flashcards, Read Aloud, and Notes - all your study tools in one place.',
    placement: 'left',
  },
  // Step 12: Chat Tab
  {
    target: '[data-tour="chat-tab"]',
    title: 'AI Chat',
    content: 'Chat with AI about any topic in English. It helps correct your mistakes.',
    placement: 'left',
    sidebarAction: (store) => store.setSidebarTab('chat'),
  },
  // Step 13: Chat Modes
  {
    target: '[data-tour="chat-modes"]',
    title: 'Chat Modes',
    content: 'Choose the style: Chill, Grammar, Fluency, Culture, Advanced, or Quiz.',
    placement: 'top',
  },
  // Step 14: Chat Input
  {
    target: '[data-tour="chat-input"]',
    title: 'Write Message',
    content: 'Type your message here. Use @ to include context from videos or PDFs.',
    placement: 'top',
  },
  // Step 15: Flashcards Tab
  {
    target: '[data-tour="flashcards-tab"]',
    title: 'Flashcards',
    content: 'Vocabulary cards generated from your conversations. Practice with spaced repetition.',
    placement: 'left',
    sidebarAction: (store) => store.setSidebarTab('flashcards'),
  },
  // Step 16: Read Aloud Tab
  {
    target: '[data-tour="readaloud-tab"]',
    title: 'Read Aloud',
    content: 'Practice pronunciation by reading texts out loud. Includes listening and shadowing modes.',
    placement: 'left',
    sidebarAction: (store) => store.setSidebarTab('readAloud'),
  },
  // Step 17: Notes Tab
  {
    target: '[data-tour="notes-tab"]',
    title: 'Notes',
    content: 'Save highlights, transcripts, and feedback to review later.',
    placement: 'left',
    sidebarAction: (store) => store.setSidebarTab('notes'),
  },
  // Step 18: Skills Button
  {
    target: '[data-tour="skills-button"]',
    title: 'Manage Skills',
    content: 'Create and edit your custom practice contexts.',
    placement: 'bottom-end',
    sidebarAction: (store) => store.setSidebarTab('chat'),
  },
  // Step 19: Settings Button
  {
    target: '[data-tour="settings-button"]',
    title: 'Settings',
    content: 'Access your profile, subscription, and account options. You can restart this tutorial here.',
    placement: 'bottom-end',
  },
];
