import { mangadexService } from './mangadex.service';
import { otruyenService } from './otruyen.service';

class CrawlerService {
  searchManga(title: string, source?: string) {
    if (source === 'otruyen') return otruyenService.searchManga(title);
    return mangadexService.searchManga(title);
  }

  browseManga(query: any) {
    if (query.source === 'otruyen') return otruyenService.browseManga(query);
    return mangadexService.browseManga(query);
  }

  getMangaDetail(id: string, source?: string) {
    if (source === 'otruyen') return otruyenService.getMangaDetail(id);
    return mangadexService.getMangaDetail(id);
  }

  getChapterFeed(id: string, offset: number, limit: number, lang?: string, order: 'asc' | 'desc' = 'asc', source?: string) {
    if (source === 'otruyen') return otruyenService.getChapterFeed(id, offset, limit, order);
    return mangadexService.getChapterFeed(id, offset, limit, lang, order);
  }

  getChapterPages(id: string, source?: string) {
    if (source === 'otruyen') return otruyenService.getChapterPages(id);
    return mangadexService.getChapterPages(id);
  }

  getTags(source?: string) {
    if (source === 'otruyen') return otruyenService.getTags();
    return mangadexService.getTags();
  }

  proxyImage(url: string, source: string) {
    if (source === 'otruyen') return otruyenService.proxyImage(url);
    return mangadexService.proxyImage(url);
  }
}

export const crawlerService = new CrawlerService();
