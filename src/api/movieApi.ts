import axios from 'axios';
import { BASE_URL, TMDB_API_KEY } from '../utils/constants';
import { MovieResponse } from '../types/movie';

const movieApi = axios.create({
    baseURL: BASE_URL,
    timeout: 15000, // 15 second timeout
    params: {
        api_key: TMDB_API_KEY,
    },
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'MovieExplorer/1.0.0 (Mobile)',
    },
});

console.log('[movieApi] BASE_URL:', BASE_URL, 'API_KEY length:', TMDB_API_KEY ? TMDB_API_KEY.length : 0, 'API_KEY:', TMDB_API_KEY);

// Log errors for debugging — check Metro / Logcat output
movieApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error(
                '[movieApi] HTTP Error:',
                error.response.status,
                error.response.data,
            );
        } else if (error.code === 'ECONNABORTED') {
            console.error('[movieApi] Timeout — request took too long');
        } else {
            console.error(
                '[movieApi] Network Error:',
                error.message,
                'Code:', error.code,
                'URL:', `${error.config?.baseURL}${error.config?.url}`,
            );
        }
        return Promise.reject(error);
    }
);

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