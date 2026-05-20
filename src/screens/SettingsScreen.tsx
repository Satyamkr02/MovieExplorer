import React, { useCallback, useMemo } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { useTheme } from '../hooks/useTheme';
import { COLORS, RADII, SPACING } from '../utils/theme';
import { RootState } from '../redux/store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingItem {
    id: string;
    label: string;
    description?: string;
    value?: string;
    isToggle?: boolean;
    toggleValue?: boolean;
    onToggle?: (val: boolean) => void;
    onPress?: () => void;
    destructive?: boolean;
}

// ─── Sub-Component: Row ───────────────────────────────────────────────────────

const SettingRow = ({
    item,
    colors,
}: {
    item: SettingItem;
    colors: any;
}) => (
    <TouchableOpacity
        activeOpacity={item.onPress || item.isToggle ? 0.7 : 1}
        onPress={item.onPress}
        style={[
            styles.row,
            {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
            },
        ]}
        accessibilityRole={item.isToggle ? 'switch' : 'button'}
        accessibilityLabel={item.label}
    >
        <View style={styles.rowLeft}>
            <Text style={[styles.rowLabel, { color: item.destructive ? COLORS.primary : colors.text }]}>
                {item.label}
            </Text>
            {item.description && (
                <Text style={[styles.rowDesc, { color: colors.subText }]}>
                    {item.description}
                </Text>
            )}
        </View>
        {item.isToggle && item.onToggle ? (
            <Switch
                value={item.toggleValue}
                onValueChange={item.onToggle}
                trackColor={{ false: colors.surface, true: COLORS.primaryDim }}
                thumbColor={item.toggleValue ? COLORS.primary : colors.subText}
                ios_backgroundColor={colors.surface}
            />
        ) : item.value ? (
            <Text style={[styles.rowValue, { color: colors.subText }]}>
                {item.value}
            </Text>
        ) : item.onPress ? (
            <Text style={[styles.rowChevron, { color: colors.subText }]}>›</Text>
        ) : null}
    </TouchableOpacity>
);

// ─── Sub-Component: Section ───────────────────────────────────────────────────

