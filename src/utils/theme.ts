// Central theme constants used across the entire app
export const COLORS = {
    // Core Background
    dark: '#0B0F19',
    darkCard: '#141926',
    darkSurface: '#1C2333',
    light: '#F3F4F6',
    lightCard: '#FFFFFF',
    lightSurface: '#EAECF0',

    // Primary Accent
    primary: '#E11D48',
    primaryDim: 'rgba(225, 29, 72, 0.15)',
    primaryGlow: 'rgba(225, 29, 72, 0.3)',

    // Text
    textWhite: '#FFFFFF',
    textDark: '#1F2937',
    textGrey: '#9CA3AF',
    textGreyLight: '#6B7280',
    textMuted: '#4B5563',

    // Utility
    gold: '#FBBF24',
    goldDim: 'rgba(251, 191, 36, 0.12)',
    goldBorder: 'rgba(251, 191, 36, 0.25)',
    transparent: 'transparent',

    // Dark borders/surfaces
    darkBorder: 'rgba(255, 255, 255, 0.08)',
    darkBorderStrong: 'rgba(255, 255, 255, 0.14)',
    darkOverlay: 'rgba(11, 15, 25, 0.7)',

    // Light borders
    lightBorder: '#E5E7EB',
    lightBorderStrong: 'rgba(0, 0, 0, 0.12)',
};

export const FONT_WEIGHTS = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
};

export const RADII = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 999,
};
