import React from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { IMAGE_BASE_URL } from '../utils/constants';

const { width } = Dimensions.get('window');

const DetailsScreen = ({ route }: any) => {
    const { movie } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Image
                    source={{
                        uri: `${IMAGE_BASE_URL}${movie.poster_path}`,
                    }}
                    style={styles.poster}
                    resizeMode="cover"
                />

                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{movie.title}</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                ⭐ {movie.vote_average?.toFixed(1)}
                            </Text>
                        </View>

                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                📅 {movie.release_date}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Overview</Text>

                    <Text style={styles.description}>
                        {movie.overview || 'No description available.'}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DetailsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    scrollContent: {
        paddingBottom: 30,
    },

    poster: {
        width: width,
        height: 520,
        backgroundColor: '#E5E7EB',
    },

    contentContainer: {
        padding: 20,
    },

    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#111827',
        lineHeight: 38,
    },

    infoRow: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
        flexWrap: 'wrap',
    },

    badge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
    },

    badgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },

    sectionTitle: {
        marginTop: 28,
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },

    description: {
        fontSize: 16,
        lineHeight: 28,
        color: '#4B5563',
    },
});