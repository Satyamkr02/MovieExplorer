import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';

import { IMAGE_BASE_URL } from '../utils/constants';
import { Movie } from '../types/movie';
import { RootState } from '../redux/store';

interface Props {
    movie: Movie;
    onPress: () => void;
}

const MovieCard = ({ movie, onPress }: Props) => {
    const darkMode = useSelector((state: RootState) => state.theme.darkMode);

    const cardBg = darkMode ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF';
    const borderColor = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)';
    const titleColor = darkMode ? '#FFFFFF' : '#1F2937';
    const releaseColor = darkMode ? '#9CA3AF' : '#4B5563';
    const overviewColor = darkMode ? '#9CA3AF' : '#6B7280';
    const shadowOpacity = darkMode ? 0.15 : 0.05;
    const shadowColor = darkMode ? '#000000' : '#1F2937';

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: cardBg,
                    borderColor: borderColor,
                    shadowColor: shadowColor,
                    shadowOpacity: shadowOpacity,
                },
            ]}
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
                <Text numberOfLines={2} style={[styles.title, { color: titleColor }]}>
                    {movie.title}
                </Text>

                <Text style={[styles.releaseDate, { color: releaseColor }]}>
                    Release: {movie.release_date}
                </Text>

                <Text numberOfLines={3} style={[styles.overview, { color: overviewColor }]}>
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
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        marginHorizontal: 14,
        marginVertical: 8,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 5,

        elevation: 4,
    },

    image: {
        width: 120,
        height: 180,
        backgroundColor: '#1E293B',
    },

    contentContainer: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },

    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    releaseDate: {
        marginTop: 6,
        fontSize: 13,
        color: '#9CA3AF',
    },

    overview: {
        marginTop: 10,
        fontSize: 14,
        lineHeight: 20,
        color: '#9CA3AF',
    },

    ratingContainer: {
        marginTop: 12,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(251, 191, 36, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },

    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FBBF24',
    },
});