export const API_BASE = '/api/manga-black';

export const SYSTEM_SECURITY_HEADERS = {
  'x-manga-black-shield': 'mb_active_cyber_gatekeeper_ss4'
};

export function getSecureProxyUrl(url: string, source: string): string {
  if (!url) return '';
  try {
    // Obfuscate the target image URL with Base64 to prevent ISPs and scrapers from inspecting URLs
    const obfuscated = btoa(url);
    return `${API_BASE}/crawler/proxy-image?q=${encodeURIComponent(obfuscated)}&s=${source}`;
  } catch {
    return `${API_BASE}/crawler/proxy-image?url=${encodeURIComponent(url)}&source=${source}`;
  }
}


export interface MangaSource {
  id: string;
  name: string;
  flag: string;
  desc: string;
}

export const MANGA_SOURCES: MangaSource[] = [
  {
    id: 'global',
    name: 'Global',
    flag: '[EN]',
    desc: 'Cổng thông tin Manga quốc tế chất lượng cao, đa ngôn ngữ.',
  },
  {
    id: 'vn',
    name: 'VNmanga',
    flag: '[VN]',
    desc: 'Kho lưu trữ truyện dịch tiếng Việt cực lớn, máy chủ trong nước cực nhanh.',
  },
];
