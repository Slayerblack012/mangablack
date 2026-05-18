/**
 * MangaPlatform Shared TypeScript Declarations
 * Centralizing types ensures clean code structure and absolute typesafety across services and UI components.
 */

export interface CacheEntry {
  data: any;
  expiry: number;
}

export interface MangaItem {
  id: string;
  title: string;
  description: string;
  status: 'ongoing' | 'completed' | string;
  year?: number;
  contentRating?: string;
  lastChapter?: string | null;
  lastVolume?: string | null;
  coverUrl: string;
  coverUrlHQ: string;
  genres: string[];
  themes?: string[];
  author: string;
  artist: string;
}

export interface BrowseMangaResponse {
  data: MangaItem[];
  total: number;
  offset: number;
  limit: number;
}

export interface ChapterItem {
  id: string;
  chapter: string;
  volume?: string;
  title: string;
  pages?: number;
  lang: string;
  group: string;
}

export interface ChapterFeedResponse {
  data: ChapterItem[];
  total: number;
  availableLanguages: string[];
  offset: number;
  nextOffset: number;
}

export interface ChapterPagesResponse {
  quality: string[];
  dataSaver: string[];
  fallbackActive: boolean;
}

export interface TagItem {
  id: string;
  name: string;
  group: string;
}

export interface BrowseOptions {
  offset?: number;
  limit?: number;
  order?: string | null;
  status?: string | null;
  year?: number | null;
  tags?: string[] | null;
  category?: string | null;
  source?: string | null;
}
