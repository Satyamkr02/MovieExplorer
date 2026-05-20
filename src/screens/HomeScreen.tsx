import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import MovieCard from '../components/MovieCard';
import { SkeletonList } from '../components/SkeletonCard';
import ErrorView from '../components/ErrorView';

import { useMovies } from '../hooks/useMovies';
import { useTheme } from '../hooks/useTheme';
import { COLORS, RADII, SPACING } from '../utils/theme';
import { RootState } from '../redux/store';

// ─── Constants ────────────────────────────────────────────────────────────────

const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];
const DEBOUNCE_MS = 600;

// ─── Component ────────────────────────────────────────────────────────────────

const HomeScreen = ({ navigation }: any) => {
    const { colors, darkMode } = useTheme();
    const watchlistCount = useSelector(
        (state: RootState) => state.watchlist.items.length,
    );

    const {
        movies,
        loading,
        loadingNextPage,
        error,
        hasMore,
        fetchInitial,
        loadNextPage,
        executeSearch,
        loadNextSearchPage,
    } = useMovies();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [searchLoading, setSearchLoading] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Initial fetch ──────────────────────────────────────────────────────────
    useEffect(() => {
        fetchInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Debounced search ───────────────────────────────────────────────────────
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        const trimmed = searchQuery.trim();

        if (trimmed.length > 0) {
            setSearchLoading(true);
            debounceRef.current = setTimeout(() => {
                executeSearch(trimmed, 1);
                setSearchLoading(false);
            }, DEBOUNCE_MS);
        } else if (trimmed.length === 0 && searchQuery !== '') {
            // User cleared the input — restore trending
            setSearchLoading(false);
            fetchInitial();
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // ── Client-side genre filter ───────────────────────────────────────────────
    const filteredMovies = useMemo(() => {
        if (selectedGenre === 'All') {
            return movies;
        }
        return movies.filter(m =>
            m.overview?.toLowerCase().includes(selectedGenre.toLowerCase()),
        );
    }, [movies, selectedGenre]);

    // ── Infinite scroll ────────────────────────────────────────────────────────
    const handleLoadMore = useCallback(() => {
        if (!hasMore || searchLoading) {
            return;
        }
        const trimmed = searchQuery.trim();
        if (trimmed.length > 0) {
            loadNextSearchPage(trimmed);
        } else {
            loadNextPage();
        }
    }, [hasMore, searchLoading, searchQuery, loadNextPage, loadNextSearchPage]);

    const handleRetry = useCallback(() => {
        fetchInitial();
    }, [fetchInitial]);


    const keyExtractor = useCallback(
        (item: any, index: number) => `${item.id}-${index}`,
        [],
    );

    const renderItem = useCallback(
        ({ item }: any) => (
            <MovieCard
                movie={item}
                onPress={() => navigation.navigate('Details', { movie: item })}
            />
        ),
        [navigation],
    );

    // ── Sub-renders ────────────────────────────────────────────────────────────
    const ListHeaderComponent = useMemo(
        () => (
            <View style={[styles.headerWrapper, { backgroundColor: colors.background }]}>
                {/* Title Row */}
                <View style={styles.titleRow}>
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            Movie{' '}
                            <Text style={styles.accentText}>Explorer</Text>
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
                            Discover your next blockbuster
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        {/* Watchlist button with live count badge */}
                        <TouchableOpacity
                            activeOpacity={0.75}
                            style={[
                                styles.settingsBtn,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.border,
                                },
                            ]}
                            onPress={() => navigation.navigate('Watchlist')}
                            accessibilityRole="button"
                            accessibilityLabel="Open watchlist"
                        >
                            <Text style={styles.settingsBtnIcon}>🔖</Text>
                            {watchlistCount > 0 && (
                                <View style={styles.watchlistBadge}>
                                    <Text style={styles.watchlistBadgeText}>
                                        {watchlistCount > 99 ? '99+' : watchlistCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Settings */}
                        <TouchableOpacity
                            activeOpacity={0.75}
                            style={[
                                styles.settingsBtn,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.border,
                                },
                            ]}
                            onPress={() => navigation.navigate('Settings')}
                            accessibilityRole="button"
                            accessibilityLabel="Open settings"
                        >
                            <Text style={styles.settingsBtnIcon}>⚙️</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View
                    style={[
                        styles.searchWrapper,
                        {
                            backgroundColor: colors.inputBg,
                            borderColor: isSearchFocused
                                ? COLORS.primary
                                : colors.border,
                        },
                    ]}
                >
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search movies…"
                        placeholderTextColor={colors.subText}
                        value={searchQuery}
                        onChangeText={text => {
                            setSearchQuery(text);
                            if (text.trim().length > 0) {
                                setSearchLoading(true);
                            }
                        }}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                    {searchLoading && (
                        <ActivityIndicator
                            size="small"
                            color={COLORS.primary}
                            style={styles.searchSpinner}
                        />
                    )}
                </View>

                {/* Genre Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.genreContainer}
                >
                    {GENRES.map(genre => {
                        const active = selectedGenre === genre;
                        return (
                            <TouchableOpacity
                                key={genre}
                                activeOpacity={0.8}
                                onPress={() => setSelectedGenre(genre)}
                                style={[
                                    styles.genrePill,
                                    {
                                        backgroundColor: active
                                            ? COLORS.primary
                                            : colors.pillDefault,
                                        borderColor: active
                                            ? COLORS.primary
                                            : colors.border,
                                        shadowColor: active
                                            ? COLORS.primary
                                            : 'transparent',
                                    },
                                ]}
                                accessibilityRole="button"
                                accessibilityLabel={`Filter by ${genre}`}
                                accessibilityState={{ selected: active }}
                            >
                                <Text
                                    style={[
                                        styles.genrePillText,
                                        { color: active ? '#fff' : colors.subText },
                                    ]}
                                >
                                    {genre}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Results count chip */}
                {filteredMovies.length > 0 && (
                    <Text style={[styles.resultsCount, { color: colors.subText }]}>
                        {filteredMovies.length} titles
                        {searchQuery.trim().length > 0
                            ? ` for "${searchQuery.trim()}"`
                            : ' trending'}
                    </Text>
                )}
            </View>
        ),
        [
            colors,
            isSearchFocused,
            searchQuery,
            searchLoading,
            selectedGenre,
            filteredMovies.length,
            navigation,
        ],
    );

    const ListEmptyComponent = useCallback(() => {
        if (loading || searchLoading) {
            return null;
        }
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🎬</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    No movies found
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
                    {searchQuery.trim().length > 0
                        ? `We couldn't find anything for "${searchQuery}"`
                        : 'Try a different genre or check back later.'}
                </Text>
                {searchQuery.trim().length > 0 && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.clearBtn}
                        onPress={() => {
                            setSearchQuery('');
                            setSelectedGenre('All');
                        }}
                    >
                        <Text style={styles.clearBtnText}>Clear Search</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }, [loading, searchLoading, searchQuery, colors]);

    const ListFooterComponent = useCallback(() => {
        if (loadingNextPage) {
            return (
                <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={[styles.footerText, { color: colors.subText }]}>
                        Loading more…
                    </Text>
                </View>
            );
        }
        if (!hasMore && filteredMovies.length > 0) {
            return (
                <View style={styles.footerEnd}>
                    <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />
                    <Text style={[styles.footerEndText, { color: colors.subText }]}>
                        You've seen it all 🎉
                    </Text>
                    <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />
                </View>
            );
        }
        return <View style={styles.footerPad} />;
    }, [loadingNextPage, hasMore, filteredMovies.length, colors]);

    // ── Render ─────────────────────────────────────────────────────────────────
    if (error && movies.length === 0) {
        return <ErrorView message={error} onRetry={handleRetry} />;
    }

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={['top', 'left', 'right']}
        >
            <StatusBar
                barStyle={darkMode ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />

            {loading && movies.length === 0 ? (
                /* Skeleton Loading State */
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.skeletonScroll}
                >
                    {ListHeaderComponent}
                    <SkeletonList count={5} />
                </ScrollView>
            ) : (
                <FlatList
                    data={filteredMovies}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    ListHeaderComponent={ListHeaderComponent}
                    ListEmptyComponent={ListEmptyComponent}
                    ListFooterComponent={ListFooterComponent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.1}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    maxToRenderPerBatch={10}
                    initialNumToRender={10}
                    windowSize={12}
                />
            )}
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    listContent: {
        paddingBottom: SPACING.xxl,
    },

    skeletonScroll: {
        paddingBottom: SPACING.xxl,
    },

    // ── Header ──────────────────────────────────────────────────────────────

    headerWrapper: {
        paddingTop: SPACING.sm,
        paddingBottom: 4,
    },

    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.base,
        marginBottom: SPACING.base,
    },

    headerTitle: {
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: -0.8,
        lineHeight: 36,
    },

    accentText: {
        color: COLORS.primary,
    },

    headerSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },

    settingsBtn: {
        width: 44,
        height: 44,
        borderRadius: RADII.md,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    settingsBtnIcon: {
        fontSize: 18,
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },

    watchlistBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.primary,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#fff',
    },

    watchlistBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '800',
        lineHeight: 13,
    },

    // ── Search ───────────────────────────────────────────────────────────────

    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        marginHorizontal: SPACING.base,
        borderRadius: RADII.lg,
        paddingHorizontal: SPACING.base,
        borderWidth: 1.5,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },

    searchIcon: {
        fontSize: 16,
        marginRight: SPACING.sm,
    },

    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        fontWeight: '500',
        paddingVertical: 0,
    },

    searchSpinner: {
        marginLeft: SPACING.sm,
    },

    // ── Genre pills ───────────────────────────────────────────────────────────

    genreContainer: {
        paddingHorizontal: SPACING.base,
        paddingTop: SPACING.base,
        paddingBottom: SPACING.sm,
        gap: 8,
    },

    genrePill: {
        paddingHorizontal: SPACING.base,
        paddingVertical: 8,
        borderRadius: RADII.full,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 3,
    },

    genrePillText: {
        fontSize: 13,
        fontWeight: '700',
    },

    // ── Results count ─────────────────────────────────────────────────────────

    resultsCount: {
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: SPACING.base + 4,
        paddingBottom: SPACING.sm,
    },

    // ── Empty state ───────────────────────────────────────────────────────────

    emptyContainer: {
        marginTop: SPACING.xxxl + 20,
        paddingHorizontal: SPACING.xxl,
        alignItems: 'center',
    },

    emptyIcon: {
        fontSize: 60,
        marginBottom: SPACING.base,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: SPACING.sm,
    },

    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: SPACING.xl,
    },

    clearBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: RADII.md,
    },

    clearBtnText: {
        color: COLORS.textWhite,
        fontSize: 14,
        fontWeight: '700',
    },

    // ── Footer ────────────────────────────────────────────────────────────────

    footerLoader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        gap: 10,
    },

    footerText: {
        fontSize: 13,
        fontWeight: '600',
    },

    footerEnd: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.base,
        paddingHorizontal: SPACING.xl,
        gap: 10,
    },

    footerDivider: {
        flex: 1,
        height: 1,
    },

    footerEndText: {
        fontSize: 12,
        fontWeight: '600',
    },

    footerPad: {
        height: SPACING.lg,
    },
});