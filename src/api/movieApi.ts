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

// ─── Video / Trailer ──────────────────────────────────────────────────────────

export interface MovieVideo {
    id: string;
    key: string;           // YouTube video ID
    name: string;
    site: string;          // "YouTube", "Vimeo", etc.
    type: string;          // "Trailer", "Teaser", "Clip", "Featurette", etc.
    official: boolean;
    published_at: string;
}

export interface MovieVideosResponse {
    id: number;
    results: MovieVideo[];
}

/**
 * Fetches all videos (trailers, teasers, clips) for a given movie.
 * Priority order when picking the best trailer:
 *   1. Official Trailer on YouTube
 *   2. Any Trailer on YouTube
 *   3. Official Teaser on YouTube
 *   4. Any YouTube video
 */
export const getMovieVideos = async (
    movieId: number,
): Promise<MovieVideosResponse> => {
    const response = await movieApi.get(`/movie/${movieId}/videos`);
    return response.data;
};

/**
 * Returns the YouTube URL for the best available trailer.
 * Returns null if no YouTube video is found.
 */
export const getBestTrailerUrl = (videos: MovieVideo[]): string | null => {
    const ytVideos = videos.filter(v => v.site === 'YouTube');
    if (ytVideos.length === 0) { return null; }

    const pick =
        ytVideos.find(v => v.official && v.type === 'Trailer') ??
        ytVideos.find(v => v.type === 'Trailer') ??
        ytVideos.find(v => v.official && v.type === 'Teaser') ??
        ytVideos[0];

    return `https://www.youtube.com/watch?v=${pick.key}`;
};