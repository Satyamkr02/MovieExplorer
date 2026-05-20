import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getTrendingMovies } from '../../api/movieApi';
import { Movie } from '../../types/movie';

interface MovieState {
    movies: Movie[];
    loading: boolean;
    error: string | null;
}

const initialState: MovieState = {
    movies: [],
    loading: false,
    error: null,
};

export const fetchMovies = createAsyncThunk(
    'movies/fetchMovies',
    async (page: number = 1) => {
        const response = await getTrendingMovies(page);
        return response.results;
    },
);

const movieSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchMovies.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMovies.fulfilled, (state, action) => {
                state.loading = false;
                state.movies = action.payload;
            })
            .addCase(fetchMovies.rejected, state => {
                state.loading = false;
                state.error = 'Failed to fetch movies';
            });
    },
});

export default movieSlice.reducer;