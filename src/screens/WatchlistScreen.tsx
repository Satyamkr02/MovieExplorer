import React, { useCallback } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, AppDispatch } from '../redux/store';
import { toggleWatchlist } from '../redux/slices/watchlistSlice';
import { Movie } from '../types/movie';
import { useTheme } from '../hooks/useTheme';
import { IMAGE_BASE_URL } from '../utils/constants';
import { COLORS, RADII, SPACING } from '../utils/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const CARD_GAP = SPACING.sm;
const H_PADDING = SPACING.base;
const CARD_W = (SCREEN_W - H_PADDING * 2 - CARD_GAP) / NUM_COLUMNS;
const CARD_H = CARD_W * 1.6;   // ~poster aspect ratio

// ─── Poster Card (grid cell) ──────────────────────────────────────────────────

const PosterCard = ({
    movie,
    onPress,
    onRemove,
    colors,
}: {
    movie: Movie;
    onPress: () => void;
    onRemove: () => void;
    colors: any;
}) => {
    const imageUri = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : null;

    const rating = movie.vote_average ?? 0;
    const ratingColor =
        rating >= 7.5 ? '#22C55E' : rating >= 6.0 ? '#F59E0B' : '#EF4444';

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel={`Open ${movie.title}`}
        >
            {/* Poster image */}
            {imageUri ? (
                <Image
                    source={{ uri: imageUri }}
                    style={styles.poster}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.posterFallback, { backgroundColor: colors.surface }]}>
                    <Text style={styles.fallbackIcon}>🎬</Text>
                </View>
            )}

            {/* Score badge – top left */}
            <View style={[styles.scoreBadge, { backgroundColor: ratingColor }]}>
                <Text style={styles.scoreBadgeText}>{rating.toFixed(1)}</Text>
            </View>

            {/* Remove heart – top right */}
            <TouchableOpacity
                onPress={onRemove}
                style={styles.heartBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${movie.title} from watchlist`}
            >
                <Text style={styles.heartIcon}>❤️</Text>
            </TouchableOpacity>

            {/* Title + year at bottom */}
            <View style={[styles.cardFooter, { backgroundColor: colors.card }]}>
                <Text
                    numberOfLines={2}
                    style={[styles.cardTitle, { color: colors.text }]}
                >
                    {movie.title}
                </Text>
                <Text style={[styles.cardYear, { color: colors.subText }]}>
                    {movie.release_date?.split('-')[0] ?? '—'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ colors }: { colors: any }) => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎬</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Your watchlist is empty
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
            Tap the ♡ on any movie card{'\n'}to save it here for later.
        </Text>
    </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const WatchlistScreen = ({ navigation }: any) => {
    const { colors, darkMode } = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const items = useSelector((state: RootState) => state.watchlist.items);

    const handleRemove = useCallback(
        (movie: Movie) => dispatch(toggleWatchlist(movie)),
        [dispatch],
    );

    const handleOpen = useCallback(
        (movie: Movie) => navigation.navigate('Details', { movie }),
        [navigation],
    );

    const renderItem = useCallback(
        ({ item }: { item: Movie }) => (
            <PosterCard
                movie={item}
                colors={colors}
                onPress={() => handleOpen(item)}
                onRemove={() => handleRemove(item)}
            />
        ),
        [colors, handleOpen, handleRemove],
    );

    const keyExtractor = useCallback((item: Movie) => String(item.id), []);

    // Add a spacer at the end when odd count so last item doesn't stretch
    const data = items.length % 2 !== 0 ? [...items, null] : items;

    const renderSpacerOrItem = useCallback(
        ({ item }: { item: Movie | null }) => {
            if (!item) { return <View style={styles.cardSpacer} />; }
            return (
                <PosterCard
                    movie={item}
                    colors={colors}
                    onPress={() => handleOpen(item)}
                    onRemove={() => handleRemove(item)}
                />
            );
        },
        [colors, handleOpen, handleRemove],
    );

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={['top', 'left', 'right']}
        >
            <StatusBar
                barStyle={darkMode ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />

            {/* ── Header ─────────────────────────────────────────────── */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Text style={[styles.backBtnText, { color: colors.text }]}>←</Text>
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        Watchlist
                    </Text>
                    {items.length > 0 && (
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{items.length}</Text>
                        </View>
                    )}
                </View>

                {/* Placeholder to balance header */}
                <View style={styles.headerSpacer} />
            </View>

            {/* ── Grid ───────────────────────────────────────────────── */}
            {items.length === 0 ? (
                <EmptyState colors={colors} />
            ) : (
                <FlatList
                    data={data as (Movie | null)[]}
                    keyExtractor={(item, idx) =>
                        item ? String(item.id) : `spacer-${idx}`
                    }
                    renderItem={renderSpacerOrItem}
                    numColumns={NUM_COLUMNS}
                    contentContainerStyle={styles.gridContent}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={12}
                    windowSize={10}
                />
            )}
        </SafeAreaView>
    );
};

export default WatchlistScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
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

    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.sm,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.4,
    },

    countBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: RADII.full,
        minWidth: 24,
        alignItems: 'center',
    },

    countText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
    },

    headerSpacer: {
        width: 40,
    },

    // ── Grid ──────────────────────────────────────────────────────────────────
    gridContent: {
        paddingHorizontal: H_PADDING,
        paddingTop: SPACING.base,
        paddingBottom: SPACING.xxxl,
    },

    row: {
        gap: CARD_GAP,
        marginBottom: CARD_GAP,
    },

    // ── Poster Card ───────────────────────────────────────────────────────────
    card: {
        width: CARD_W,
        borderRadius: RADII.lg,
        overflow: 'hidden',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },

    cardSpacer: {
        width: CARD_W,
    },

    poster: {
        width: CARD_W,
        height: CARD_H,
    },

    posterFallback: {
        width: CARD_W,
        height: CARD_H,
        justifyContent: 'center',
        alignItems: 'center',
    },

    fallbackIcon: {
        fontSize: 36,
    },

    // Score badge – top left over image
    scoreBadge: {
        position: 'absolute',
        top: SPACING.sm,
        left: SPACING.sm,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: RADII.sm,
    },

    scoreBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
    },

    // Heart remove – top right over image
    heartBtn: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    heartIcon: {
        fontSize: 15,
    },

    // Title + year below poster
    cardFooter: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.sm,
    },

    cardTitle: {
        fontSize: 13,
        fontWeight: '700',
        lineHeight: 18,
        letterSpacing: -0.1,
    },

    cardYear: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },

    // ── Empty State ───────────────────────────────────────────────────────────
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xxl,
        gap: SPACING.md,
    },

    emptyIcon: {
        fontSize: 64,
        marginBottom: SPACING.sm,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
    },

    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
});
