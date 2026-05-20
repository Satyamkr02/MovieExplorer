import React, { memo } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { COLORS, RADII, SPACING } from '../utils/theme';

interface Props {
    message: string;
    onRetry?: () => void;
}

/**
 * ErrorView — A full-screen error state with an optional Retry CTA.
 * Uses the active theme for background and text colors.
 */
const ErrorView = memo(({ message, onRetry }: Props) => {
    const { colors } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={[styles.title, { color: colors.text }]}>Oops!</Text>
            <Text style={[styles.message, { color: colors.subText }]}>{message}</Text>
            {onRetry && (
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.retryButton}
                    onPress={onRetry}
                    accessibilityRole="button"
                    accessibilityLabel="Retry loading"
                >
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
});

ErrorView.displayName = 'ErrorView';
export default ErrorView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xxl,
    },

    icon: {
        fontSize: 52,
        marginBottom: SPACING.base,
    },

    title: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: SPACING.sm,
    },

    message: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },

    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: RADII.md,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },

    retryText: {
        color: COLORS.textWhite,
        fontSize: 15,
        fontWeight: '700',
    },
});