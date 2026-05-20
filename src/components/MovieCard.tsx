import React, { memo, useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { IMAGE_BASE_URL } from '../utils/constants';
import { COLORS, RADII, SPACING } from '../utils/theme';
import { Movie } from '../types/movie';
import { useTheme } from '../hooks/useTheme';
import { getBestTrailerUrl, getMovieVideos } from '../api/movieApi';
import TrailerModal from './TrailerModal';
import { toggleWatchlist } from '../redux/slices/watchlistSlice';
import { RootState, AppDispatch } from '../redux/store';

// ─── Config ───────────────────────────────────────────────────────────────────

interface Props {
    movie: Movie;
    onPress: () => void;
}

const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w780';
const IMAGE_H = 190;
const FADE_STEPS = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ratingColor = (v: number) =>
    v >= 7.5 ? '#22C55E' : v >= 6.0 ? '#F59E0B' : '#EF4444';

const starsFrom = (v: number) => {
    const n = Math.round((v / 10) * 5);
    return '★'.repeat(n) + '☆'.repeat(5 - n);
};

// ─── Bottom gradient (pure JS — no native LinearGradient needed) ──────────────

const BottomFade = memo(({ bgColor }: { bgColor: string }) => (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1 }} />
        {Array.from({ length: FADE_STEPS }).map((_, i) => (
            <View
                key={i}
                style={{
                    height: 90 / FADE_STEPS,
                    backgroundColor: bgColor,
                    opacity: (i + 1) / FADE_STEPS,
                }}
            />
        ))}
    </View>
));
BottomFade.displayName = 'BottomFade';

// ─── Stars row ────────────────────────────────────────────────────────────────

const Stars = memo(({ score, color }: { score: number; color: string }) => (
    <Text style={[starStyles.text, { color }]}>{starsFrom(score)}</Text>
));
Stars.displayName = 'Stars';

const starStyles = StyleSheet.create({
    text: { fontSize: 12, letterSpacing: 2 },
});

// ─── Rating bar ───────────────────────────────────────────────────────────────

const RatingBar = memo(({ score, color }: { score: number; color: string }) => (
    <View style={barStyles.track}>
        <View
            style={[
                barStyles.fill,
                {
                    width: `${Math.min((score / 10) * 100, 100)}%` as `${number}%`,
                    backgroundColor: color,
                },
            ]}
        />
    </View>
));
RatingBar.displayName = 'RatingBar';

const barStyles = StyleSheet.create({
    track: {
        flex: 1,
        height: 3,
        borderRadius: 2,
        backgroundColor: 'rgba(150,150,150,0.18)',
        overflow: 'hidden',
    },
    fill: { height: '100%', borderRadius: 2 },
});

// ─── Main Card ────────────────────────────────────────────────────────────────

