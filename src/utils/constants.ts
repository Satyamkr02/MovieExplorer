import { Platform } from 'react-native';
import {
    IMAGE_BASE_URL as _IMAGE_BASE_URL,
    BASE_URL as _BASE_URL,
    TMDB_API_KEY as _TMDB_API_KEY,
    TMDB_ACCESS_TOKEN as _TMDB_ACCESS_TOKEN
} from '@env';

const useProxy = Platform.OS === 'android';

export const BASE_URL = useProxy 
    ? 'http://127.0.0.1:8081/tmdb-proxy' 
    : (_BASE_URL || 'https://api.themoviedb.org/3');

export const IMAGE_BASE_URL = useProxy 
    ? 'http://127.0.0.1:8081/tmdb-image-proxy/t/p/w500' 
    : (_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500');

export const TMDB_API_KEY = _TMDB_API_KEY || '';
export const TMDB_ACCESS_TOKEN = _TMDB_ACCESS_TOKEN || '';