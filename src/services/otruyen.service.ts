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
 * OtruyenService
 * Direct crawler client interfacing with OTruyen Vietnamese Manga APIs.
 * Supports smart cache bypass, local storage fallbacks, and concurrent image streaming gateways.
 */
class OtruyenService {
  private readonly baseUrl = 'https://otruyenapi.com/v1/api';
  private readonly cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 24 * 3600 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 1000;
  
  // Rate-limiting image proxy queue settings
  private activeProxyRequests = 0;
  private proxyQueue: (() => void)[] = [];

  constructor() {
    // Schedule periodic cache purging
    setInterval(() => this.cleanupCache(), 3600 * 1000);
  }

  /**
   * Purge expired cache items
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
   * Retrieve active cache entry if unexpired
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
   * Store item in temporary crawler memory cache
   */
  private setCache(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, expiry: Date.now() + ttl });
  }

  /**
   * Parses raw API data from OTruyen into unified MangaItem format
   */
  private parseManga(comic: any, basePath?: string): MangaItem {
    let cover = comic.thumb_url || comic.cover_url || '';
    if (cover && !cover.startsWith('http')) {
      if (basePath) {
        // If the path already has "uploads/comics/", extract base domain to prevent duplicate folder nesting
        const isStandardUpload = cover.startsWith('uploads/comics/') || cover.startsWith('/uploads/comics/');
        if (isStandardUpload) {
          try {
            const domainUrl = new URL(basePath).origin;
            const cleanPath = cover.startsWith('/') ? cover.slice(1) : cover;
            cover = `${domainUrl}/${cleanPath}`;
          } catch {
            const cleanSlash = (basePath.endsWith('/') || cover.startsWith('/')) ? '' : '/';
            cover = `${basePath}${cleanSlash}${cover}`;
          }
        } else {
          const cleanSlash = (basePath.endsWith('/') || cover.startsWith('/')) ? '' : '/';
          cover = `${basePath}${cleanSlash}${cover}`;
        }
      }
    }
    
    const genres: string[] = (comic.category || []).map((c: any) => c.name);
    const author = (comic.author && comic.author.length > 0 && comic.author[0] !== 'Đang cập nhật') 
      ? comic.author.join(', ') 
      : 'Đang cập nhật';

    return {
      id: comic.slug,
      title: comic.name,
      description: (comic.content || '').replace(/<[^>]*>?/gm, '').slice(0, 5000),
      status: comic.status === 'ongoing' ? 'ongoing' : 'completed',
      year: comic.createdAt ? new Date(comic.createdAt).getFullYear() : undefined,
      lastChapter: comic.chaptersLatest?.[0]?.chapter_name || undefined,
      coverUrl: cover || '',
      coverUrlHQ: cover || '',
      genres,
      themes: [],
      author,
      artist: 'Đang cập nhật',
    };
  }

  /**
   * Search manga by keywords
   */
  async searchManga(title: string): Promise<MangaItem[]> {
    const cacheKey = `otruyen-search-${title}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      let response: any;
      // Implement retry buffer
      for (let i = 0; i < 3; i++) {
        try {
          const res = await fetch(`${this.baseUrl}/tim-kiem?keyword=${encodeURIComponent(title)}`, {
            cache: 'no-store',
            headers: getRandomSpoofedHeaders()
          });
          if (res.ok) {
            response = await res.json();
            if (response.data?.items && response.data.items.length > 0) break;
          }
        } catch (e) {}
        if (i < 2) await new Promise(r => setTimeout(r, 800));
      }
      
      if (!response || !response.data?.items) return [];

      const domain = response.data?.APP_DOMAIN_CDN_IMAGE || 'https://img.otruyenapi.com';
      const parsedList = (response.data.items || [])
        .map((item: any) => this.parseManga(item, `${domain}/uploads/comics`));
      
      if (parsedList.length > 0) {
        this.setCache(cacheKey, parsedList, 30 * 1000); // 30s search cache
      }
      return parsedList;
    } catch {
      return [];
    }
  }

  /**
   * Browse lists of manga by categorizations/filters
   */
  async browseManga(options: BrowseOptions): Promise<BrowseMangaResponse> {
    const { offset = 0, limit = 24, order = 'popular', category } = options;
    const page = Math.floor(offset / limit) + 1;

    let endpoint = 'danh-sach/truyen-moi';
    if (category) {
      endpoint = `the-loai/${category}`;
    } else if (order === 'popular') {
      endpoint = 'danh-sach/hoan-thanh';
    }
    
    const cacheKey = `otruyen-${endpoint}-${page}`;
    const cached = await this.getCached(cacheKey);
    if (cached) {
      cached.offset = offset;
      cached.limit = limit;
      return cached;
    }

    try {
      let response: any;
      for (let i = 0; i < 3; i++) {
        try {
          const res = await fetch(`${this.baseUrl}/${endpoint}?page=${page}`, {
            cache: 'no-store',
            headers: getRandomSpoofedHeaders()
          });
          if (res.ok) {
            response = await res.json();
            if (response.data?.items && response.data.items.length > 0) break;
          }
        } catch (e) {}
        if (i < 2) await new Promise(r => setTimeout(r, 800));
      }

      if (!response || !response.data?.items) throw new Error('API failed');

      const domain = response.data?.APP_DOMAIN_CDN_IMAGE || 'https://img.otruyenapi.com';
      const parsedList = (response.data.items || [])
        .map((item: any) => this.parseManga(item, `${domain}/uploads/comics`));
      
      const result = {
        data: parsedList,
        total: (response.data?.params?.pagination?.totalItems) || 1000,
        offset,
        limit,
      };

      if (parsedList.length > 0) {
        this.setCache(cacheKey, result, 10 * 1000); // 10s lists cache
      }
      return result;
    } catch {
      return { data: [], total: 0, offset, limit };
    }
  }

  /**
   * Fetch complete details of a comic by its slug
   */
  async getMangaDetail(slug: string, bypassCache: boolean = false): Promise<MangaItem | null> {
    const cacheKey = `otruyen-detail-${slug}`;
    if (bypassCache) {
      this.cache.delete(cacheKey);
    }
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      let response: any;
      for (let i = 0; i < 3; i++) {
        try {
          const res = await fetch(`${this.baseUrl}/truyen-tranh/${slug}`, {
            cache: 'no-store',
            headers: getRandomSpoofedHeaders()
          });
          if (res.ok) {
            response = await res.json();
            if (response.data?.item) break;
          }
        } catch (e) {}
        if (i < 2) await new Promise(r => setTimeout(r, 800));
      }
      
      if (!response || !response.data?.item) return null;

      const domain = response.data?.APP_DOMAIN_CDN_IMAGE || 'https://img.otruyenapi.com';
      const parsed = this.parseManga(response.data.item, `${domain}/uploads/comics`);
      
      if (parsed) {
        this.setCache(cacheKey, parsed, 15 * 1000); // 15s cache
      }
      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * Retrieve list of chapters (deduplicated across different hosting servers)
   */
  async getChapterFeed(
    slug: string, 
    offset: number = 0, 
    limit: number = 100, 
    order: 'asc' | 'desc' = 'asc', 
    bypassCache: boolean = false
  ): Promise<ChapterFeedResponse> {
    const cacheKey = `otruyen-feed-v2-${slug}`;
    if (bypassCache) {
      this.cache.delete(cacheKey);
    }
    let cachedFeed = await this.getCached(cacheKey);
    
    if (!cachedFeed) {
      try {
        let response: any;
        for (let i = 0; i < 3; i++) {
          try {
            const res = await fetch(`${this.baseUrl}/truyen-tranh/${slug}`, {
              cache: 'no-store',
              headers: getRandomSpoofedHeaders()
            });
            if (res.ok) {
              response = await res.json();
              if (response.data?.item?.chapters) break;
            }
          } catch (e) {}
          if (i < 2) await new Promise(r => setTimeout(r, 800));
        }

        if (!response || !response.data?.item) throw new Error('API failed');

        let servers = response.data.item.chapters || [];
        
        // --- SMART ALT-TITLE SEARCH FALLBACK FOR "0 CHAPTERS" CRAWL BUG ---
        if (servers.length === 0 || (servers.length === 1 && (!servers[0].server_data || servers[0].server_data.length === 0))) {
          const mangaTitle = response.data.item.name || '';
          if (mangaTitle) {
            try {
              const searchRes = await fetch(`${this.baseUrl}/tim-kiem?keyword=${encodeURIComponent(mangaTitle)}`, {
                cache: 'no-store',
                headers: getRandomSpoofedHeaders()
              });
              if (searchRes.ok) {
                const searchData = await searchRes.json();
                const searchItems = searchData.data?.items || [];
                for (const item of searchItems) {
                  if (item.slug !== slug) {
                    const altRes = await fetch(`${this.baseUrl}/truyen-tranh/${item.slug}`, {
                      cache: 'no-store',
                      headers: getRandomSpoofedHeaders()
                    });
                    if (altRes.ok) {
                      const altData = await altRes.json();
                      const altChapters = altData?.data?.item?.chapters || [];
                      const hasAltChapters = altChapters.some((s: any) => s.server_data && s.server_data.length > 0);
                      if (hasAltChapters) {
                        servers = altChapters;
                        break;
                      }
                    }
                  }
                }
              }
            } catch (e) {
              console.error('Smart fallback search failed in OtruyenService:', e);
            }
          }
        }
        // ------------------------------------------------------------------

        const uniqueChaptersMap = new Map<string, any>();
        
        // Merge chapters from all server CDN networks to prevent missing updates
        for (const srv of servers) {
          const srvData = srv.server_data || [];
          for (const ch of srvData) {
            if (!ch.chapter_name) continue;
            const existing = uniqueChaptersMap.get(ch.chapter_name);
            if (!existing || (!existing.chapter_api_data && ch.chapter_api_data)) {
              uniqueChaptersMap.set(ch.chapter_name, ch);
            }
          }
        }

        const serverData = Array.from(uniqueChaptersMap.values());
        const chapters = serverData.map((ch: any) => {
          const apiUrl = ch.chapter_api_data || '';
          const idParts = apiUrl.split('/');
          const cleanId = idParts[idParts.length - 1];
          
          return {
            id: cleanId,
            chapter: ch.chapter_name,
            title: ch.chapter_title || `Chương ${ch.chapter_name}`,
            lang: 'vi',
            group: 'Hệ Thống',
          };
        });

        cachedFeed = { chapters };
        this.setCache(cacheKey, cachedFeed, 5 * 1000); // 5s short cache for feed sync
      } catch {
        return { data: [], total: 0, availableLanguages: ['vi'], offset, nextOffset: offset };
      }
    }

    const finalChapters = [...cachedFeed.chapters];
    if (order === 'desc') finalChapters.reverse();
    const slicedChapters = finalChapters.slice(offset, offset + limit);

    return {
      data: slicedChapters,
      total: finalChapters.length,
      availableLanguages: ['vi'],
      offset,
      nextOffset: offset + slicedChapters.length,
    };
  }

  /**
   * Fetch chapter page asset URLs from CDN server
   */
  async getChapterPages(chapterId: string): Promise<ChapterPagesResponse> {
    try {
      let response: any;
      for (let i = 0; i < 3; i++) {
        try {
          const res = await fetch(`https://sv1.otruyencdn.com/v1/api/chapter/${chapterId}`, {
            cache: 'no-store',
            headers: getRandomSpoofedHeaders()
          });
          if (res.ok) {
            response = await res.json();
            if (response.data?.item?.chapter_image) break;
          }
        } catch (e) {}
        if (i < 2) await new Promise(r => setTimeout(r, 800));
      }
      
      if (!response || !response.data?.item) throw new Error('CDN failed');

      const domain = response.data.domain_cdn || '';
      const path = response.data.item.chapter_path || '';
      const images = (response.data.item.chapter_image || []).map((img: any) => 
        `${domain}/${path}/${img.image_file}`
      );

      return {
        quality: images,
        dataSaver: images,
        fallbackActive: false,
      };
    } catch (e: any) {
      console.error('OTruyen Pages Fetch Error:', e.message);
      return { quality: [], dataSaver: [], fallbackActive: false };
    }
  }

  /**
   * Fetch tags (the-loai list)
   */
  async getTags(): Promise<TagItem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/the-loai`, {
        cache: 'no-store',
        headers: getRandomSpoofedHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const response = await res.json();

      return (response.data?.items || []).map((tag: any) => ({
        id: tag.slug,
        name: tag.name,
        group: 'genre',
      }));
    } catch {
      return [];
    }
  }

  /**
   * Proxy image streamer with strict domain whitelist & private address blocking
   */
  async proxyImage(url: string): Promise<Response> {
    if (!url) throw new Error('No URL provided');
    const decodedUrl = decodeURIComponent(url);
    const parsedUrl = new URL(decodedUrl);

    const hostname = parsedUrl.hostname.toLowerCase();
    const isValidDomain = hostname === 'otruyenapi.com' || 
                          hostname.endsWith('.otruyenapi.com') || 
                          hostname === 'otruyencdn.com' || 
                          hostname.endsWith('.otruyencdn.com');
                          
    if (!isValidDomain) {
      throw new Error('Forbidden: Untrusted domain');
    }

    const isPrivate = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(parsedUrl.hostname);
    if (isPrivate || parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '0.0.0.0') {
      throw new Error('Forbidden: Internal address');
    }

    // Direct proxy queues to throttle requests under rate-limits
    if (this.activeProxyRequests >= 3) {
      await new Promise<void>(resolve => {
        this.proxyQueue.push(resolve);
      });
    }
    this.activeProxyRequests++;

    try {
      const result = await fetch(decodedUrl, {
        headers: getRandomSpoofedHeaders({
          'Referer': 'https://otruyenapi.com/',
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

export const otruyenService = new OtruyenService();
