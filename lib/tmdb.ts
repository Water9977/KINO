const BASE_URL = process.env.TMDB_BASE_URL;
const API_KEY = process.env.TMDB_API_KEY;

export const TMDB = {
    getImage: (path: string, size: 'original' | 'w500' = 'original') => {
        return `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL}/${size}${path}`;
    },

    getTrending: async () => {
        const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
        return res.json();
    },

    getNowPlaying: async () => {
        const res = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`);
        return res.json();
    },

    getTopRated: async () => {
        const res = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);
        return res.json();
    },

    getPopular: async () => {
        const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
        return res.json();
    },

    getUpcoming: async () => {
        const res = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);
        return res.json();
    },

    getMoviesByCategory: async (category: string, page: number = 1) => {
        let endpoint = '';
        switch (category) {
            case 'trending':
                endpoint = '/trending/movie/week';
                break;
            case 'now_playing':
                endpoint = '/movie/now_playing';
                break;
            case 'top_rated':
                endpoint = '/movie/top_rated';
                break;
            case 'popular':
                endpoint = '/movie/popular';
                break;
            case 'upcoming':
                endpoint = '/movie/upcoming';
                break;
            default:
                endpoint = '/movie/popular';
        }
        const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&page=${page}`);
        return res.json();
    },

    getTvShowsByCategory: async (category: string, page: number = 1) => {
        let endpoint = '';
        switch (category) {
            case 'trending':
                endpoint = '/trending/tv/week';
                break;
            case 'on_the_air':
                endpoint = '/tv/on_the_air';
                break;
            case 'top_rated':
                endpoint = '/tv/top_rated';
                break;
            case 'popular':
                endpoint = '/tv/popular';
                break;
            case 'airing_today':
                endpoint = '/tv/airing_today';
                break;
            default:
                endpoint = '/tv/popular';
        }
        const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&page=${page}`);
        return res.json();
    },

    search: async (query: string) => {
        const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
        return res.json();
    },

    getDetails: async (id: string, type: 'movie' | 'tv' = 'movie') => {
        const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=videos,credits,similar`);
        return res.json();
    },

    getSeasonDetails: async (tvId: number, seasonNumber: number) => {
        const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
        return res.json();
    },

    discover: async (type: 'movie' | 'tv', sort_by: string = 'popularity.desc', genre_id?: string, page: number = 1, provider_id?: string) => {
        let url = `${BASE_URL}/discover/${type}?api_key=${API_KEY}&page=${page}&sort_by=${sort_by}&watch_region=US`;
        if (genre_id) {
            url += `&with_genres=${genre_id}`;
        }
        if (provider_id) {
            url += `&with_watch_providers=${provider_id}`;
        }
        const res = await fetch(url);
        return res.json();
    },

    getGenres: async (type: 'movie' | 'tv') => {
        const res = await fetch(`${BASE_URL}/genre/${type}/list?api_key=${API_KEY}`);
        return res.json();
    },

    getWatchProviders: async (type: 'movie' | 'tv') => {
        const res = await fetch(`${BASE_URL}/watch/providers/${type}?api_key=${API_KEY}&watch_region=US`);
        return res.json();
    }
};