const MovieCard = memo(({ movie, onPress }: Props) => {
    const { colors, darkMode } = useTheme();
    const dispatch = useDispatch<AppDispatch>();

    // ── Animation ─────────────────────────────────────────────────────────────
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const onPressIn = useCallback(() => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 80, bounciness: 2 }),
            Animated.timing(opacity, { toValue: 0.88, duration: 60, useNativeDriver: true }),
        ]).start();
    }, [scale, opacity]);

    const onPressOut = useCallback(() => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }),
            Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
    }, [scale, opacity]);

    // ── Trailer state ──────────────────────────────────────────────────────────
    const [trailerLoading, setTrailerLoading] = useState(false);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handleWatchTrailer = useCallback(async () => {
        if (trailerLoading) { return; }
        setTrailerLoading(true);
        try {
            const data = await getMovieVideos(movie.id);
            const url = getBestTrailerUrl(data.results);
            if (!url) {
                Alert.alert('No Trailer', `No trailer available for "${movie.title}" yet.`);
                return;
            }
            setTrailerKey(url.split('v=')[1]);
            setModalVisible(true);
        } catch {
            Alert.alert('Error', 'Failed to load trailer. Check your connection.');
        } finally {
            setTrailerLoading(false);
        }
    }, [movie.id, movie.title, trailerLoading]);

    const handleWebViewFail = useCallback(async () => {
        setModalVisible(false);
        if (!trailerKey) { return; }
        try { await Linking.openURL(`https://www.youtube.com/watch?v=${trailerKey}`); }
        catch { Alert.alert('Error', 'Unable to open YouTube.'); }
    }, [trailerKey]);

    // ── Watchlist ──────────────────────────────────────────────────────────────
    const inWatchlist = useSelector(
        (s: RootState) => s.watchlist.items.some(m => m.id === movie.id),
    );
    const heartScale = useRef(new Animated.Value(1)).current;
    const handleWatchlist = useCallback(() => {
        // Spring pop on every tap
        Animated.sequence([
            Animated.spring(heartScale, {
                toValue: 1.38,
                useNativeDriver: true,
                speed: 90,
                bounciness: 14,
            }),
            Animated.spring(heartScale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 60,
                bounciness: 8,
            }),
        ]).start();
        dispatch(toggleWatchlist(movie));
    }, [dispatch, movie, heartScale]);

    // ── Derived values ─────────────────────────────────────────────────────────
    const imageUri = movie.backdrop_path
        ? `${BACKDROP_BASE}${movie.backdrop_path}`
        : movie.poster_path
            ? `${IMAGE_BASE_URL}${movie.poster_path}`
            : null;

    const score = movie.vote_average ?? 0;
    const scoreColor = ratingColor(score);
    const year = movie.release_date?.split('-')[0] ?? '—';
    const lang = (movie.original_language ?? 'en').toUpperCase();
    const isTopRated = score >= 7.5;

    // Theme-aware colours
    const tagBg = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
    const tagBdr = darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

    return (
        <>
            <Animated.View
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        shadowColor: darkMode ? '#000' : '#1a1a2e',
                        shadowOpacity: darkMode ? 0.45 : 0.08,
                        transform: [{ scale }],
                        opacity,
                    },
                ]}
            >
                {/* ══════════════ BACKDROP IMAGE ══════════════ */}
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onPress}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    accessibilityRole="button"
                    accessibilityLabel={`${movie.title}, rated ${score.toFixed(1)}`}
                >
                    <View style={styles.imageSection}>
                        {imageUri ? (
                            <Image
                                source={{ uri: imageUri }}
                                style={styles.backdrop}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.backdropFallback, { backgroundColor: colors.surface }]}>
                                <Text style={styles.fallbackEmoji}>🎬</Text>
                            </View>
                        )}

                        {/* Gradient fade from image into card body */}
                        <BottomFade bgColor={colors.card} />

                        {/* ── Score badge — top left ── */}
                        <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
                            <Text style={styles.scoreBadgeNum}>{score.toFixed(1)}</Text>
                            <Text style={styles.scoreBadgeSub}>/10</Text>
                        </View>

                        {/* ── Top Rated pill — bottom left of image ── */}
                        {isTopRated && (
                            <View style={styles.topRatedPill}>
                                <Text style={styles.topRatedText}>🔥 Top Rated</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                {/* ── Heart — top right, outside image touch area ── */}
                <TouchableOpacity
                    onPress={handleWatchlist}
                    style={[
                        styles.heartBtn,
                        {
                            backgroundColor: inWatchlist
                                ? '#E53935'                    // solid red when saved
                                : 'rgba(0,0,0,0.52)',         // dark glass — visible on any poster
                            borderColor: inWatchlist
                                ? 'rgba(255,255,255,0.30)'
                                : 'rgba(255,255,255,0.22)',
                            shadowColor: inWatchlist ? '#E53935' : '#000',
                            shadowOpacity: inWatchlist ? 0.55 : 0.40,
                        },
                    ]}
                    activeOpacity={0.80}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                    {/* Outer contrast ring — extra halo on very light posters */}
                    <View
                        style={[
                            styles.heartRing,
                            {
                                borderColor: inWatchlist
                                    ? 'transparent'
                                    : 'rgba(0,0,0,0.15)',
                            },
                        ]}
                    />
                    <Animated.Text
                        style={[
                            styles.heartIcon,
                            { transform: [{ scale: heartScale }] },
                        ]}
                    >
                        {inWatchlist ? '\u2665' : '\u2661'}
                    </Animated.Text>
                </TouchableOpacity>

                {/* ══════════════ CONTENT SECTION ══════════════ */}
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onPress}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    style={styles.content}
                >
                    {/* Tags row */}
                    <View style={styles.tagsRow}>
                        <View style={[styles.tag, { backgroundColor: tagBg, borderColor: tagBdr }]}>
                            <Text style={[styles.tagText, { color: colors.subText }]}>📅 {year}</Text>
                        </View>
                        <View style={[styles.tag, { backgroundColor: tagBg, borderColor: tagBdr }]}>
                            <Text style={[styles.tagText, { color: colors.subText }]}>🌐 {lang}</Text>
                        </View>
                        <View style={styles.tag4K}>
                            <Text style={styles.tag4KText}>4K</Text>
                        </View>
                        <View style={styles.tagHDR}>
                            <Text style={styles.tagHDRText}>HDR</Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text numberOfLines={2} style={[styles.title, { color: colors.text }]}>
                        {movie.title}
                    </Text>

                    {/* Overview */}
                    <Text numberOfLines={2} style={[styles.overview, { color: colors.subText }]}>
                        {movie.overview || 'No description available for this title.'}
                    </Text>

                    {/* Stars + Score */}
                    {/* <View style={styles.ratingRow}>
                        <Stars score={score} color={scoreColor} />
                        <Text style={[styles.scoreLabel, { color: scoreColor }]}>
                            {score.toFixed(1)}
                            <Text style={[styles.scoreMax, { color: colors.subText }]}>/10</Text>
                        </Text>
                    </View> */}

                    {/* Bar */}
                    {/* <RatingBar score={score} color={scoreColor} /> */}

                    {/* Actions */}
                    <View style={styles.actionsRow}>
                        {/* Watch Trailer */}
                        <TouchableOpacity
                            onPress={handleWatchTrailer}
                            disabled={trailerLoading}
                            style={[styles.trailerBtn, trailerLoading && styles.trailerBtnBusy]}
                            activeOpacity={0.82}
                            accessibilityRole="button"
                            accessibilityLabel="Watch trailer"
                        >
                            {trailerLoading
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Text style={styles.trailerBtnText}>▶  Watch Trailer</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            <TrailerModal
                visible={modalVisible}
                videoKey={trailerKey}
                movieTitle={movie.title}
                onClose={() => setModalVisible(false)}
                onWebViewFail={handleWebViewFail}
            />
        </>
    );
});

