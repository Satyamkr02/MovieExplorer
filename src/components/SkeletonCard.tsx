import React, { memo, useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    View,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { RADII, SPACING } from '../utils/theme';

// ─── Pulse block ──────────────────────────────────────────────────────────────

const SkeletonPulse = memo(({ style }: { style: any }) => {
    const { colors } = useTheme();
    const opacity = useRef(new Animated.Value(0.25)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.65,
                    duration: 850,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.25,
                    duration: 850,
                    useNativeDriver: true,
                }),
            ]),
        );
        pulse.start();
        return () => pulse.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[{ backgroundColor: colors.surface, borderRadius: RADII.sm, opacity }, style]}
        />
    );
});
SkeletonPulse.displayName = 'SkeletonPulse';

// ─── Single skeleton card ─────────────────────────────────────────────────────

const SkeletonCard = () => {
    const { colors } = useTheme();
    return (
        <View
            style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
            ]}
        >
            {/* Backdrop image placeholder */}
            <SkeletonPulse style={styles.image} />

            {/* Content */}
            <View style={styles.content}>
                {/* Tags row */}
                <View style={styles.tagsRow}>
                    <SkeletonPulse style={styles.tagPill} />
                    <SkeletonPulse style={styles.tagPill} />
                    <SkeletonPulse style={styles.tagPillSmall} />
                </View>

                {/* Title */}
                <SkeletonPulse style={styles.titleFull} />
                <SkeletonPulse style={styles.titleHalf} />

                {/* Overview */}
                <SkeletonPulse style={styles.textLine} />
                <SkeletonPulse style={styles.textLineShort} />

                {/* Rating bar */}
                <SkeletonPulse style={styles.ratingBar} />

                {/* Action row */}
                <View style={styles.actionRow}>
                    <SkeletonPulse style={styles.actionBtn} />
                    <SkeletonPulse style={styles.actionIcon} />
                </View>
            </View>
        </View>
    );
};

// ─── List of skeleton cards ───────────────────────────────────────────────────

export const SkeletonList = ({ count = 4 }: { count?: number }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </>
);

export default SkeletonCard;

const styles = StyleSheet.create({
    card: {
        marginHorizontal: SPACING.base,
        marginVertical: SPACING.sm + 2,
        borderRadius: RADII.xxl,
        borderWidth: 1,
        overflow: 'hidden',
    },

    // image block
    image: {
        width: '100%',
        height: 195,
        borderRadius: 0,
    },

    // content
    content: {
        paddingHorizontal: SPACING.base,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.base,
        gap: SPACING.sm,
    },

    // tags
    tagsRow: {
        flexDirection: 'row',
        gap: SPACING.xs,
    },

    tagPill: {
        height: 22,
        width: 64,
        borderRadius: RADII.full,
    },

    tagPillSmall: {
        height: 22,
        width: 36,
        borderRadius: RADII.full,
    },

    // title
    titleFull: {
        height: 18,
        width: '88%',
    },

    titleHalf: {
        height: 18,
        width: '55%',
    },

    // text
    textLine: {
        height: 13,
        width: '100%',
    },

    textLineShort: {
        height: 13,
        width: '75%',
    },

    // rating
    ratingBar: {
        height: 3,
        width: '100%',
        borderRadius: 2,
    },

    // actions
    actionRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.xs,
    },

    actionBtn: {
        flex: 1,
        height: 40,
        borderRadius: RADII.md,
    },

    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: RADII.md,
    },
});
