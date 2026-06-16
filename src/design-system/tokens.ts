/** Design tokens — keep in sync with index.css @theme */
export const THEME = {
  colors: {
    surface: {
      primary:   '#09090b',  // zinc-950
      secondary: '#18181b',  // zinc-900
      tertiary:  '#27272a',  // zinc-800
    },
    brand: {
      primary:   '#3b82f6',  // blue-500
      secondary: '#6366f1',  // indigo-500
    },
    status: {
      success: '#10b981',    // emerald-500
      error:   '#ef4444',    // red-500
      warning: '#f59e0b',    // amber-500
      info:    '#0ea5e9',    // sky-500
    },
  },
  zIndex: {
    base:       0,
    threeCanvas:1,
    overlays:   10,
    sidebar:    20,
    topBar:     30,
    modal:      100,
    toast:      200,
  }
} as const;

export const TYPOGRAPHY = {
  scale: {
    xs:   '10px',
    sm:   '12px',
    md:   '14px',
    lg:   '16px',
    xl:   '20px',
    xxl:  '32px',
  },
  weight: {
    normal: 400,
    medium: 500,
    bold:   700,
    black:  900,
  }
} as const;

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
} as const;

export const RADIUS = {
  sm:   '4px',
  md:   '6px',
  lg:   '10px',
  xl:   '16px',
  full: '9999px',
} as const;
