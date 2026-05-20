import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { IMAGE_BASE_URL } from '../utils/constants';
import { Movie } from '../types/movie';

interface Props {
    movie: Movie;
    onPress: () => void;
}

const MovieCard = ({ movie, onPress }: Props) => {
    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={onPress}
        >
            <Image
                source={{
                    uri: `${IMAGE_BASE_URL}${movie.poster_path}`,
                }}
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.contentContainer}>
                <Text numberOfLines={2} style={styles.title}>
                    {movie.title}
                </Text>

                <Text style={styles.releaseDate}>
                    Release: {movie.release_date}
                </Text>

                <Text numberOfLines={3} style={styles.overview}>
                    {movie.overview}
                </Text>

                <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>
                        ⭐ {movie.vote_average.toFixed(1)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default MovieCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 14,
        marginVertical: 8,
        borderRadius: 16,
        overflow: 'hidden',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,

        elevation: 4,
    },

    image: {
        width: 120,
        height: 180,
        backgroundColor: '#E5E7EB',
    },

    contentContainer: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },

    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },

    releaseDate: {
        marginTop: 6,
        fontSize: 13,
        color: '#6B7280',
    },

    overview: {
        marginTop: 10,
        fontSize: 14,
        lineHeight: 20,
        color: '#4B5563',
    },

    ratingContainer: {
        marginTop: 12,
        alignSelf: 'flex-start',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },

    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
});