MovieCard.displayName = 'MovieCard';
export default MovieCard;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

    // Card shell
    card: {
        marginHorizontal: SPACING.base,
        marginVertical: SPACING.sm + 2,
        borderRadius: 22,
        borderWidth: 1,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 16,
        elevation: 6,
    },

    // ── Image section ─────────────────────────────────────────────────────────

    imageSection: {
        width: '100%',
        height: IMAGE_H,
        backgroundColor: '#1C2333',
        overflow: 'hidden',
    },

    backdrop: {
        width: '100%',
        height: IMAGE_H,
    },

    backdropFallback: {
        width: '100%',
        height: IMAGE_H,
        justifyContent: 'center',
        alignItems: 'center',
    },

    fallbackEmoji: {
        fontSize: 48,
    },

    // Score badge — top left
    scoreBadge: {
        position: 'absolute',
        top: SPACING.md,
        left: SPACING.md,
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: RADII.md,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 3,
    },

    scoreBadgeNum: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: -0.3,
    },

    scoreBadgeSub: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 10,
        fontWeight: '700',
    },

    // Top Rated pill — bottom left of image (above gradient)
    topRatedPill: {
        position: 'absolute',
        bottom: SPACING.md + 4,
        left: SPACING.md,
        backgroundColor: 'rgba(220,38,38,0.88)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADII.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },

    topRatedText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.2,
    },

    // Heart — top right corner of card, always visible on any poster
    heartBtn: {
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md,
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 10,
        elevation: 8,
    },

    // Extra outer ring for contrast on very light/white poster backgrounds
    heartRing: {
        position: 'absolute',
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
    },

    heartIcon: {
        fontSize: 17,
        color: '#FFFFFF',              // always white — container bg provides the state color
        fontWeight: '700',
        lineHeight: 20,
        textShadowColor: 'rgba(0,0,0,0.40)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },

    // ── Content section ───────────────────────────────────────────────────────

    content: {
        paddingHorizontal: SPACING.base,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.base,
        gap: SPACING.sm,
    },

    // Tags
    tagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },

    tag: {
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: RADII.full,
        borderWidth: 1,
    },

    tagText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.2,
    },

    tag4K: {
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: RADII.full,
        backgroundColor: COLORS.primaryDim,
        borderWidth: 1,
        borderColor: COLORS.primaryGlow,
    },

    tag4KText: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.primary,
        letterSpacing: 0.5,
    },

    tagHDR: {
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: RADII.full,
        backgroundColor: 'rgba(251,191,36,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(251,191,36,0.28)',
    },

    tagHDRText: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.gold,
        letterSpacing: 0.5,
    },

    // Title
    title: {
        fontSize: 17,
        fontWeight: '800',
        lineHeight: 23,
        letterSpacing: -0.4,
    },

    // Overview
    overview: {
        fontSize: 12,
        lineHeight: 18,
    },

    // Rating row: stars + score
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    scoreLabel: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: -0.2,
    },

    scoreMax: {
        fontSize: 11,
        fontWeight: '500',
    },

    // ── Actions ───────────────────────────────────────────────────────────────

    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginTop: 2,
    },

    trailerBtn: {
        flex: 1,
        height: 42,
        backgroundColor: COLORS.primary,
        borderRadius: RADII.md,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.38,
        shadowRadius: 8,
        elevation: 4,
    },

    trailerBtnBusy: {
        opacity: 0.72,
    },

    trailerBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.1,
    },

    bookmarkBtn: {
        width: 42,
        height: 42,
        borderRadius: RADII.md,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    bookmarkIcon: {
        fontSize: 17,
    },
});