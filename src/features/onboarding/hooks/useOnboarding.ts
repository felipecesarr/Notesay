'use client';

import { useCallback, useMemo, useEffect } from 'react';
import { useOnboardingStore } from '../store/onboarding-store';
import { useUIStore } from '@/core/store/ui-store';
import { desktopSteps, type OnboardingStep } from '../presentation/steps/desktop-steps';
import { mobileSteps } from '../presentation/steps/mobile-steps';

export function useOnboarding() {
  const store = useOnboardingStore();
  const uiStore = useUIStore();
  const isMobile = uiStore.isMobile;

  const steps = useMemo(() => {
    return isMobile ? mobileSteps : desktopSteps;
  }, [isMobile]);

  // Execute navigation actions before showing the step
  const executeStepActions = useCallback((stepIndex: number) => {
    if (isMobile) return;

    const step = desktopSteps[stepIndex] as OnboardingStep;

    if (step?.tabAction) {
      step.tabAction(uiStore);
    }
    if (step?.sidebarAction) {
      step.sidebarAction(uiStore);
    }
  }, [isMobile, uiStore]);

  const handleStepChange = useCallback((newIndex: number) => {
    // Execute actions for the next step
    executeStepActions(newIndex);
    // Small delay to ensure UI has updated
    setTimeout(() => {
      store.setStepIndex(newIndex);
    }, 100);
  }, [executeStepActions, store]);

  // Auto-start tour for new users
  useEffect(() => {
    if (!store.hasCompletedTour && !store.isTourRunning) {
      // Delay to ensure components are mounted
      const timer = setTimeout(() => {
        store.startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    steps,
    isTourRunning: store.isTourRunning,
    currentStepIndex: store.currentStepIndex,
    hasCompletedTour: store.hasCompletedTour,
    startTour: store.startTour,
    stopTour: store.stopTour,
    setStepIndex: store.setStepIndex,
    markTourCompleted: store.markTourCompleted,
    resetTour: store.resetTour,
    handleStepChange,
    executeStepActions,
  };
}
