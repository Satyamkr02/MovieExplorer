import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getTrendingMovies, searchMovies } from '../../api/movieApi';
import { Movie } from '../../types/movie';

interface MovieState {
    movies: Movie[];
    loading: boolean;
    loadingNextPage: boolean;
    error: string | null;
    currentPage: number;
    hasMore: boolean;
}

const initialState: MovieState = {
    movies: [],
    loading: false,
    loadingNextPage: false,
    error: null,
    currentPage: 1,
    hasMore: true,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchMovies = createAsyncThunk(
    'movies/fetchMovies',
    async (page: number = 1) => {
        const response = await getTrendingMovies(page);
        return { results: response.results, page, totalPages: response.total_pages };
    },
);

export const searchMoviesThunk = createAsyncThunk(
    'movies/searchMovies',
    async ({ query, page = 1 }: { query: string; page?: number }) => {
        const response = await searchMovies(query, page);
        return { results: response.results, page, totalPages: response.total_pages };
    },
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const movieSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {
        rehydrateMovies: (state, action: PayloadAction<Movie[]>) => {
            if (state.movies.length === 0) {
                state.movies = action.payload;
            }
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setHasMore: (state, action: PayloadAction<boolean>) => {
            state.hasMore = action.payload;
        },
        clearMovies: (state) => {
            state.movies = [];
            state.currentPage = 1;
            state.hasMore = true;
            state.error = null;
        },
    },
    extraReducers: builder => {
        // ── fetchMovies ──────────────────────────────────────────────────────
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
                const { results, page, totalPages } = action.payload;
                state.hasMore = page < totalPages;

                if (page === 1) {
                    state.movies = results;
                } else {
                    // Deduplicate by ID before appending
                    const existingIds = new Set(state.movies.map(m => m.id));
                    const newMovies = results.filter(m => !existingIds.has(m.id));
                    state.movies = [...state.movies, ...newMovies];
                }
            })
            .addCase(fetchMovies.rejected, state => {
                state.loading = false;
                state.loadingNextPage = false;
                state.error = 'Failed to load movies. Please check your connection.';
            });

        // ── searchMoviesThunk ────────────────────────────────────────────────
        builder
            .addCase(searchMoviesThunk.pending, (state, action) => {
                const page = action.meta.arg.page ?? 1;
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
                const { results, page, totalPages } = action.payload;
                state.hasMore = page < totalPages;

                if (page === 1) {
                    state.movies = results;
                } else {
                    const existingIds = new Set(state.movies.map(m => m.id));
                    const newMovies = results.filter(m => !existingIds.has(m.id));
                    state.movies = [...state.movies, ...newMovies];
                }
            })
            .addCase(searchMoviesThunk.rejected, state => {
                state.loading = false;
                state.loadingNextPage = false;
                state.error = 'Search failed. Please try again.';
            });
    },
});

export const { rehydrateMovies, setCurrentPage, setHasMore, clearMovies } = movieSlice.actions;
export default movieSlice.reducer;