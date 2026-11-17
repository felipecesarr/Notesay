import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  isTourRunning: boolean;
  currentStepIndex: number;
  hasCompletedTour: boolean;

  startTour: () => void;
  stopTour: () => void;
  setStepIndex: (index: number) => void;
  markTourCompleted: () => void;
  resetTour: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      isTourRunning: false,
      currentStepIndex: 0,
      hasCompletedTour: false,

      startTour: () => set({ isTourRunning: true, currentStepIndex: 0 }),
      stopTour: () => set({ isTourRunning: false }),
      setStepIndex: (index) => set({ currentStepIndex: index }),
      markTourCompleted: () => set({ hasCompletedTour: true, isTourRunning: false }),
      resetTour: () => set({ hasCompletedTour: false, currentStepIndex: 0 }),
    }),
    {
      name: 'notesay-onboarding',
      partialize: (state) => ({ hasCompletedTour: state.hasCompletedTour }),
    }
  )
);