const SettingSection = ({
    title,
    items,
    colors,
}: {
    title: string;
    items: SettingItem[];
    colors: any;
}) => (
    <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>{title}</Text>
        <View style={[styles.sectionBlock, { borderColor: colors.border }]}>
            {items.map((item, i) => (
                <View key={item.id}>
                    <SettingRow item={item} colors={colors} />
                    {i < items.length - 1 && (
                        <View
                            style={[styles.rowSeparator, { backgroundColor: colors.border }]}
                        />
                    )}
                </View>
            ))}
        </View>
    </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const SettingsScreen = ({ navigation }: any) => {
    const { darkMode, colors, onToggleTheme } = useTheme();
    const watchlistCount = useSelector(
        (state: RootState) => state.watchlist.items.length,
    );

    const libraryItems: SettingItem[] = useMemo(
        () => [
            {
                id: 'watchlist',
                label: 'My Watchlist',
                description: 'Movies you\'ve saved to watch later',
                value: watchlistCount > 0 ? `${watchlistCount} movies` : 'Empty',
                onPress: () => navigation.navigate('Watchlist'),
            },
        ],
        [watchlistCount, navigation],
    );

    const appearanceItems: SettingItem[] = useMemo(
        () => [
            {
                id: 'dark-mode',
                label: 'Dark Mode',
                description: 'Switch between cinematic dark and clean light theme',
                isToggle: true,
                toggleValue: darkMode,
                onToggle: () => onToggleTheme(),
            },
        ],
        [darkMode, onToggleTheme],
    );

    const preferencesItems: SettingItem[] = useMemo(
        () => [
            {
                id: 'quality',
                label: 'Video Quality',
                value: 'Auto (4K)',
                onPress: () => {},
            },
            {
                id: 'lang',
                label: 'Language',
                value: 'English',
                onPress: () => {},
            },
            {
                id: 'notifications',
                label: 'Push Notifications',
                isToggle: true,
                toggleValue: true,
                onToggle: () => {},
            },
        ],
        [],
    );

    const supportItems: SettingItem[] = useMemo(
        () => [
            {
                id: 'help',
                label: 'Help & Support',
                onPress: () => {},
            },
            {
                id: 'privacy',
                label: 'Privacy Policy',
                onPress: () => {},
            },
            {
                id: 'terms',
                label: 'Terms of Service',
                onPress: () => {},
            },
            {
                id: 'about',
                label: 'About Movie Explorer',
                value: 'v1.0.0',
            },
        ],
        [],
    );

    const accountItems: SettingItem[] = useMemo(
        () => [
            {
                id: 'logout',
                label: 'Sign Out',
                destructive: true,
                onPress: () => {},
            },
        ],
        [],
    );

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={['top', 'left', 'right']}
        >
            <StatusBar
                barStyle={darkMode ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                        styles.backBtn,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                        },
                    ]}
                    onPress={handleBack}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Text style={[styles.backBtnText, { color: colors.text }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Card */}
                <View
                    style={[
                        styles.profileCard,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <View style={styles.avatarRing}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarEmoji}>👤</Text>
                        </View>
                    </View>
                    <Text style={[styles.profileName, { color: colors.text }]}>
                        Satyam Kumar
                    </Text>
                    <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>⚡ PRO MEMBER</Text>
                    </View>
                    <Text style={[styles.profileEmail, { color: colors.subText }]}>
                        satyamkumar@example.com
                    </Text>

                    {/* Stats row */}
                    <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
                        {[
                            { label: 'Watched', value: '142' },
                            { label: 'Watchlist', value: '38' },
                            { label: 'Reviews', value: '19' },
                        ].map((stat, i) => (
                            <View key={stat.label} style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {stat.value}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.subText }]}>
                                    {stat.label}
                                </Text>
                                {i < 2 && (
                                    <View
                                        style={[
                                            styles.statDivider,
                                            { backgroundColor: colors.border },
                                        ]}
                                    />
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                <SettingSection
                    title="LIBRARY"
                    items={libraryItems}
                    colors={colors}
                />
                <SettingSection
                    title="APPEARANCE"
                    items={appearanceItems}
                    colors={colors}
                />
                <SettingSection
                    title="PREFERENCES"
                    items={preferencesItems}
                    colors={colors}
                />
                <SettingSection
                    title="SUPPORT & LEGAL"
                    items={supportItems}
                    colors={colors}
                />
                <SettingSection
                    title="ACCOUNT"
                    items={accountItems}
                    colors={colors}
                />

                <Text style={[styles.versionNote, { color: colors.subText }]}>
                    Movie Explorer • Built with ❤️ in React Native
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: SPACING.base,
        paddingBottom: SPACING.xxxl,
    },

    // ── Header ────────────────────────────────────────────────────────────────

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: SPACING.base,
        borderBottomWidth: 1,
    },

    backBtn: {
        width: 40,
        height: 40,
        borderRadius: RADII.md,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    backBtnText: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.4,
    },

    headerSpacer: {
        width: 40,
    },

    // ── Profile Card ──────────────────────────────────────────────────────────

    profileCard: {
        borderRadius: RADII.xxl,
        borderWidth: 1,
        alignItems: 'center',
        marginTop: SPACING.xl,
        marginBottom: SPACING.base,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },

    avatarRing: {
        marginTop: SPACING.xl,
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },

    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.primaryDim,
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarEmoji: {
        fontSize: 32,
    },

    profileName: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.3,
    },

    proBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADII.sm,
        marginTop: SPACING.sm,
        marginBottom: SPACING.sm,
    },

    proBadgeText: {
        color: COLORS.textWhite,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    profileEmail: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: SPACING.lg,
    },

    statsRow: {
        flexDirection: 'row',
        width: '100%',
        borderTopWidth: 1,
    },

    statItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.base,
        position: 'relative',
    },

    statValue: {
        fontSize: 20,
        fontWeight: '800',
    },

    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },

    statDivider: {
        position: 'absolute',
        right: 0,
        top: '20%',
        bottom: '20%',
        width: 1,
    },

    // ── Sections ──────────────────────────────────────────────────────────────

    section: {
        marginBottom: SPACING.lg,
    },

    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.3,
        marginBottom: SPACING.sm,
        marginLeft: SPACING.xs,
    },

    sectionBlock: {
        borderRadius: RADII.xl,
        borderWidth: 1,
        overflow: 'hidden',
    },

    // ── Rows ──────────────────────────────────────────────────────────────────

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
    },

    rowLeft: {
        flex: 1,
        marginRight: SPACING.sm,
    },

    rowLabel: {
        fontSize: 15,
        fontWeight: '600',
    },

    rowDesc: {
        fontSize: 12,
        marginTop: 2,
        lineHeight: 17,
    },

    rowValue: {
        fontSize: 14,
        fontWeight: '600',
    },

    rowChevron: {
        fontSize: 22,
        fontWeight: '500',
    },

    rowSeparator: {
        height: 1,
        marginLeft: SPACING.base,
    },

    // ── Footer ────────────────────────────────────────────────────────────────

    versionNote: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '500',
        marginTop: SPACING.sm,
        marginBottom: SPACING.base,
    },
});
