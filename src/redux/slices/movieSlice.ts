import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getTrendingMovies, searchMovies } from '../../api/movieApi';
import { Movie } from '../../types/movie';

interface MovieState {
    movies: Movie[];
    loading: boolean;
    loadingNextPage: boolean;
    error: string | null;
}

const initialState: MovieState = {
    movies: [],
    loading: false,
    loadingNextPage: false,
    error: null,
};

export const fetchMovies = createAsyncThunk(
    'movies/fetchMovies',
    async (page: number = 1) => {
        const response = await getTrendingMovies(page);
        return response.results;
    },
);

export const searchMoviesThunk = createAsyncThunk(
    'movies/searchMovies',
    async ({ query, page = 1 }: { query: string; page?: number }) => {
        const response = await searchMovies(query, page);
        return response.results;
    },
);

const movieSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchMovies.pending, (state, action) => {
                if (action.meta.arg === 1) {
                    state.loading = true;
                } else {
                    state.loadingNextPage = true;
                }
                state.error = null;
            })
            .addCase(fetchMovies.fulfilled, (state, action) => {
                state.loading = false;
                state.loadingNextPage = false;
                if (action.meta.arg === 1) {
                    state.movies = action.payload;
                } else {
                    // Prevent duplicate entries
                    const existingIds = new Set(state.movies.map(m => m.id));
                    const newMovies = action.payload.filter(m => !existingIds.has(m.id));
                    state.movies = [...state.movies, ...newMovies];
                }
            })
            .addCase(fetchMovies.rejected, state => {
                state.loading = false;
                state.loadingNextPage = false;
                state.error = 'Failed to fetch movies';
            })
            .addCase(searchMoviesThunk.pending, (state, action) => {
                const page = action.meta.arg.page || 1;
                if (page === 1) {
                    state.loading = true;
                } else {
                    state.loadingNextPage = true;
                }
                state.error = null;
            })
            .addCase(searchMoviesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.loadingNextPage = false;
                const page = action.meta.arg.page || 1;
                if (page === 1) {
                    state.movies = action.payload;
                } else {
                    // Prevent duplicate entries
                    const existingIds = new Set(state.movies.map(m => m.id));
                    const newMovies = action.payload.filter(m => !existingIds.has(m.id));
                    state.movies = [...state.movies, ...newMovies];
                }
            })
            .addCase(searchMoviesThunk.rejected, state => {
                state.loading = false;
                state.loadingNextPage = false;
                state.error = 'Failed to search movies';
            });
    },
});

export default movieSlice.reducer;