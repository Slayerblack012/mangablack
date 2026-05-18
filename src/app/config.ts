export const API_BASE = '/api/manga-black';

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
