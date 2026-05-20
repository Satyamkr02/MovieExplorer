import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { toggleTheme } from '../redux/slices/themeSlice';
import { COLORS } from '../utils/theme';

/**
 * Custom hook to access dynamic theme colors based on the current dark/light mode.
 * Returns both the darkMode boolean and a computed color palette.
 */
export const useTheme = () => {
    const dispatch = useDispatch<AppDispatch>();
    const darkMode = useSelector((state: RootState) => state.theme.darkMode);

    const colors = useMemo(() => ({
        background: darkMode ? COLORS.dark : COLORS.light,
        card: darkMode ? COLORS.darkCard : COLORS.lightCard,
        surface: darkMode ? COLORS.darkSurface : COLORS.lightSurface,
        text: darkMode ? COLORS.textWhite : COLORS.textDark,
        subText: darkMode ? COLORS.textGrey : COLORS.textGreyLight,
        mutedText: darkMode ? COLORS.textMuted : COLORS.textMuted,
        border: darkMode ? COLORS.darkBorder : COLORS.lightBorder,
        borderStrong: darkMode ? COLORS.darkBorderStrong : COLORS.lightBorderStrong,
        inputBg: darkMode ? 'rgba(255,255,255,0.05)' : COLORS.lightCard,
        pillDefault: darkMode ? 'rgba(255,255,255,0.06)' : COLORS.lightCard,
        overlay: darkMode ? COLORS.darkOverlay : 'rgba(255,255,255,0.8)',
        shadow: darkMode ? '#000' : COLORS.textDark,
        shadowOpacity: darkMode ? 0.25 : 0.06,
        statusBar: darkMode ? ('light-content' as const) : ('dark-content' as const),
        backBtnBg: darkMode ? 'rgba(11,15,25,0.65)' : 'rgba(255,255,255,0.85)',
        detailBlockBg: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        detailBlockBorder: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
        badgeBg: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
        watchlistBg: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    }), [darkMode]);

    const onToggleTheme = useCallback(() => {
        dispatch(toggleTheme());
    }, [dispatch]);

    return { darkMode, colors, onToggleTheme };
};
