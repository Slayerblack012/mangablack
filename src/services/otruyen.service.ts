interface CacheEntry {
  data: any;
  expiry: number;
}

class OtruyenService {
  private readonly baseUrl = 'https://otruyenapi.com/v1/api';
  private readonly cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 24 * 3600 * 1000;
  private readonly MAX_CACHE_SIZE = 1000;
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

  private buildQueryString(params: any): string {
    const searchParams = new URLSearchParams();
    for (const key in params) {
      if (params[key] !== undefined) {
        searchParams.append(key, String(params[key]));
      }
    }
    return searchParams.toString();
  }

  private parseManga(comic: any, basePath?: string) {
    let cover = comic.thumb_url || comic.cover_url || '';
    if (cover && !cover.startsWith('http') && basePath) {
      cover = `${basePath}/${cover}`;
    }
    const genres = (comic.category || []).map((c: any) => c.name);
    const author = (comic.author && comic.author.length > 0 && comic.author[0] !== 'Đang cập nhật') 
      ? comic.author.join(', ') : 'Unknown Author';

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
      artist: 'Unknown Artist',
    };
  }

  async searchManga(title: string) {
    const cacheKey = `otruyen-search-${title}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      let response;
      for (let i = 0; i < 3; i++) {
        try {
          const res = await fetch(`${this.baseUrl}/tim-kiem?keyword=${encodeURIComponent(title)}`, { cache: 'no-store' });
          if (res.ok) {
            response = await res.json();
            if (response.data?.items && response.data.items.length > 0) break;
          }
        } catch (e) {}
        if (i < 2) await new Promise(r => setTimeout(r, 800));
      }
      
      if (!response || !response.data?.items) return [];

      const domain = response.data?.APP_DOMAIN_CDN_IMAGE || 'https://img.otruyenapi.com';
      const path = (response.data.items || [])
        .map((item: any) => this.parseManga(item, `${domain}/uploads/comics`));
      
      if (path.length > 0) {
        this.setCache(cacheKey, path, 30 * 1000);
      }
      return path;
    } catch {
      return [];
    }
  }

  async browseManga(options: { 
    offset?: number; 
    limit?: number; 
    order?: string; 
    tags?: string[];
    category?: string;
  }) {
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
      let response;
      for (let i = 0; i < 3; i++) {
        try {
          const res = await fetch(`${this.baseUrl}/${endpoint}?page=${page}`, { cache: 'no-store' });
          if (res.ok) {
            response = await res.json();
            if (response.data?.items && response.data.items.length > 0) break;
          }
        } catch (e) {}
        if (i < 2) await new Promise(r => setTimeout(r, 800));
      }

      if (!response || !response.data?.items) throw new Error('API failed');

      const domain = response.data?.APP_DOMAIN_CDN_IMAGE || 'https://img.otruyenapi.com';
      const parsed = (response.data.items || [])
        .map((item: any) => this.parseManga(item, `${domain}/uploads/comics`));
      
      const result = {
        data: parsed,
        total: (response.data?.params?.pagination?.totalItems) || 1000,
        offset,
        limit,
      };

      if (parsed.length > 0) {
        this.setCache(cacheKey, result, 10 * 1000);
      }
      return result;
    } catch {
      return { data: [], total: 0, offset, limit };
    }
  }

  async getMangaDetail(slug: string, bypassCache: boolean = false) {
    const cacheKey = `otruyen-detail-${slug}`;
    if (bypassCache) {
      this.cache.delete(cacheKey);
    }
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      let response;
      for (let i = 0; i < 3; i++) {
        try {
          const res = await fetch(`${this.baseUrl}/truyen-tranh/${slug}`, { cache: 'no-store' });
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
        this.setCache(cacheKey, parsed, 15 * 1000);
      }
      return parsed;
    } catch {
      return null;
    }
  }

  async getChapterFeed(slug: string, offset: number = 0, limit: number = 100, order: 'asc' | 'desc' = 'asc', bypassCache: boolean = false) {
    const cacheKey = `otruyen-feed-v2-${slug}`;
    if (bypassCache) {
      this.cache.delete(cacheKey);
    }
    let cachedFeed = await this.getCached(cacheKey);
    
    if (!cachedFeed) {
      try {
        let response;
        for (let i = 0; i < 3; i++) {
          try {
            const res = await fetch(`${this.baseUrl}/truyen-tranh/${slug}`, { cache: 'no-store' });
            if (res.ok) {
              response = await res.json();
              if (response.data?.item?.chapters) break;
            }
          } catch (e) {}
          if (i < 2) await new Promise(r => setTimeout(r, 800));
        }

        if (!response || !response.data?.item) throw new Error('API failed');

        let servers = response.data.item.chapters || [];
        
        // --- SMART SEARCH FALLBACK FOR "0 CHAPTERS" BUG ---
        if (servers.length === 0 || (servers.length === 1 && (!servers[0].server_data || servers[0].server_data.length === 0))) {
          const mangaTitle = response.data.item.name || '';
          if (mangaTitle) {
            try {
              const searchRes = await fetch(`${this.baseUrl}/tim-kiem?keyword=${encodeURIComponent(mangaTitle)}`, { cache: 'no-store' });
              if (searchRes.ok) {
                const searchData = await searchRes.json();
                const searchItems = searchData.data?.items || [];
                for (const item of searchItems) {
                  if (item.slug !== slug) {
                    const altRes = await fetch(`${this.baseUrl}/truyen-tranh/${item.slug}`, { cache: 'no-store' });
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
        // --------------------------------------------------

        const uniqueChaptersMap = new Map<string, any>();
        
        // Gop toan bo chuong tu tat ca cac servers de tranh mat thong tin va dam bao lay day du 100%
        for (const srv of servers) {
          const srvData = srv.server_data || [];
          for (const ch of srvData) {
            if (!ch.chapter_name) continue;
            // Neu chuong chua co hoac thieu du lieu api thi ghi de
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
            title: ch.chapter_title || `Chapter ${ch.chapter_name}`,
            lang: 'vi',
            group: 'Hệ Thống',
          };
        });

        cachedFeed = { chapters };
        this.setCache(cacheKey, cachedFeed, 5 * 1000);
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

  async getChapterPages(chapterId: string) {
    try {
      // API cua OTruyen dung CDN rieng de chua anh
      let response;
      for (let i = 0; i < 3; i++) {
        try {
          const res = await fetch(`https://sv1.otruyencdn.com/v1/api/chapter/${chapterId}`, { cache: 'no-store' });
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

  async getTags() {
    try {
      const res = await fetch(`${this.baseUrl}/the-loai`, { cache: 'no-store' });
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

  async proxyImage(url: string) {
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
          'Referer': 'https://otruyenapi.com/',
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

export const otruyenService = new OtruyenService();
