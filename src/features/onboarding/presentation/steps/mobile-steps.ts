import type { Step } from 'react-joyride';

export const mobileSteps: Step[] = [
  {
    target: '[data-tour="mobile-nav"]',
    title: 'Navigation',
    content: 'Use these buttons to switch between Camera, YouTube, PDF, and Chat.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-tour="mobile-camera"]',
    title: 'Camera',
    content: 'Interview mode with video recording for conversation practice.',
    placement: 'top',
  },
  {
    target: '[data-tour="mobile-youtube"]',
    title: 'YouTube',
    content: 'Study English with YouTube videos.',
    placement: 'top',
  },
  {
    target: '[data-tour="mobile-pdf"]',
    title: 'PDF',
    content: 'Study English with PDF documents.',
    placement: 'top',
  },
  {
    target: '[data-tour="mobile-chat"]',
    title: 'Chat',
    content: 'Chat with AI and access flashcards, notes, and reading practice.',
    placement: 'top',
  },
];
