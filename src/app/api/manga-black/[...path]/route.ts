import { NextRequest, NextResponse } from 'next/server';
import { crawlerService } from '../../../../services/crawler.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Lightweight in-memory Inbound Anti-DoS / DoS Guard
const requestTracker = new Map<string, { count: number; resetTime: number }>();
const DOS_LIMIT = 90; // max 90 requests per minute
const DOS_WINDOW = 60 * 1000; // 1 minute


// De quy lam sach du lieu nguon tra ve tu backend truoc khi phan hoi Client
function sanitizeData(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (obj === 'otruyen') return 'vn';
    if (obj === 'mangadex') return 'global';
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeData(item));
  }
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key === 'source') {
          if (obj[key] === 'otruyen') sanitized[key] = 'vn';
          else if (obj[key] === 'mangadex') sanitized[key] = 'global';
          else sanitized[key] = obj[key];
        } else {
          sanitized[key] = sanitizeData(obj[key]);
        }
      }
    }
    return sanitized;
  }
  return obj;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Inbound Anti-DoS / DoS Shield
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'anonymous_client';
    const currentTime = Date.now();
    const rateData = requestTracker.get(clientIp);

    if (rateData) {
      if (currentTime > rateData.resetTime) {
        requestTracker.set(clientIp, { count: 1, resetTime: currentTime + DOS_WINDOW });
      } else {
        rateData.count++;
        if (rateData.count > DOS_LIMIT) {
          return new Response('Too Many Requests: System Anti-DoS Triggered', { 
            status: 429,
            headers: { 'Retry-After': '60' }
          });
        }
      }
    } else {
      requestTracker.set(clientIp, { count: 1, resetTime: currentTime + DOS_WINDOW });
    }

    const resolvedParams = await params;
    const pathArray = resolvedParams.path || [];
    const subPath = pathArray.join('/');

    const { searchParams } = new URL(request.url);
    const newParams = new URLSearchParams(searchParams.toString());

    // Security Shield 1: Validate Referrer to block external scraping/hotlinking
    const referer = request.headers.get('referer');
    const host = request.headers.get('host') || '';
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const isSelfOrigin = 
          refererUrl.hostname === 'localhost' || 
          refererUrl.hostname === '127.0.0.1' || 
          host.includes(refererUrl.hostname) ||
          refererUrl.hostname.includes(host.split(':')[0]);
        if (!isSelfOrigin) {
          return new Response('Forbidden: Untrusted origin', { status: 403 });
        }
      } catch (e) {}
    }

    // Security Mapping: client uses (global/vn) -> backend uses (mangadex/otruyen)
    let source = newParams.get('s') || newParams.get('source') || 'mangadex';
    if (source === 'global') source = 'mangadex';
    if (source === 'vn') source = 'otruyen';

    const bypassCache = newParams.get('bypassCache') === 'true';
    let resultData: any = null;

    if (subPath === 'crawler/proxy-image') {
      const urlParam = newParams.get('q') || newParams.get('url');
      if (!urlParam) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
      
      let url = urlParam;
      if (newParams.get('q')) {
        try {
          // Decode the Base64 obfuscated URL safely
          url = atob(decodeURIComponent(urlParam));
        } catch (e) {}
      }
      
      let retryCount = 3;
      let response: Response | null = null;
      
      while (retryCount >= 0) {
        try {
          response = await crawlerService.proxyImage(url, source);
          if (response.status === 429) throw new Error('429 Rate Limit');
          break; // success
        } catch (e: any) {
          if (retryCount === 0) {
            return NextResponse.json({ error: `Image Proxy Error` }, { status: e.message.includes('429') ? 429 : 500 });
          }
          retryCount--;
          const delay = e.message.includes('429') ? 1000 + Math.random() * 2000 : 500;
          await new Promise(r => setTimeout(r, delay));
        }
      }

      if (!response || !response.ok) {
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: response?.status || 500 });
      }

      const arrayBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      return new Response(arrayBuffer as any, {
        headers: {
          'Content-Type': contentType,
          // Ultimate CDN image caching: 1 year cache, immutable, stale-while-revalidate
          'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=604800, immutable',
        },
      });
    } 
    
    else if (subPath === 'crawler/search') {
      resultData = await crawlerService.searchManga(newParams.get('title') || '', source);
    } 
    else if (subPath === 'crawler/browse' || subPath === 'crawler/popular' || subPath === 'crawler/latest') {
      const query = {
        limit: Number(newParams.get('limit')) || 24,
        offset: Number(newParams.get('offset')) || 0,
        order: subPath === 'crawler/popular' ? 'popular' : (subPath === 'crawler/latest' ? 'latest' : newParams.get('order')),
        status: newParams.get('status'),
        year: newParams.get('year') ? Number(newParams.get('year')) : undefined,
        category: newParams.get('category') || undefined,
        tags: newParams.getAll('tags[]'),
        source
      };
      resultData = await crawlerService.browseManga(query);
    }
    else if (subPath.startsWith('crawler/manga/') && subPath.endsWith('/chapters')) {
      const id = pathArray[2];
      resultData = await crawlerService.getChapterFeed(
        id, 
        Number(newParams.get('offset')) || 0, 
        Number(newParams.get('limit')) || 100, 
        newParams.get('lang') || undefined,
        (newParams.get('order') as 'asc' | 'desc') || 'asc',
        source,
        bypassCache
      );
    }
    else if (subPath.startsWith('crawler/manga/')) {
      const id = pathArray[2];
      resultData = await crawlerService.getMangaDetail(id, source, bypassCache);
    }
    else if (subPath.startsWith('crawler/chapter/') && subPath.endsWith('/pages')) {
      const id = pathArray[2];
      const decodedId = id.startsWith('http') ? id : decodeURIComponent(id);
      resultData = await crawlerService.getChapterPages(decodedId, source);
    }
    else if (subPath === 'crawler/chapter-pages') {
      const id = newParams.get('id') || '';
      const decodedId = id.startsWith('http') ? id : decodeURIComponent(id);
      resultData = await crawlerService.getChapterPages(decodedId, source);
    }
    else if (subPath === 'crawler/tags') {
      resultData = await crawlerService.getTags(source);
    }
    else {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }

    const cleanData = sanitizeData(resultData);

    // Dynamic Edge Caching policy mapping based on endpoint resource type
    let cachePolicy = 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
    
    if (subPath.startsWith('crawler/chapter/') && subPath.endsWith('/pages')) {
      // Published chapter image lists never change: cache for 7 days
      cachePolicy = 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400, immutable';
    } else if (subPath === 'crawler/chapter-pages') {
      cachePolicy = 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400, immutable';
    } else if (subPath.startsWith('crawler/manga/') && subPath.endsWith('/chapters')) {
      // Chapter updates check: cache for 15 minutes on the CDN
      cachePolicy = 'public, max-age=900, s-maxage=900, stale-while-revalidate=300';
    } else if (subPath.startsWith('crawler/manga/')) {
      // Manga descriptions and metadata: cache for 30 minutes
      cachePolicy = 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=600';
    } else if (subPath === 'crawler/tags') {
      // Tags list: cache for 24 hours
      cachePolicy = 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=7200';
    }

    return NextResponse.json(cleanData, {
      headers: {
        'Cache-Control': cachePolicy,
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
