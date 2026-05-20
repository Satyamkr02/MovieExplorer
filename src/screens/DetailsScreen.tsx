import React, { memo, useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { IMAGE_BASE_URL } from '../utils/constants';
import { COLORS, RADII, SPACING } from '../utils/theme';
import { useTheme } from '../hooks/useTheme';
import { getBestTrailerUrl, getMovieVideos } from '../api/movieApi';
import TrailerModal from '../components/TrailerModal';
import { toggleWatchlist } from '../redux/slices/watchlistSlice';
import { RootState, AppDispatch } from '../redux/store';

const { width, height } = Dimensions.get('window');
const POSTER_HEIGHT = height * 0.62;
const GRADIENT_STEPS = 70;

// ─── Pure-JS Gradient ─────────────────────────────────────────────────────────

const SmoothFade = memo(
    ({
        color,
        gradientHeight = 160,
        steps = GRADIENT_STEPS,
    }: {
        color: string;
        gradientHeight?: number;
        steps?: number;
    }) => (
        <View
            style={[styles.gradientContainer, { height: gradientHeight }]}
            pointerEvents="none"
        >
            {Array.from({ length: steps }).map((_, i) => (
                <View
                    key={i}
                    style={{
                        height: gradientHeight / steps,
                        backgroundColor: color,
                        opacity: i / steps,
                    }}
                />
            ))}
        </View>
    ),
);
SmoothFade.displayName = 'SmoothFade';

// ─── Detail Row ───────────────────────────────────────────────────────────────

const DetailRow = memo(
    ({
        label,
        value,
        textColor,
        labelColor,
    }: {
        label: string;
        value: string;
        textColor: string;
        labelColor: string;
    }) => (
        <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: labelColor }]}>{label}</Text>
            <Text style={[styles.detailValue, { color: textColor }]}>{value}</Text>
        </View>
    ),
);
DetailRow.displayName = 'DetailRow';

// ─── Screen ───────────────────────────────────────────────────────────────────

