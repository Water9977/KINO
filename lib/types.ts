export interface MediaItem {
    id: string;
    title: string;
    poster: string;
    type: 'movie' | 'tv';
    year?: string;
    url: string; // The scraping URL
}

export interface StreamSource {
    quality: string; // e.g., "1080p", "720p"
    url: string;
    isM3U8: boolean;
}

export interface MediaDetails extends MediaItem {
    description: string;
    rating?: string;
    genres: string[];
    episodes?: Episode[];
}

export interface Episode {
    id: string;
    number: number;
    title: string;
    url: string;
}

export interface Provider {
    name: string;
    baseUrl: string;
    search(query: string): Promise<MediaItem[]>;
    getDetails(id: string): Promise<MediaDetails>;
    getSources(episodeId: string): Promise<StreamSource[]>;
}
