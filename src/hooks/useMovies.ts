import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import {
    fetchMovies,
    searchMoviesThunk,
    setCurrentPage,
    setHasMore,
} from '../redux/slices/movieSlice';

/**
 * Custom hook encapsulating all movie fetching and pagination logic.
 * Prevents duplicate fetches using a ref-based lock.
 */
export const useMovies = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isFetchingRef = useRef(false);

    const { movies, loading, loadingNextPage, error, currentPage, hasMore } =
        useSelector((state: RootState) => state.movies);

    /** Fetch the first page of trending movies (replaces entire list). */
    const fetchInitial = useCallback(() => {
        dispatch(setCurrentPage(1));
        dispatch(setHasMore(true));
        dispatch(fetchMovies(1));
    }, [dispatch]);

    /** Load the next page of trending movies (appends). */
    const loadNextPage = useCallback(() => {
        if (loading || loadingNextPage || isFetchingRef.current || !hasMore) {
            return;
        }
        isFetchingRef.current = true;
        const nextPage = currentPage + 1;
        dispatch(setCurrentPage(nextPage));
        dispatch(fetchMovies(nextPage)).finally(() => {
            isFetchingRef.current = false;
        });
    }, [dispatch, loading, loadingNextPage, currentPage, hasMore]);

    /** Execute a debounced search query (page 1 only initially). */
    const executeSearch = useCallback(
        (query: string, page: number = 1) => {
            dispatch(searchMoviesThunk({ query, page }));
        },
        [dispatch],
    );

    /** Load more search results for the current query. */
    const loadNextSearchPage = useCallback(
        (query: string) => {
            if (loading || loadingNextPage || isFetchingRef.current || !hasMore) {
                return;
            }
            isFetchingRef.current = true;
            const nextPage = currentPage + 1;
            dispatch(setCurrentPage(nextPage));
            dispatch(searchMoviesThunk({ query, page: nextPage })).finally(() => {
                isFetchingRef.current = false;
            });
        },
        [dispatch, loading, loadingNextPage, currentPage, hasMore],
    );

    return {
        movies,
        loading,
        loadingNextPage,
        error,
        currentPage,
        hasMore,
        fetchInitial,
        loadNextPage,
        executeSearch,
        loadNextSearchPage,
    };
};
