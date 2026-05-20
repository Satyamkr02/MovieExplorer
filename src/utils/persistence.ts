import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../redux/store';

const STATE_KEY = '@movie_explorer_state';

export const saveState = async (state: Partial<RootState>) => {
    try {
        const serializedState = JSON.stringify({
            theme: state.theme,
            movies: {
                movies: state.movies?.movies || [],
            },
            watchlist: {
                items: state.watchlist?.items || [],
            },
        });
        await AsyncStorage.setItem(STATE_KEY, serializedState);
    } catch (err) {
        console.error('Error saving state:', err);
    }
};

export const loadState = async () => {
    try {
        const serializedState = await AsyncStorage.getItem(STATE_KEY);
        if (!serializedState) { return undefined; }
        return JSON.parse(serializedState);
    } catch (err) {
        console.error('Error loading state:', err);
        return undefined;
    }
};
