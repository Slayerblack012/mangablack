interface CacheEntry {
  data: any;
  expiry: number;
}

class MangadexService {
  private readonly baseUrl = 'https://api.mangadex.org';
  private readonly cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 24 * 3600 * 1000;
  private readonly MAX_CACHE_SIZE = 1000;
  private lastRequestTime = 0;
  private readonly MIN_DELAY_MS = 200;
  private activeProxyRequests = 0;
  private proxyQueue: (() => void)[] = [];

  constructor() {
    setInterval(() => this.cleanupCache(), 3600 * 1000);
  }

  private cleanupCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
      }
    }
  }

  private async getCached(key: string) {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return entry.data;
    }
    if (entry) this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttl: number = this.DEFAULT_TTL) {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, expiry: Date.now() + ttl });
  }

  private async safeGet(url: string, params?: any, skipCache: boolean = false, ttl: number = this.DEFAULT_TTL, retryCount: number = 0): Promise<any> {
    const queryString = new URLSearchParams(this.flattenParams(params || {})).toString();
    const fullUrl = `${url}${queryString ? '?' + queryString : ''}`;
    const cacheKey = 'v2_' + fullUrl;
    
    if (!skipCache) {
      const cached = await this.getCached(cacheKey);
      if (cached) return cached;
    }

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.MIN_DELAY_MS) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_DELAY_MS - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();

    try {
      const response = await fetch(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });

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

  private flattenParams(params: any): Record<string, string> {
    const flat: Record<string, string> = {};
    for (const key in params) {
      if (Array.isArray(params[key])) {
        params[key].forEach((val: any) => {
          if (!flat[`${key}[]`]) flat[`${key}[]`] = val;
          else flat[`${key}[]`] += `&${key}[]=${val}`; // Basic workaround for URLSearchParams with arrays
        });
      } else {
        flat[key] = String(params[key]);
      }
    }
    // Proper URLSearchParams array handling
    const entries: string[][] = [];
    for (const key in params) {
      if (Array.isArray(params[key])) {
        params[key].forEach((val: any) => entries.push([key, String(val)]));
      } else if (params[key] !== undefined) {
        entries.push([key, String(params[key])]);
      }
    }
    return Object.fromEntries(entries) as any; // Temporary fix, let's use the entries directly below
  }

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

  private parseManga(manga: any) {
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
      genres: (manga.attributes?.tags || [])
        .filter((t: any) => t.attributes?.group === 'genre')
        .map((t: any) => t.attributes?.name?.en).filter(Boolean),
      themes: (manga.attributes?.tags || [])
        .filter((t: any) => t.attributes?.group === 'theme')
        .map((t: any) => t.attributes?.name?.en).filter(Boolean),
      author: authorRel?.attributes?.name || 'Unknown Author',
      artist: artistRel?.attributes?.name || 'Unknown Artist',
    };
  }

  async searchManga(title: string) {
    try {
      const qs = this.buildQueryString({
        title, 
        limit: 12,
        'includes[]': ['cover_art'],
        'contentRating[]': ['safe', 'suggestive'],
        hasAvailableChapters: true,
      });
      const data = await this.safeGet(`${this.baseUrl}/manga?${qs}`, {}, false, 3600 * 1000);
      return (data.data || []).map((manga: any) => this.parseManga(manga));
    } catch {
      return [];
    }
  }

  async browseManga(options: { 
    offset?: number; 
    limit?: number; 
    order?: string; 
    status?: string; 
    year?: number; 
    tags?: string[];
    category?: string;
  }) {
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

  async getMangaDetail(mangaDexId: string) {
    try {
      const qs = this.buildQueryString({
        'includes[]': ['cover_art', 'author', 'artist'],
      });
      const data = await this.safeGet(`${this.baseUrl}/manga/${mangaDexId}?${qs}`, {}, false, 60 * 60 * 1000);
      return this.parseManga(data.data);
    } catch (e: any) {
      return null;
    }
  }

  async getChapterFeed(mangaId: string, offset: number = 0, limit: number = 100, lang?: string, order: 'asc' | 'desc' = 'asc') {
    const feedCacheKey = `feed-${mangaId}-${lang || 'all'}`;
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

        do {
          const params: any = {
            limit: 100,
            offset: currentOffset,
            'order[chapter]': 'asc',
            'includes[]': ['scanlation_group', 'manga'],
          };
          if (lang) params['translatedLanguage[]'] = [lang];

          const qs = this.buildQueryString(params);
          const fullData = await this.safeGet(`${this.baseUrl}/manga/${mangaId}/feed?${qs}`, {}, false, 60 * 1000);
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
            title: ch.attributes?.title || (ch.attributes?.chapter ? `Chapter ${ch.attributes?.chapter}` : "Special"),
            pages: ch.attributes?.pages || 0,
            lang: ch.attributes?.translatedLanguage,
            group: ch.relationships?.find((r: any) => r.type === 'scanlation_group')?.attributes?.name || 'Scanlation Group',
          }));

        availableLanguages = Array.from(new Set(parsedChapters.map(ch => ch.lang)));
        const uniqueChaptersMap = new Map<string, any>();
        
        if (lang) {
          parsedChapters.filter(ch => ch.lang === lang).forEach(ch => {
            const key = ch.chapter ? `${ch.volume || 'v'}-${ch.chapter}` : `special-${ch.id}`;
            const existing = uniqueChaptersMap.get(key);
            if (!existing || ch.pages > existing.pages) uniqueChaptersMap.set(key, ch);
          });
        } else {
          const langPriority: any = { 'vi': 3, 'en': 2 };
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
        this.setCache(feedCacheKey, { chapters: filteredChapters, languages: availableLanguages }, 60 * 1000);
      } catch (e: any) {
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

  async getChapterPages(chapterId: string) {
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
    } catch (e: any) {
      return { quality: [], dataSaver: [], fallbackActive: false };
    }
  }

  async getTags() {
    try {
      const data = await this.safeGet(`${this.baseUrl}/manga/tag`);
      return (data.data || []).map((tag: any) => ({
        id: tag.id,
        name: tag.attributes?.name?.en || 'Unknown Tag',
        group: tag.attributes?.group,
      }));
    } catch (e: any) {
      return [];
    }
  }

  async proxyImage(url: string) {
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
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': 'https://mangadex.org/',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        }
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
