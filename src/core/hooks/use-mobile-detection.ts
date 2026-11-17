"use client";

import { useEffect } from 'react';
import { useUIStore } from '@/core/store/ui-store';

const MOBILE_BREAKPOINT = 767;

export function useMobileDetection() {
  const setIsMobile = useUIStore((state) => state.setIsMobile);
  const isMobile = useUIStore((state) => state.isMobile);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    // Set initial value
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setIsMobile]);

  return isMobile;
}
