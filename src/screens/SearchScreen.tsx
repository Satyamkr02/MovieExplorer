import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import MovieCard from '../components/MovieCard';
import { searchMovies } from '../api/movieApi';
import { Movie } from '../types/movie';

const SearchScreen = ({ navigation }: any) => {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (query.trim().length > 2) {
                fetchMovies(query);
            } else {
                setMovies([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const fetchMovies = async (searchText: string) => {
        try {
            setLoading(true);
            setError('');

            const response = await searchMovies(searchText);

            setMovies(response.results);
        } catch (err) {
            console.log(err);
            setError('Failed to search movies');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <Text style={styles.heading}>Search Movies</Text>

                <TextInput
                    placeholder="Search movies..."
                    placeholderTextColor="#9CA3AF"
                    value={query}
                    onChangeText={setQuery}
                    style={styles.input}
                />
            </View>

            {loading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" />
                </View>
            )}

            {!loading && error ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {!loading && !error && movies.length === 0 && query.length > 2 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No movies found</Text>
                </View>
            ) : null}

            <FlatList
                data={movies}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
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

export default SearchScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
    },

    heading: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },

    input: {
        height: 52,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 16,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 3,

        elevation: 2,
    },

    loaderContainer: {
        marginTop: 30,
    },

    centerContainer: {
        marginTop: 40,
        alignItems: 'center',
    },

    errorText: {
        color: 'red',
        fontSize: 16,
    },

    emptyText: {
        fontSize: 16,
        color: '#6B7280',
    },

    listContent: {
        paddingBottom: 20,
    },
});