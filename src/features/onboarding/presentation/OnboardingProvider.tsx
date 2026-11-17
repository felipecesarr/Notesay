'use client';

import Joyride, { CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useOnboarding } from '../hooks/useOnboarding';
import { joyrideStyles, locale } from '../procedure';

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const {
    steps,
    isTourRunning,
    currentStepIndex,
    handleStepChange,
    stopTour,
    markTourCompleted,
  } = useOnboarding();

  const handleCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;

    // Tour finished or skipped
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      markTourCompleted();
      stopTour();
      return;
    }

    // After each step, go to the next one
    if (type === EVENTS.STEP_AFTER) {
      if (action === ACTIONS.NEXT) {
        handleStepChange(index + 1);
      } else if (action === ACTIONS.PREV) {
        handleStepChange(index - 1);
      }
    }

    // Target not found - skip to next step
    if (type === EVENTS.TARGET_NOT_FOUND) {
      handleStepChange(index + 1);
    }
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={isTourRunning}
        stepIndex={currentStepIndex}
        continuous
        showSkipButton
        showProgress
        scrollToFirstStep
        scrollOffset={100}
        spotlightClicks={false}
        disableOverlayClose
        disableCloseOnEsc={false}
        callback={handleCallback}
        styles={joyrideStyles}
        locale={locale}
      />
      {children}
    </>
  );
}
