import React, { useMemo } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { toggleTheme } from '../redux/slices/themeSlice';
import { AppDispatch, RootState } from '../redux/store';

const SettingsScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const darkMode = useSelector((state: RootState) => state.theme.darkMode);
    const insets = useSafeAreaInsets();

    const colors = useMemo(() => {
        return {
            background: darkMode ? '#0B0F19' : '#F3F4F6',
            cardBg: darkMode ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)',
            text: darkMode ? '#FFFFFF' : '#1F2937',
            subText: darkMode ? '#9CA3AF' : '#4B5563',
            backBtnBg: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
            backBtnBorder: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
            rowBg: darkMode ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF',
        };
    }, [darkMode]);

    const renderItem = (label: string, value?: string, action?: () => void) => {
        return (
            <TouchableOpacity
                activeOpacity={action ? 0.7 : 1}
                onPress={action}
                style={[
                    styles.settingRow,
                    {
                        backgroundColor: colors.rowBg,
                        borderColor: colors.borderColor,
                    },
                ]}
            >
                <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
                {value && <Text style={[styles.settingValue, { color: colors.subText }]}>{value}</Text>}
                {action && !value && <Text style={styles.arrowIcon}>›</Text>}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <StatusBar
                barStyle={darkMode ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />

            {/* Custom Header Bar */}
            <View style={styles.header}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                        styles.backButton,
                        {
                            backgroundColor: colors.backBtnBg,
                            borderColor: colors.backBtnBorder,
                        },
                    ]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Card */}
                <View style={[styles.profileCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarEmoji}>👤</Text>
                    </View>
                    <Text style={[styles.profileName, { color: colors.text }]}>Satyam Kumar</Text>
                    <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>PRO MEMBER</Text>
                    </View>
                    <Text style={[styles.profileEmail, { color: colors.subText }]}>satyamkumar@example.com</Text>
                </View>

                {/* Appearance Section */}
                <Text style={[styles.sectionTitle, { color: colors.subText }]}>Appearance</Text>
                <View style={[styles.sectionBlock, { borderColor: colors.borderColor }]}>
                    <View
                        style={[
                            styles.themeRow,
                            {
                                backgroundColor: colors.rowBg,
                                borderColor: colors.borderColor,
                            },
                        ]}
                    >
                        <Text style={[styles.settingLabel, { color: colors.text }]}>Theme Mode</Text>
                        <View style={styles.themeSelector}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.themeOption,
                                    !darkMode && styles.themeOptionSelected,
                                ]}
                                onPress={() => {
                                    if (darkMode) dispatch(toggleTheme());
                                }}
                            >
                                <Text style={[styles.themeOptionText, { color: !darkMode ? '#FFFFFF' : colors.subText }]}>
                                    ☀ Light
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.themeOption,
                                    darkMode && styles.themeOptionSelected,
                                ]}
                                onPress={() => {
                                    if (!darkMode) dispatch(toggleTheme());
                                }}
                            >
                                <Text style={[styles.themeOptionText, { color: darkMode ? '#FFFFFF' : colors.subText }]}>
                                    ☾ Dark
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Preferences Section */}
                <Text style={[styles.sectionTitle, { color: colors.subText }]}>Preferences</Text>
                <View style={[styles.sectionBlock, { borderColor: colors.borderColor }]}>
                    {renderItem('Offline Mode', 'Disabled', () => console.log('Offline Mode'))}
                    {renderItem('Video Playback Quality', 'Auto (4K UHD)', () => console.log('Playback quality'))}
                    {renderItem('Language', 'English', () => console.log('Language'))}
                </View>

                {/* Support & Legal Section */}
                <Text style={[styles.sectionTitle, { color: colors.subText }]}>Support & About</Text>
                <View style={[styles.sectionBlock, { borderColor: colors.borderColor }]}>
                    {renderItem('Help Center', undefined, () => console.log('Help'))}
                    {renderItem('Privacy Policy', undefined, () => console.log('Privacy'))}
                    {renderItem('About Movie Explorer', 'v1.0.0', () => console.log('About'))}
                </View>
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
        paddingHorizontal: 16,
        paddingBottom: 40,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 16,
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    backButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },

    profileCard: {
        alignItems: 'center',
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
        marginTop: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 2,
    },

    avatarContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(225, 29, 72, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },

    avatarEmoji: {
        fontSize: 34,
    },

    profileName: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.3,
    },

    proBadge: {
        backgroundColor: '#E11D48',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 6,
        marginBottom: 8,
    },

    proBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    profileEmail: {
        fontSize: 13,
        fontWeight: '500',
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginLeft: 4,
        marginBottom: 8,
    },

    sectionBlock: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 24,
    },

    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.02)',
    },

    themeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    settingLabel: {
        fontSize: 15,
        fontWeight: '600',
    },

    settingValue: {
        fontSize: 14,
        fontWeight: '600',
    },

    arrowIcon: {
        fontSize: 18,
        color: '#9CA3AF',
        fontWeight: '500',
    },

    themeSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 10,
        padding: 4,
        width: 160,
    },

    themeOption: {
        flex: 1,
        paddingVertical: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 7,
    },

    themeOptionSelected: {
        backgroundColor: '#E11D48',
    },

    themeOptionText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
