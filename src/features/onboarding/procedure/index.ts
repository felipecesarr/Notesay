import type { Styles, Locale } from 'react-joyride';

export const joyrideStyles: Partial<Styles> = {
  options: {
    primaryColor: '#1b5f4a',
    textColor: '#44403c',
    backgroundColor: '#ffffff',
    arrowColor: '#ffffff',
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    spotlightShadow: '0 0 30px rgba(27, 95, 74, 0.3)',
    beaconSize: 36,
    zIndex: 1000,
  },
  buttonNext: {
    backgroundColor: '#1b5f4a',
    color: '#dfecc8',
    borderRadius: '9999px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 500,
  },
  buttonBack: {
    color: '#78716c',
    fontSize: '12px',
    marginRight: 8,
  },
  buttonSkip: {
    color: '#a8a29e',
    fontSize: '11px',
  },
  tooltip: {
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
  },
  tooltipContent: {
    padding: '0',
    fontSize: '13px',
    lineHeight: '1.6',
  },
  tooltipTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1c1917',
    marginBottom: '8px',
  },
};

export const locale: Locale = {
  back: 'Back',
  close: 'Close',
  last: 'Finish',
  next: 'Next',
  open: 'Open',
  skip: 'Skip tutorial',
};
