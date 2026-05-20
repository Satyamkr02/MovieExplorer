import axios from 'axios';
import { BASE_URL, TMDB_API_KEY } from '@env';
import { MovieResponse } from '../types/movie';

const movieApi = axios.create({
    baseURL: BASE_URL,
    params: {
        api_key: TMDB_API_KEY,
    },
});

export const getTrendingMovies = async (
    page = 1,
): Promise<MovieResponse> => {
    const response = await movieApi.get('/trending/movie/week', {
        params: {
            page,
        },
    });

    return response.data;
};

export const searchMovies = async (
    query: string,
    page = 1,
): Promise<MovieResponse> => {
    const response = await movieApi.get('/search/movie', {
        params: {
            query,
            page,
        },
    });

    return response.data;
};

export const getMovieDetails = async (movieId: number) => {
    const response = await movieApi.get(`/movie/${movieId}`);

    return response.data;
};