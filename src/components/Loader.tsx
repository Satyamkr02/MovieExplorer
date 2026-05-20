import React, { memo } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING } from '../utils/theme';

/**
 * Loader — Full-screen premium loading indicator shown during initial fetches.
 */
const Loader = memo(() => {
    const { colors } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={styles.icon}>🎬</Text>
            <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={styles.indicator}
            />
            <Text style={[styles.label, { color: colors.subText }]}>
                Loading movies...
            </Text>
        </View>
    );
});

Loader.displayName = 'Loader';
export default Loader;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    icon: {
        fontSize: 48,
        marginBottom: SPACING.base,
    },

    indicator: {
        marginVertical: SPACING.base,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
});