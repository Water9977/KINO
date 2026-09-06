/**
 * TMDB API response types.
 *
 * These cover only the fields Kino actually reads. TMDB returns a great deal
 * more; adding a field here is the way to start using it safely.
 */

export type MediaType = 'movie' | 'tv';

/** A single item as it appears in a list/search/discover response. */
export interface TmdbListItem {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview?: string;
    vote_average: number;
    vote_count?: number;
    popularity?: number;
    release_date?: string;
    first_air_date?: string;
    media_type?: string;
}

/** Standard paginated TMDB list response. */
export interface TmdbListResponse<T = TmdbListItem> {
    page?: number;
    results: T[];
    total_pages?: number;
    total_results?: number;
    /** Present (and false) only on our own error fallback. */
    success?: boolean;
}

export interface TmdbGenre {
    id: number;
    name: string;
}

export interface TmdbGenreResponse {
    genres: TmdbGenre[];
    success?: boolean;
}

export interface TmdbWatchProvider {
    provider_id: number;
    provider_name: string;
    display_priority: number;
}

export interface TmdbProviderResponse {
    results: TmdbWatchProvider[];
    success?: boolean;
}

export interface TmdbCastMember {
    id: number;
    name: string;
    character?: string;
    profile_path: string | null;
}

export interface TmdbCrewMember {
    id: number;
    name: string;
    job: string;
}

export interface TmdbSeasonSummary {
    id: number;
    season_number: number;
    name?: string;
    episode_count?: number;
}

export interface TmdbEpisode {
    id: number;
    episode_number: number;
    season_number?: number;
    name: string;
    overview?: string;
    still_path: string | null;
}

export interface TmdbSeasonDetails {
    id?: number;
    season_number?: number;
    episodes?: TmdbEpisode[];
    success?: boolean;
}

export interface TmdbProductionCountry {
    iso_3166_1: string;
    name?: string;
}

/** `/{type}/{id}?append_to_response=videos,credits,similar,recommendations` */
export interface TmdbDetails {
    id: number;
    title?: string;
    name?: string;
    overview?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average?: number;
    vote_count?: number;
    release_date?: string;
    first_air_date?: string;
    runtime?: number;
    episode_run_time?: number[];
    original_language?: string;
    genres?: TmdbGenre[];
    seasons?: TmdbSeasonSummary[];
    production_countries?: TmdbProductionCountry[];
    credits?: {
        cast?: TmdbCastMember[];
        crew?: TmdbCrewMember[];
    };
    similar?: TmdbListResponse;
    recommendations?: TmdbListResponse;
    /** Present (and false) only on our own error fallback. */
    success?: boolean;
}
