import React, { useEffect } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';
import ErrorView from '../components/ErrorView';

import { fetchMovies } from '../redux/slices/movieSlice';
import { AppDispatch, RootState } from '../redux/store';

const HomeScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();

    const { movies, loading, error } = useSelector(
        (state: RootState) => state.movies,
    );

    useEffect(() => {
        dispatch(fetchMovies(1));
    }, [dispatch]);

    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Trending Movies</Text>
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
        <SafeAreaView style={styles.container}>
            <FlatList
                data={movies}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
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

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    listContent: {
        paddingBottom: 20,
    },

    headerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },

    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
    },
});