const DetailsScreen = ({ route, navigation }: any) => {
    const { movie } = route.params;
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    // ── Trailer state ──────────────────────────────────────────────────────────
    const [trailerLoading, setTrailerLoading] = useState(false);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // ── Watchlist state ────────────────────────────────────────────────────────
    const dispatch = useDispatch<AppDispatch>();
    const inWatchlist = useSelector(
        (state: RootState) => state.watchlist.items.some(m => m.id === movie.id),
    );
    const heartScale = useRef(new Animated.Value(1)).current;

    const handleToggleWatchlist = useCallback(() => {
        // Pop animation on heart
        Animated.sequence([
            Animated.spring(heartScale, { toValue: 1.35, useNativeDriver: true, speed: 80, bounciness: 12 }),
            Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 60, bounciness: 8 }),
        ]).start();
        dispatch(toggleWatchlist(movie));
    }, [dispatch, movie, heartScale]);

    /**
     * 1. Fetch TMDB video list for this movie
     * 2. Open TrailerModal with embedded YouTube player
     * 3. If WebView fails → Linking fallback to YouTube app / browser
     */
    const handleWatchTrailer = useCallback(async () => {
        if (trailerLoading) { return; }
        setTrailerLoading(true);
        try {
            const data = await getMovieVideos(movie.id);
            const url = getBestTrailerUrl(data.results);

            if (!url) {
                Alert.alert(
                    'No Trailer Found',
                    `No trailer is available for "${movie.title}" yet.`,
                    [{ text: 'OK' }],
                );
                return;
            }

            const key = url.split('v=')[1];
            setTrailerKey(key);
            setModalVisible(true);
        } catch (_err) {
            Alert.alert(
                'Error',
                'Failed to load trailer. Please check your connection.',
                [{ text: 'OK' }],
            );
        } finally {
            setTrailerLoading(false);
        }
    }, [movie.id, movie.title, trailerLoading]);

    /** Called by TrailerModal when WebView itself errors → open in YouTube */
    const handleWebViewFail = useCallback(async () => {
        setModalVisible(false);
        if (!trailerKey) { return; }
        const fallbackUrl = `https://www.youtube.com/watch?v=${trailerKey}`;
        try {
            await Linking.openURL(fallbackUrl);
        } catch {
            Alert.alert('Error', 'Unable to open YouTube. Please try again.');
        }
    }, [trailerKey]);

    const handleCloseModal = useCallback(() => {
        setModalVisible(false);
    }, []);

    // ── Derived values ─────────────────────────────────────────────────────────
    const releaseYear = movie.release_date
        ? movie.release_date.split('-')[0]
        : 'Unknown';

    const posterUri = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : null;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />

            {/* ── Floating back button ───────────────────────────────────── */}
            <TouchableOpacity
                activeOpacity={0.85}
                style={[
                    styles.backBtn,
                    {
                        top: Math.max(insets.top + 8, 20),
                        backgroundColor: colors.backBtnBg,
                        borderColor: colors.borderStrong,
                    },
                ]}
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
            >
                <Text style={[styles.backBtnText, { color: colors.text }]}>←</Text>
            </TouchableOpacity>

            {/* ── Floating heart button — top right ─────────────────── */}
            <TouchableOpacity
                activeOpacity={0.82}
                style={[
                    styles.heartFloatBtn,
                    {
                        top: Math.max(insets.top + 8, 20),
                        backgroundColor: inWatchlist
                            ? '#E53935'                        // solid red when saved
                            : 'rgba(0, 0, 0, 0.52)',          // dark frosted glass — visible on any poster
                        borderColor: inWatchlist
                            ? 'rgba(255, 255, 255, 0.30)'     // white rim on red
                            : 'rgba(255, 255, 255, 0.22)',    // subtle white rim on dark glass
                        shadowColor: inWatchlist
                            ? '#E53935'                       // red glow when saved
                            : '#000000',                      // dark halo always
                        shadowOpacity: inWatchlist ? 0.55 : 0.45,
                    },
                ]}
                onPress={handleToggleWatchlist}
                accessibilityRole="button"
                accessibilityLabel={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
                {/* Outer ring for extra contrast against light backgrounds */}
                <View style={[
                    styles.heartRing,
                    {
                        borderColor: inWatchlist
                            ? 'transparent'
                            : 'rgba(0,0,0,0.18)',
                    },
                ]} />

                <Animated.Text
                    style={[
                        styles.heartFloatIcon,
                        { transform: [{ scale: heartScale }] },
                    ]}
                >
                    {inWatchlist ? '♥' : '♡'}
                </Animated.Text>
            </TouchableOpacity>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces
            >
                {/* ── Hero Poster ───────────────────────────────────────── */}
                <View style={styles.posterContainer}>
                    {posterUri ? (
                        <Image
                            source={{ uri: posterUri }}
                            style={styles.poster}
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            style={[
                                styles.posterPlaceholder,
                                { backgroundColor: colors.surface },
                            ]}
                        >
                            <Text style={styles.posterPlaceholderText}>🎬</Text>
                        </View>
                    )}
                    <SmoothFade
                        color={colors.background}
                        gradientHeight={180}
                        steps={GRADIENT_STEPS}
                    />
                </View>

                {/* ── Content Card ──────────────────────────────────────── */}
                <View
                    style={[
                        styles.contentCard,
                        { backgroundColor: colors.background },
                    ]}
                >
                    <Text style={styles.yearLabel}>{releaseYear}</Text>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {movie.title}
                    </Text>

                    {/* Badge row */}
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, styles.ratingBadge]}>
                            <Text style={styles.ratingText}>
                                ⭐ {(movie.vote_average ?? 0).toFixed(1)}
                            </Text>
                        </View>
                        {[
                            { label: '4K UHD', icon: '🎥' },
                            { label: 'HDR10', icon: '✨' },
                            { label: 'Dolby 5.1', icon: '🔊' },
                        ].map(b => (
                            <View
                                key={b.label}
                                style={[
                                    styles.badge,
                                    {
                                        backgroundColor: colors.badgeBg,
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <Text
                                    style={[styles.badgeText, { color: colors.subText }]}
                                >
                                    {b.icon} {b.label}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* ── Action Buttons ─────────────────────────────────── */}
                    <View style={styles.actionRow}>
                        {/* Watch Trailer — now functional */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[
                                styles.playBtn,
                                trailerLoading && styles.playBtnLoading,
                            ]}
                            onPress={handleWatchTrailer}
                            disabled={trailerLoading}
                            accessibilityRole="button"
                            accessibilityLabel="Watch trailer"
                        >
                            {trailerLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.playBtnText}>▶  Watch Trailer</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View
                        style={[styles.divider, { backgroundColor: colors.border }]}
                    />

                    {/* Storyline */}
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Storyline
                    </Text>
                    <Text style={[styles.overview, { color: colors.subText }]}>
                        {movie.overview || 'No description available for this title.'}
                    </Text>

                    {/* Metadata */}
                    <View
                        style={[
                            styles.detailBlock,
                            {
                                backgroundColor: colors.detailBlockBg,
                                borderColor: colors.detailBlockBorder,
                            },
                        ]}
                    >
                        <DetailRow
                            label="Release Date"
                            value={movie.release_date || 'Unknown'}
                            textColor={colors.text}
                            labelColor={colors.subText}
                        />
                        <View
                            style={[
                                styles.detailRowDivider,
                                { backgroundColor: colors.border },
                            ]}
                        />
                        <DetailRow
                            label="Score"
                            value={`${(movie.vote_average ?? 0).toFixed(1)} / 10`}
                            textColor={COLORS.gold}
                            labelColor={colors.subText}
                        />
                        <View
                            style={[
                                styles.detailRowDivider,
                                { backgroundColor: colors.border },
                            ]}
                        />
                        <DetailRow
                            label="Languages"
                            value="English · Spanish · French"
                            textColor={colors.text}
                            labelColor={colors.subText}
                        />
                        <View
                            style={[
                                styles.detailRowDivider,
                                { backgroundColor: colors.border },
                            ]}
                        />
                        <DetailRow
                            label="Format"
                            value="4K Ultra HD · HDR10"
                            textColor={colors.text}
                            labelColor={colors.subText}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* ── Trailer Modal ──────────────────────────────────────────── */}
            <TrailerModal
                visible={modalVisible}
                videoKey={trailerKey}
                movieTitle={movie.title}
                onClose={handleCloseModal}
                onWebViewFail={handleWebViewFail}
            />
        </View>
    );
};

export default DetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: SPACING.xxxl + 20,
    },

    // ── Back button ───────────────────────────────────────────────────────────
    backBtn: {
        position: 'absolute',
        left: SPACING.base,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },

    backBtnText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: -2,
    },

    // Floating heart button
    heartFloatBtn: {
        position: 'absolute',
        right: SPACING.base,
        zIndex: 10,
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        // Multi-layer shadow: spread for contrast on any background
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 10,
    },

    // Invisible extra ring for contrast on very light backgrounds
    heartRing: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
    },

    heartFloatIcon: {
        fontSize: 22,
        color: '#FFFFFF',          // always white — controlled by backgroundColor
        fontWeight: '700',
        lineHeight: 26,
        textShadowColor: 'rgba(0,0,0,0.35)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },

    // ── Poster ────────────────────────────────────────────────────────────────
    posterContainer: {
        width,
        height: POSTER_HEIGHT,
        position: 'relative',
    },

    poster: {
        width: '100%',
        height: '100%',
    },

    posterPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    posterPlaceholderText: {
        fontSize: 64,
    },

    gradientContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2,
    },

    // ── Content ───────────────────────────────────────────────────────────────
    contentCard: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
        marginTop: -44,
        borderTopLeftRadius: RADII.xxl,
        borderTopRightRadius: RADII.xxl,
        zIndex: 3,
    },

    yearLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: SPACING.sm,
    },

    title: {
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 36,
        letterSpacing: -0.4,
    },

    // ── Badges ────────────────────────────────────────────────────────────────
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: SPACING.md,
    },

    badge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADII.sm,
        borderWidth: 1,
    },

    ratingBadge: {
        backgroundColor: COLORS.goldDim,
        borderColor: COLORS.goldBorder,
    },

    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.gold,
    },

    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // ── Actions ───────────────────────────────────────────────────────────────
    actionRow: {
        flexDirection: 'row',
        marginTop: SPACING.xl,
        gap: SPACING.md,
    },

    playBtn: {
        flex: 1,
        height: 50,
        backgroundColor: COLORS.primary,
        borderRadius: RADII.md,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 5,
    },

    playBtnLoading: {
        opacity: 0.75,
    },

    playBtnText: {
        color: COLORS.textWhite,
        fontSize: 15,
        fontWeight: '700',
    },

    // ── Divider ───────────────────────────────────────────────────────────────
    divider: {
        height: 1,
        marginVertical: SPACING.xl,
    },

    // ── Story ─────────────────────────────────────────────────────────────────
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: SPACING.sm,
    },

    overview: {
        fontSize: 15,
        lineHeight: 26,
    },

    // ── Detail Block ──────────────────────────────────────────────────────────
    detailBlock: {
        marginTop: SPACING.xl,
        borderRadius: RADII.lg,
        borderWidth: 1,
        overflow: 'hidden',
    },

    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
    },

    detailRowDivider: {
        height: 1,
        marginHorizontal: SPACING.base,
    },

    detailLabel: {
        fontSize: 13,
        fontWeight: '500',
    },

    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        maxWidth: '55%',
        textAlign: 'right',
    },
});