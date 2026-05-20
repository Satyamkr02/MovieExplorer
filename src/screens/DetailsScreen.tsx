import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { IMAGE_BASE_URL } from '../utils/constants';
import { RootState } from '../redux/store';

const { width, height } = Dimensions.get('window');

// Custom JS-based Linear Gradient to avoid native dependencies
const SmoothGradient = ({ color, height = 150, steps = 60 }: { color: string; height?: number; steps?: number }) => {
    return (
        <View style={[styles.gradientContainer, { height }]}>
            {Array.from({ length: steps }).map((_, i) => (
                <View
                    key={i}
                    style={{
                        height: height / steps,
                        backgroundColor: color,
                        opacity: i / steps,
                    }}
                />
            ))}
        </View>
    );
};

const DetailsScreen = ({ route, navigation }: any) => {
    const { movie } = route.params;
    const insets = useSafeAreaInsets();
    const darkMode = useSelector((state: RootState) => state.theme.darkMode);

    const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';

    // Theme values
    const bgColor = darkMode ? '#0B0F19' : '#F3F4F6';
    const cardBgColor = darkMode ? '#0B0F19' : '#F3F4F6';
    const textColor = darkMode ? '#FFFFFF' : '#1F2937';
    const descColor = darkMode ? '#9CA3AF' : '#4B5563';
    const backBtnBg = darkMode ? 'rgba(11, 15, 25, 0.6)' : 'rgba(255, 255, 255, 0.8)';
    const backBtnBorder = darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
    const backBtnText = darkMode ? '#FFFFFF' : '#1F2937';
    const badgeBg = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    const badgeBorder = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    const badgeText = darkMode ? '#9CA3AF' : '#4B5563';
    const watchlistBg = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
    const watchlistBorder = darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';
    const watchlistText = darkMode ? '#FFFFFF' : '#1F2937';
    const dividerBg = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';
    const detailsBg = darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
    const detailsBorder = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
    const detailValColor = darkMode ? '#D1D5DB' : '#1F2937';

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            {/* Make the status bar translucent so the poster shows behind it smoothly */}
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle={darkMode ? 'light-content' : 'dark-content'}
            />

            {/* Custom Floating Back Button - Safe Area Aware */}
            <TouchableOpacity
                activeOpacity={0.8}
                style={[
                    styles.backButton,
                    {
                        top: Math.max(insets.top, 16),
                        backgroundColor: backBtnBg,
                        borderColor: backBtnBorder,
                    },
                ]}
                onPress={() => navigation.goBack()}
            >
                <Text style={[styles.backButtonText, { color: backBtnText }]}>←</Text>
            </TouchableOpacity>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Poster Container */}
                <View style={styles.posterContainer}>
                    <Image
                        source={{
                            uri: `${IMAGE_BASE_URL}${movie.poster_path}`,
                        }}
                        style={styles.poster}
                        resizeMode="cover"
                    />
                    {/* Smooth fading gradient at the bottom of the poster image */}
                    <SmoothGradient color={bgColor} height={160} steps={80} />
                </View>

                {/* Overlapping Curved Content Card */}
                <View style={[styles.contentContainer, { backgroundColor: cardBgColor }]}>
                    {/* Release Year & Title */}
                    <Text style={styles.releaseYear}>{releaseYear}</Text>
                    <Text style={[styles.title, { color: textColor }]}>{movie.title}</Text>

                    {/* Premium Streaming Badges */}
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, styles.ratingBadge]}>
                            <Text style={styles.ratingBadgeText}>
                                ⭐ {movie.vote_average?.toFixed(1)}
                            </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                            <Text style={[styles.badgeText, { color: badgeText }]}>4K Ultra HD</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                            <Text style={[styles.badgeText, { color: badgeText }]}>HDR</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                            <Text style={[styles.badgeText, { color: badgeText }]}>5.1 Audio</Text>
                        </View>
                    </View>

                    {/* Interactive Streaming Buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.playButton}
                            onPress={() => console.log('Play Trailer')}
                        >
                            <Text style={styles.playButtonText}>▶  Watch Trailer</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                                styles.watchlistButton,
                                {
                                    backgroundColor: watchlistBg,
                                    borderColor: watchlistBorder,
                                },
                            ]}
                            onPress={() => console.log('Added to Watchlist')}
                        >
                            <Text style={[styles.watchlistButtonText, { color: watchlistText }]}>+  Watchlist</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Metadata Divider */}
                    <View style={[styles.divider, { backgroundColor: dividerBg }]} />

                    {/* Overview */}
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Storyline</Text>
                    <Text style={[styles.description, { color: descColor }]}>
                        {movie.overview || 'No description available for this movie.'}
                    </Text>

                    {/* Additional Details to make the UI look rich */}
                    <View style={[styles.additionalDetails, { backgroundColor: detailsBg, borderColor: detailsBorder }]}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Released</Text>
                            <Text style={[styles.detailValue, { color: detailValColor }]}>{movie.release_date || 'Unknown'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Audio Tracks</Text>
                            <Text style={[styles.detailValue, { color: detailValColor }]}>English, Spanish, French</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default DetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0F19', // Premium cinematic deep dark theme
    },

    scrollContent: {
        paddingBottom: 60,
    },

    backButton: {
        position: 'absolute',
        left: 16,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(11, 15, 25, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },

    backButtonText: {
        fontSize: 22,
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginTop: -2, // Optical alignment
    },

    posterContainer: {
        width: width,
        height: height * 0.65, // Takes 65% of screen height for cinematic impact
        position: 'relative',
    },

    poster: {
        width: '100%',
        height: '100%',
    },

    gradientContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2,
    },

    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        marginTop: -40, // Elegant overlap over the poster
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        backgroundColor: '#0B0F19',
        zIndex: 3,
    },

    releaseYear: {
        fontSize: 14,
        fontWeight: '700',
        color: '#E11D48', // Cinema Red accent
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 6,
    },

    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#FFFFFF',
        lineHeight: 38,
        letterSpacing: -0.5,
    },

    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        gap: 8,
        flexWrap: 'wrap',
    },

    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },

    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
    },

    ratingBadge: {
        backgroundColor: 'rgba(251, 191, 36, 0.15)', // Golden glow
        borderColor: 'rgba(251, 191, 36, 0.3)',
    },

    ratingBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FBBF24', // Gold text
    },

    actionRow: {
        flexDirection: 'row',
        marginTop: 24,
        gap: 12,
    },

    playButton: {
        flex: 1.3,
        height: 50,
        backgroundColor: '#E11D48',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#E11D48',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },

    playButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    watchlistButton: {
        flex: 1,
        height: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },

    watchlistButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },

    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginVertical: 24,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 10,
    },

    description: {
        fontSize: 15,
        lineHeight: 26,
        color: '#9CA3AF', // Silver grey for high dark-mode readability
    },

    additionalDetails: {
        marginTop: 28,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        gap: 12,
    },

    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },

    detailValue: {
        fontSize: 14,
        color: '#D1D5DB',
        fontWeight: '600',
    },
});