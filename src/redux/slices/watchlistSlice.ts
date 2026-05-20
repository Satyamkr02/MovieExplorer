import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Movie } from '../../types/movie';

interface WatchlistState {
    items: Movie[];
}

const initialState: WatchlistState = {
    items: [],
};

const watchlistSlice = createSlice({
    name: 'watchlist',
    initialState,
    reducers: {
        /** Add movie if not present, remove if already in watchlist */
        toggleWatchlist: (state, action: PayloadAction<Movie>) => {
            const idx = state.items.findIndex(m => m.id === action.payload.id);
            if (idx >= 0) {
                state.items.splice(idx, 1);
            } else {
                state.items.unshift(action.payload); // newest first
            }
        },

        clearWatchlist: state => {
            state.items = [];
        },

        /** Restore from AsyncStorage on cold launch */
        rehydrateWatchlist: (state, action: PayloadAction<Movie[]>) => {
            if (state.items.length === 0) {
                state.items = action.payload;
            }
        },
    },
});

export const { toggleWatchlist, clearWatchlist, rehydrateWatchlist } =
    watchlistSlice.actions;

export default watchlistSlice.reducer;
