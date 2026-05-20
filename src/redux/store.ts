import { configureStore } from '@reduxjs/toolkit';
import movieReducer from './slices/movieSlice';
import themeReducer from './slices/themeSlice';
import watchlistReducer from './slices/watchlistSlice';

export const store = configureStore({
    reducer: {
        movies: movieReducer,
        theme: themeReducer,
        watchlist: watchlistReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;