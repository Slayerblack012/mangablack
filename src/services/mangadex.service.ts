import { 
  CacheEntry, 
  MangaItem, 
  BrowseMangaResponse, 
  ChapterFeedResponse, 
  ChapterPagesResponse, 
  TagItem, 
  BrowseOptions 
} from './types';
import { getRandomSpoofedHeaders } from '../app/config';

/**
 * MangadexService
 * Full integration engine for the official international MangaDex REST API.
 * Employs automatic rate-limiting throttles, caching logic, and translation prioritization fallbacks.
 */
class MangadexService {
  private readonly baseUrl = 'https://api.mangadex.org';
  private readonly cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 24 * 3600 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 1000;
  
  // Throttle configs to protect client against MangaDex strict 5req/sec limit
  private lastRequestTime = 0;
  private readonly MIN_DELAY_MS = 200;
  
  // Concurrency controls for proxies
  private activeProxyRequests = 0;
  private proxyQueue: (() => void)[] = [];

  constructor() {
    // Schedule periodic expired memory purges
    setInterval(() => this.cleanupCache(), 3600 * 1000);
  }

  /**
   * Remove expired cache mappings
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Read cache entry
   */
  private async getCached(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return entry.data;
    }
    if (entry) this.cache.delete(key);
    return null;
  }

  /**
   * Write cache entry
   */
  private setCache(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, expiry: Date.now() + ttl });
  }

  /**
   * Helper that executes rate-limited HTTP GET requests with custom retries and backoff throttles.
   */
  private async safeGet(
    url: string, 
    params?: any, 
    skipCache: boolean = false, 
    ttl: number = this.DEFAULT_TTL, 
    retryCount: number = 0
  ): Promise<any> {
    const queryString = new URLSearchParams(this.flattenParams(params || {})).toString();
    const fullUrl = `${url}${queryString ? '?' + queryString : ''}`;
    const cacheKey = 'v2_' + fullUrl;
    
    if (!skipCache) {
      const cached = await this.getCached(cacheKey);
      if (cached) return cached;
    }

    // Ensure throttle buffer
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.MIN_DELAY_MS) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_DELAY_MS - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();

    try {
      const response = await fetch(fullUrl, {
        cache: 'no-store',
        headers: getRandomSpoofedHeaders()
      });

      // Handle 429 rate limit responses gracefully
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '5', 10);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return this.safeGet(url, params, skipCache, ttl, retryCount);
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (!skipCache) {
        this.setCache(cacheKey, data, ttl);
      }
      return data;
    } catch (e: any) {
      if (retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.safeGet(url, params, skipCache, ttl, retryCount + 1);
      }
      throw e;
    }
  }

  /**
   * Helper that formats query arrays to standard URL parameters
   */
  private flattenParams(params: any): Record<string, string> {
    const entries: string[][] = [];
    for (const key in params) {
      if (Array.isArray(params[key])) {
        params[key].forEach((val: any) => entries.push([key, String(val)]));
      } else if (params[key] !== undefined) {
        entries.push([key, String(params[key])]);
      }
    }
    return Object.fromEntries(entries) as Record<string, string>;
  }

  /**
   * Generate URL queries
   */
  private buildQueryString(params: any): string {
    const searchParams = new URLSearchParams();
    for (const key in params) {
      if (Array.isArray(params[key])) {
        params[key].forEach((val: any) => searchParams.append(key, String(val)));
      } else if (params[key] !== undefined) {
        searchParams.append(key, String(params[key]));
      }
    }
    return searchParams.toString();
  }

  /**
   * Clean description fields by removing markdown links and boilerplate statements
   */
  private cleanDescription(desc: string): string {
    if (!desc) return '';
    let cleaned = desc.split(/---\s*(?:\*\*|\[)?Links/i)[0];
    const patterns = [
      /Alternative Official English/gi,
      /Official English/gi,
      /Licensed by/gi,
      /Read on/gi,
      /\[.*?\]\(https?:\/\/.*?\)/gi,
      /https?:\/\/.*?\s/gi,
      /\*\*Links:\*\*/gi,
      /---\s*$/gm,
    ];
    patterns.forEach(p => {
      cleaned = cleaned.replace(p, '');
    });
    return cleaned.trim();
  }

  /**
   * Parses raw API data from MangaDex into unified MangaItem format
   */
  private parseManga(manga: any): MangaItem {
    const coverRel = manga.relationships?.find((r: any) => r.type === 'cover_art');
    const authorRel = manga.relationships?.find((r: any) => r.type === 'author');
    const artistRel = manga.relationships?.find((r: any) => r.type === 'artist');
    const fileName = coverRel?.attributes?.fileName;

    const titles = manga.attributes?.title || {};
    const altTitles = manga.attributes?.altTitles || [];

    let title = titles.en || titles['ja-ro'] || titles.ja;
    if (!title) {
      for (const alt of altTitles) {
        if (alt.en) { title = alt.en; break; }
        if (alt['ja-ro']) { title = alt['ja-ro']; break; }
      }
    }
    if (!title) title = Object.values(titles)[0] || 'Unknown';

    const desc = manga.attributes?.description || {};
    let description = desc.en || desc['ja-ro'] || desc.ja || '';
    if (!description) {
      const firstDesc = Object.values(desc)[0];
      if (typeof firstDesc === 'string') description = firstDesc;
    }

    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    let lastChap = manga.attributes?.lastChapter || manga.attributes?.latestUploadedChapter;
    if (lastChap && isUUID(lastChap)) lastChap = null;

    const genres = (manga.attributes?.tags || [])
      .filter((t: any) => t.attributes?.group === 'genre')
      .map((t: any) => t.attributes?.name?.en).filter(Boolean);

    const themes = (manga.attributes?.tags || [])
      .filter((t: any) => t.attributes?.group === 'theme')
      .map((t: any) => t.attributes?.name?.en).filter(Boolean);

    return {
      id: manga.id,
      title: title as string,
      description: this.cleanDescription(description as string).slice(0, 5000),
      status: manga.attributes?.status || 'ongoing',
      year: manga.attributes?.year,
      contentRating: manga.attributes?.contentRating,
      lastChapter: lastChap,
      lastVolume: manga.attributes?.lastVolume,
      coverUrl: fileName ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg` : '',
      coverUrlHQ: fileName ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}` : '',
      genres,
      themes,
      author: authorRel?.attributes?.name || 'Unknown Author',
      artist: artistRel?.attributes?.name || 'Unknown Artist',
    };
  }

  /**
   * Search manga by keyword title
   */
  async searchManga(title: string): Promise<MangaItem[]> {
    try {
      const qs = this.buildQueryString({
        title, 
        limit: 12,
        'includes[]': ['cover_art'],
        'contentRating[]': ['safe', 'suggestive'],
        hasAvailableChapters: true,
      });
      const data = await this.safeGet(`${this.baseUrl}/manga?${qs}`, {}, false, 10 * 1000);
      return (data.data || []).map((manga: any) => this.parseManga(manga));
    } catch {
      return [];
    }
  }

  /**
   * Browse lists of manga by filters
   */
  async browseManga(options: BrowseOptions): Promise<BrowseMangaResponse> {
    try {
      const { offset = 0, limit = 24, order = 'popular', status, year, tags, category } = options;
      const params: any = {
        limit: Math.min(limit, 100),
        offset,
        'includes[]': ['cover_art', 'author', 'artist'],
        'contentRating[]': ['safe', 'suggestive'],
        hasAvailableChapters: true,
      };

      if (order === 'latest') {
        params['order[latestUploadedChapter]'] = 'desc';
      } else if (order === 'rating') {
        params['order[rating]'] = 'desc';
      } else {
        params['order[followedCount]'] = 'desc';
      }

      if (status) params['status[]'] = [status];
      if (year) params.year = year;
      if (tags && tags.length > 0) {
        params['includedTags[]'] = tags;
      } else if (category) {
        params['includedTags[]'] = [category];
      }

      const isLatest = params['order[latestUploadedChapter]'] === 'desc';
      const ttl = isLatest ? 300 * 1000 : this.DEFAULT_TTL;

      const qs = this.buildQueryString(params);
      const data = await this.safeGet(`${this.baseUrl}/manga?${qs}`, {}, false, ttl);
      return {
        data: (data.data || []).map((manga: any) => this.parseManga(manga)),
        total: data.total || 0,
        offset,
        limit,
      };
    } catch {
      return { data: [], total: 0, offset: 0, limit: 24 };
    }
  }

  /**
   * Fetch comic details by ID
   */
  async getMangaDetail(mangaDexId: string, bypassCache: boolean = false): Promise<MangaItem | null> {
    try {
      const qs = this.buildQueryString({
        'includes[]': ['cover_art', 'author', 'artist'],
      });
      if (bypassCache) {
        this.cache.delete('v2_' + `${this.baseUrl}/manga/${mangaDexId}?${qs}`);
      }
      const data = await this.safeGet(`${this.baseUrl}/manga/${mangaDexId}?${qs}`, {}, bypassCache, 15 * 1000);
      return this.parseManga(data.data);
    } catch {
      return null;
    }
  }

  /**
   * Fetch chapter list feed (handles sorting, languages priority and deduplication)
   */
  async getChapterFeed(
    mangaId: string, 
    offset: number = 0, 
    limit: number = 100, 
    lang?: string, 
    order: 'asc' | 'desc' = 'asc', 
    bypassCache: boolean = false
  ): Promise<ChapterFeedResponse> {
    const feedCacheKey = `feed-${mangaId}-${lang || 'all'}`;
    if (bypassCache) {
      this.cache.delete(feedCacheKey);
      this.cache.delete(`feed-${mangaId}-all`);
    }
    const cachedFeed = await this.getCached(feedCacheKey);
    
    let filteredChapters: any[];
    let availableLanguages: string[];

    if (cachedFeed) {
      filteredChapters = cachedFeed.chapters;
      availableLanguages = cachedFeed.languages;
    } else {
      try {
        const allRaw: any[] = [];
        let currentOffset = 0;
        let apiTotal = 0;

        // Exhaustive feed loop to retrieve all updates
        do {
          const params: any = {
            limit: 100,
            offset: currentOffset,
            'order[chapter]': 'asc',
            'includes[]': ['scanlation_group', 'manga'],
          };
          if (lang) params['translatedLanguage[]'] = [lang];

          const qs = this.buildQueryString(params);
          const fullData = await this.safeGet(`${this.baseUrl}/manga/${mangaId}/feed?${qs}`, {}, bypassCache, 5 * 1000);
          const batch = fullData.data || [];
          allRaw.push(...batch);
          
          apiTotal = fullData.total || 0;
          currentOffset += batch.length;
          if (batch.length === 0 || currentOffset >= apiTotal) break;
        } while (currentOffset < apiTotal);

        const parsedChapters = allRaw
          .filter(ch => !ch.attributes?.externalUrl)
          .map(ch => ({
            id: ch.id,
            chapter: ch.attributes?.chapter,
            volume: ch.attributes?.volume,
            title: ch.attributes?.title || (ch.attributes?.chapter ? `Chương ${ch.attributes?.chapter}` : "Đặc biệt"),
            pages: ch.attributes?.pages || 0,
            lang: ch.attributes?.translatedLanguage,
            group: ch.relationships?.find((r: any) => r.type === 'scanlation_group')?.attributes?.name || 'Vô Danh',
          }));

        const langCounts: Record<string, number> = {};
        parsedChapters.forEach(ch => {
          if (ch.lang) {
            langCounts[ch.lang] = (langCounts[ch.lang] || 0) + 1;
          }
        });

        availableLanguages = Array.from(new Set(parsedChapters.map(ch => ch.lang)));
        availableLanguages.sort((a, b) => {
          if (a === 'vi') return -1;
          if (b === 'vi') return 1;
          if (a === 'en') return -1;
          if (b === 'en') return 1;
          return (langCounts[b] || 0) - (langCounts[a] || 0);
        });

        const uniqueChaptersMap = new Map<string, any>();
        
        if (lang) {
          parsedChapters.filter(ch => ch.lang === lang).forEach(ch => {
            const key = ch.chapter ? `${ch.volume || 'v'}-${ch.chapter}` : `special-${ch.id}`;
            const existing = uniqueChaptersMap.get(key);
            if (!existing || ch.pages > existing.pages) uniqueChaptersMap.set(key, ch);
          });
        } else {
          // Automatic Language Priority: Vietnamese -> English -> Other
          const langPriority: Record<string, number> = { 'vi': 3, 'en': 2 };
          for (const ch of parsedChapters) {
            const key = ch.chapter ? `${ch.volume || 'v'}-${ch.chapter}` : `special-${ch.id}`;
            const existing = uniqueChaptersMap.get(key);
            const currentLangPrio = langPriority[ch.lang] || 1;
            const existingLangPrio = existing ? (langPriority[existing.lang] || 1) : 0;
            if (!existing || (currentLangPrio > existingLangPrio) || (currentLangPrio === existingLangPrio && ch.pages > existing.pages)) {
              uniqueChaptersMap.set(key, ch);
            }
          }
        }

        filteredChapters = Array.from(uniqueChaptersMap.values());
        filteredChapters.sort((a, b) => (parseFloat(a.chapter) || 0) - (parseFloat(b.chapter) || 0));
        this.setCache(feedCacheKey, { chapters: filteredChapters, languages: availableLanguages }, 5 * 1000);
      } catch {
        return { data: [], total: 0, availableLanguages: [], offset, nextOffset: offset };
      }
    }

    const finalChapters = [...filteredChapters];
    if (order === 'desc') finalChapters.reverse();
    const slicedChapters = finalChapters.slice(offset, offset + limit);

    return {
      data: slicedChapters,
      total: finalChapters.length,
      availableLanguages,
      offset,
      nextOffset: offset + slicedChapters.length,
    };
  }

  /**
   * Fetch chapter page asset URLs from MangaDex At-Home server network
   */
  async getChapterPages(chapterId: string): Promise<ChapterPagesResponse> {
    try {
      const qs = this.buildQueryString({ forcePort443: true });
      const data = await this.safeGet(`${this.baseUrl}/at-home/server/${chapterId}?${qs}`, {}, false, 120 * 1000);
      const host = data.baseUrl;
      const { hash, data: files, dataSaver } = data.chapter;

      return {
        quality: (files || []).map((file: string) => `${host}/data/${hash}/${file}`),
        dataSaver: (dataSaver || []).map((file: string) => `${host}/data-saver/${hash}/${file}`),
        fallbackActive: (files || []).length === 0
      };
    } catch {
      return { quality: [], dataSaver: [], fallbackActive: false };
    }
  }

  /**
   * Fetch tag definitions
   */
  async getTags(): Promise<TagItem[]> {
    try {
      const data = await this.safeGet(`${this.baseUrl}/manga/tag`);
      return (data.data || []).map((tag: any) => ({
        id: tag.id,
        name: tag.attributes?.name?.en || 'Unknown Tag',
        group: tag.attributes?.group,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Whitelisted proxy client ensuring private IP addresses block and secure image stream
   */
  async proxyImage(url: string): Promise<Response> {
    if (!url) throw new Error('No URL provided');
    const decodedUrl = decodeURIComponent(url);
    const parsedUrl = new URL(decodedUrl);
    
    const hostname = parsedUrl.hostname.toLowerCase();
    const isValidDomain = hostname === 'mangadex.org' || 
                          hostname.endsWith('.mangadex.org') || 
                          hostname === 'mangadex.network' || 
                          hostname.endsWith('.mangadex.network');
                          
    if (!isValidDomain) {
      throw new Error('Forbidden: Untrusted domain');
    }

    const isPrivate = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(parsedUrl.hostname);
    if (isPrivate || parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '0.0.0.0') {
      throw new Error('Forbidden: Internal address');
    }

    if (this.activeProxyRequests >= 3) {
      await new Promise<void>(resolve => {
        this.proxyQueue.push(resolve);
      });
    }
    this.activeProxyRequests++;

    try {
      const result = await fetch(decodedUrl, {
        headers: getRandomSpoofedHeaders({
          'Referer': 'https://mangadex.org/',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        })
      });
      
      setTimeout(() => {
        this.activeProxyRequests--;
        if (this.proxyQueue.length > 0) this.proxyQueue.shift()!();
      }, 330);
      
      return result;
    } catch (err) {
      this.activeProxyRequests--;
      if (this.proxyQueue.length > 0) this.proxyQueue.shift()!();
      throw err;
    }
  }
}

export const mangadexService = new MangadexService();
