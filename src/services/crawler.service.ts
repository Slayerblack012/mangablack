import { mangadexService } from './mangadex.service';
import { otruyenService } from './otruyen.service';
import { 
  MangaItem, 
  BrowseMangaResponse, 
  ChapterFeedResponse, 
  ChapterPagesResponse, 
  TagItem,
  BrowseOptions
} from './types';

/**
 * CrawlerService
 * Gatekeeper orchestration service directing requests to specific data crawler implementations
 * (OTruyen or MangaDex) based on source parameter.
 */
class CrawlerService {
  /**
   * Search manga by keywords
   */
  searchManga(title: string, source?: string): Promise<MangaItem[]> {
    if (source === 'otruyen' || source === 'vn') {
      return otruyenService.searchManga(title);
    }
    return mangadexService.searchManga(title);
  }

  /**
   * Browse lists of manga by filter settings
   */
  browseManga(query: BrowseOptions): Promise<BrowseMangaResponse> {
    if (query.source === 'otruyen' || query.source === 'vn') {
      return otruyenService.browseManga(query);
    }
    return mangadexService.browseManga(query);
  }

  /**
   * Fetch full comic meta details
   */
  getMangaDetail(id: string, source?: string, bypassCache?: boolean): Promise<MangaItem | null> {
    if (source === 'otruyen' || source === 'vn') {
      return otruyenService.getMangaDetail(id, bypassCache);
    }
    return mangadexService.getMangaDetail(id, bypassCache);
  }

  /**
   * Retrieve list of chapters (fully deduplicated and unified)
   */
  getChapterFeed(
    id: string, 
    offset: number, 
    limit: number, 
    lang?: string, 
    order: 'asc' | 'desc' = 'asc', 
    source?: string, 
    bypassCache?: boolean
  ): Promise<ChapterFeedResponse> {
    if (source === 'otruyen' || source === 'vn') {
      return otruyenService.getChapterFeed(id, offset, limit, order, bypassCache);
    }
    return mangadexService.getChapterFeed(id, offset, limit, lang, order, bypassCache);
  }

  /**
   * Fetch all page image links inside a chapter
   */
  getChapterPages(id: string, source?: string): Promise<ChapterPagesResponse> {
    if (source === 'otruyen' || source === 'vn') {
      return otruyenService.getChapterPages(id);
    }
    return mangadexService.getChapterPages(id);
  }

  /**
   * Fetch categories and tags
   */
  getTags(source?: string): Promise<TagItem[]> {
    if (source === 'otruyen' || source === 'vn') {
      return otruyenService.getTags();
    }
    return mangadexService.getTags();
  }

  /**
   * Stream images safely through server proxy
   */
  proxyImage(url: string, source: string): Promise<Response> {
    if (source === 'otruyen' || source === 'vn') {
      return otruyenService.proxyImage(url);
    }
    return mangadexService.proxyImage(url);
  }
}

export const crawlerService = new CrawlerService();
