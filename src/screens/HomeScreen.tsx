import React, { useEffect, useMemo, useState } from 'react';

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

import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';
import ErrorView from '../components/ErrorView';

import { fetchMovies, searchMoviesThunk } from '../redux/slices/movieSlice';
import { toggleTheme } from '../redux/slices/themeSlice';
import { AppDispatch, RootState } from '../redux/store';

const genres = [
    'All',
    'Action',
    'Comedy',
    'Drama',
    'Horror',
    'Romance',
    'Sci-Fi',
    'Adventure',
];

const HomeScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();

    const { movies, loading, loadingNextPage, error } = useSelector(
        (state: RootState) => state.movies,
    );
    const darkMode = useSelector((state: RootState) => state.theme.darkMode);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [page, setPage] = useState(1);

    const [filteredMovies, setFilteredMovies] = useState(movies);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Compute theme colors dynamically
    const colors = useMemo(() => {
        return {
            background: darkMode ? '#0B0F19' : '#F3F4F6',
            headerWrapperBg: darkMode ? '#0B0F19' : '#F3F4F6',
            text: darkMode ? '#FFFFFF' : '#1F2937',
            subText: darkMode ? '#9CA3AF' : '#6B7280',
            cardBackground: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
            inputText: darkMode ? '#FFFFFF' : '#1F2937',
            placeholder: darkMode ? '#6B7280' : '#9CA3AF',
            dropdownBg: darkMode ? 'rgba(15, 23, 42, 0.98)' : '#FFFFFF',
            dropdownBorder: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            pillDefaultBg: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
            pillDefaultText: darkMode ? '#9CA3AF' : '#4B5563',
            searchWrapperBg: darkMode ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF',
            searchBorderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
        };
    }, [darkMode]);

    // Fetch initial trending movies
    useEffect(() => {
        dispatch(fetchMovies(1));
    }, [dispatch]);

    // Reset pagination page index when filters change
    useEffect(() => {
        setPage(1);
    }, [searchQuery, selectedGenre]);

    // Debounce Search API Calls when user stops typing
    useEffect(() => {
        const isQueryActive = searchQuery.trim().length > 0;

        if (isQueryActive) {
            setSearchLoading(true);
        }

        const delayDebounce = setTimeout(() => {
            if (isQueryActive) {
                dispatch(searchMoviesThunk({ query: searchQuery, page: 1 }))
                    .unwrap()
                    .finally(() => setSearchLoading(false));
            } else {
                setSearchLoading(true);
                dispatch(fetchMovies(1))
                    .unwrap()
                    .finally(() => setSearchLoading(false));
            }
        }, 600); // Premium 600ms typing pause detector

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, dispatch]);

    // Apply Client-Side Genre Filter
    useEffect(() => {
        let updatedMovies = [...movies];

        if (selectedGenre !== 'All') {
            updatedMovies = updatedMovies.filter(movie =>
                movie.overview
                    ?.toLowerCase()
                    .includes(selectedGenre.toLowerCase()),
            );
        }

        setFilteredMovies(updatedMovies);
    }, [movies, selectedGenre]);

    // Handle Infinite Scroll Loading
    const handleLoadMore = () => {
        if (loading || loadingNextPage) return;

        const nextPage = page + 1;
        setPage(nextPage);

        if (searchQuery.trim().length > 0) {
            dispatch(searchMoviesThunk({ query: searchQuery, page: nextPage }));
        } else {
            dispatch(fetchMovies(nextPage));
        }
    };

    const renderHeader = useMemo(() => {
        return (
            <View style={[styles.headerWrapper, { backgroundColor: colors.headerWrapperBg }]}>
                {/* Title and Settings Cog Bar */}
                <View style={styles.headerContainer}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            Movie <Text style={styles.headerTitleHighlight}>Explorer</Text>
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={[
                                styles.profileButton,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.borderColor,
                                },
                            ]}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Text style={styles.profileButtonText}>⚙️</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
                        Discover your next favorite blockbuster
                    </Text>
                </View>

                {/* Search Box with dynamic loaders */}
                <View style={styles.searchContainer}>
                    <View
                        style={[
                            styles.searchWrapper,
                            {
                                backgroundColor: colors.searchWrapperBg,
                                borderColor: isSearchFocused ? '#E11D48' : colors.searchBorderColor,
                            },
                        ]}
                    >
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            placeholder="Search movies..."
                            placeholderTextColor={colors.placeholder}
                            value={searchQuery}
                            onChangeText={text => {
                                setSearchQuery(text);
                                if (text.trim().length > 0) {
                                    setSearchLoading(true);
                                }
                            }}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            style={[styles.searchInput, { color: colors.inputText }]}
                        />
                        {searchLoading && (
                            <ActivityIndicator
                                size="small"
                                color="#E11D48"
                                style={styles.searchLoader}
                            />
                        )}
                    </View>
                </View>

                {/* Category Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.genreContainer}
                >
                    {genres.map(genre => {
                        const isSelected = selectedGenre === genre;

                        return (
                            <TouchableOpacity
                                key={genre}
                                activeOpacity={0.8}
                                onPress={() => setSelectedGenre(genre)}
                                style={[
                                    styles.genreButton,
                                    {
                                        backgroundColor: isSelected ? '#E11D48' : colors.pillDefaultBg,
                                        borderColor: isSelected ? '#E11D48' : colors.borderColor,
                                    },
                                    isSelected && styles.selectedGenreShadow,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.genreText,
                                        {
                                            color: isSelected ? '#FFFFFF' : colors.pillDefaultText,
                                        },
                                    ]}
                                >
                                    {genre}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        );
    }, [searchQuery, selectedGenre, isSearchFocused, searchLoading, colors, navigation]);

    const renderEmptyComponent = () => {
        if (searchLoading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#E11D48" style={{ marginBottom: 16 }} />
                    <Text style={[styles.emptyText, { color: colors.subText }]}>Searching the database...</Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🎬</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Movies Found</Text>
                <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
                    We couldn't find any blockbusters matching "{searchQuery}" in "{selectedGenre}".
                </Text>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.clearButton}
                    onPress={() => {
                        setSearchQuery('');
                        setSelectedGenre('All');
                    }}
                >
                    <Text style={styles.clearButtonText}>Reset Filters</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <ErrorView message={error} />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <StatusBar
                barStyle={darkMode ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />


            <FlatList
                data={filteredMovies}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyComponent}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loadingNextPage ? (
                        <View style={styles.footerLoader}>
                            <ActivityIndicator size="small" color="#E11D48" />
                            <Text style={[styles.footerLoaderText, { color: colors.subText }]}>
                                Loading more blockbuster hits...
                            </Text>
                        </View>
                    ) : (
                        <View style={{ height: 20 }} />
                    )
                }
                renderItem={({ item }) => (
                    <MovieCard
                        movie={item}
                        onPress={() =>
                            navigation.navigate('Details', {
                                movie: item,
                            })
                        }
                    />
                )}
            />
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    listContent: {
        paddingBottom: 40,
    },

    headerWrapper: {
        paddingTop: 12,
    },

    headerContainer: {
        paddingHorizontal: 16,
    },

    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.8,
    },

    headerTitleHighlight: {
        color: '#E11D48',
    },

    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },

    profileButtonText: {
        fontSize: 18,
    },

    headerSubtitle: {
        marginTop: 6,
        fontSize: 14,
        fontWeight: '500',
    },

    searchContainer: {
        marginTop: 20,
        paddingHorizontal: 16,
    },

    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 54,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },

    searchIcon: {
        fontSize: 18,
        marginRight: 8,
    },

    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        fontWeight: '500',
        paddingVertical: 0,
    },

    searchLoader: {
        marginLeft: 8,
    },

    genreContainer: {
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 16,
    },

    genreButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
        marginRight: 10,
        borderWidth: 1,
    },

    selectedGenreShadow: {
        shadowColor: '#E11D48',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },

    genreText: {
        fontSize: 14,
        fontWeight: '700',
    },

    emptyContainer: {
        marginTop: 60,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },

    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8,
    },

    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },

    emptyText: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    },

    clearButton: {
        backgroundColor: '#E11D48',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
        shadowColor: '#E11D48',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    clearButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    footerLoader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 10,
    },

    footerLoaderText: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Dropdown styles
    dropdownBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99,
        backgroundColor: 'transparent',
    },

    settingsDropdown: {
        position: 'absolute',
        top: 70,
        right: 16,
        width: 260,
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        zIndex: 100,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },

    settingsTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: -0.3,
    },

    themeSelectorContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 10,
        padding: 4,
        marginBottom: 16,
    },

    themeOption: {
        flex: 1,
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },

    themeOptionSelected: {
        backgroundColor: '#E11D48',
    },

    themeOptionText: {
        fontSize: 13,
        fontWeight: '700',
    },

    dropdownDivider: {
        height: 1,
        marginBottom: 12,
    },

    dropdownProfileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    dropdownProfileEmoji: {
        fontSize: 22,
    },

    dropdownProfileName: {
        fontSize: 14,
        fontWeight: '700',
    },

    dropdownProfileTier: {
        fontSize: 11,
        color: '#E11D48',
        fontWeight: '700',
        marginTop: 2,
    },
});