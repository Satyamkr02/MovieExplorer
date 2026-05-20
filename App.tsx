import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    AppState,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';

import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { loadState, saveState } from './src/utils/persistence';
import { rehydrateMovies } from './src/redux/slices/movieSlice';
import { setDarkMode } from './src/redux/slices/themeSlice';
import { rehydrateWatchlist } from './src/redux/slices/watchlistSlice';
import { COLORS } from './src/utils/theme';

// ─── Splash Screen ────────────────────────────────────────────────────────────

const SplashScreen = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 60,
                friction: 8,
            }),
        ]).start();
    }, [fadeAnim, scaleAnim]);

    return (
        <View style={styles.splashContainer}>
            <Animated.View
                style={[
                    styles.splashContent,
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                ]}
            >
                <Text style={styles.splashIcon}>🎬</Text>
                <Text style={styles.splashTitle}>
                    Movie{' '}
                    <Text style={styles.splashAccent}>Explorer</Text>
                </Text>
                <Text style={styles.splashTagline}>
                    Your cinematic universe
                </Text>
                <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                    style={styles.splashLoader}
                />
                <Text style={styles.splashHint}>Restoring your experience...</Text>
            </Animated.View>
        </View>
    );
};

// ─── Root App ─────────────────────────────────────────────────────────────────

const App = () => {
    const [isReady, setIsReady] = useState(false);

    // ── Rehydrate state on cold start ─────────────────────────────────────────
    useEffect(() => {
        const bootstrap = async () => {
            try {
                const persisted = await loadState();
                if (persisted) {
                    if (persisted.theme?.darkMode !== undefined) {
                        store.dispatch(setDarkMode(persisted.theme.darkMode));
                    }
                    if (
                        Array.isArray(persisted.movies?.movies) &&
                        persisted.movies.movies.length > 0
                    ) {
                        store.dispatch(rehydrateMovies(persisted.movies.movies));
                    }
                    if (
                        Array.isArray(persisted.watchlist?.items) &&
                        persisted.watchlist.items.length > 0
                    ) {
                        store.dispatch(rehydrateWatchlist(persisted.watchlist.items));
                    }
                }
            } catch (err) {
                console.warn('[App] State rehydration error:', err);
            } finally {
                setIsReady(true);
            }
        };

        bootstrap();
    }, []);

    // ── Auto-save on app background ────────────────────────────────────────────
    useEffect(() => {
        const sub = AppState.addEventListener('change', nextState => {
            if (nextState === 'background' || nextState === 'inactive') {
                saveState(store.getState()).catch(err =>
                    console.warn('[App] State save error:', err),
                );
            }
        });
        return () => sub.remove();
    }, []);

    // ── Save immediately whenever the watchlist changes ────────────────────────
    useEffect(() => {
        let lastWatchlistLen = store.getState().watchlist.items.length;
        const unsubscribe = store.subscribe(() => {
            const newLen = store.getState().watchlist.items.length;
            if (newLen !== lastWatchlistLen) {
                lastWatchlistLen = newLen;
                saveState(store.getState()).catch(err =>
                    console.warn('[App] Watchlist save error:', err),
                );
            }
        });
        return () => unsubscribe();
    }, []);

    if (!isReady) {
        return <SplashScreen />;
    }

    return (
        <Provider store={store}>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </Provider>
    );
};

export default App;

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        backgroundColor: COLORS.dark,
        justifyContent: 'center',
        alignItems: 'center',
    },

    splashContent: {
        alignItems: 'center',
    },

    splashIcon: {
        fontSize: 76,
        marginBottom: 16,
    },

    splashTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: COLORS.textWhite,
        letterSpacing: -1,
    },

    splashAccent: {
        color: COLORS.primary,
    },

    splashTagline: {
        fontSize: 15,
        color: COLORS.textGrey,
        fontWeight: '500',
        marginTop: 8,
    },

    splashLoader: {
        marginTop: 36,
        marginBottom: 14,
    },

    splashHint: {
        fontSize: 13,
        color: COLORS.textGreyLight,
        fontWeight: '500',
    },
});