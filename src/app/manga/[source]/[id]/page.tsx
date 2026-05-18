'use client';

import { useState, useEffect, use } from 'react';
import { BookOpen, Star, Sparkles, User, RefreshCw, Hash, Calendar, Search, ArrowUpDown, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { API_BASE } from '../../../config';

interface MangaDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  coverUrl: string;
  coverUrlHQ: string;
  genres: string[];
  author: string;
  artist: string;
  year?: number;
}

interface ChapterItem {
  id: string; // URL chi tiet chuong doi voi OTruyen hoac UUID doi voi MangaDex
  chapter: string;
  volume?: string;
  title: string;
  lang: string;
  group: string;
}

export default function MangaDetailPage({ params }: { params: Promise<{ source: string; id: string }> }) {
  const resolvedParams = use(params);
  const { source, id } = resolvedParams;

  const [manga, setManga] = useState<MangaDetail | null>(null);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingChapters, setLoadingChapters] = useState<boolean>(true);

  // States bo loc chuong truyen
  const [chapterQuery, setChapterQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [descCollapsed, setDescCollapsed] = useState<boolean>(true);
  
  // States Ngon ngu
  const [selectedLang, setSelectedLang] = useState<string>('');
  const [availableLangs, setAvailableLangs] = useState<string[]>([]);
  
  // States Yeu thich cuc bo & Lich su doc
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [lastReadChapter, setLastReadChapter] = useState<{ id: string; num: string } | null>(null);

  useEffect(() => {
    fetchDetail();
    checkFavoriteStatus();
    checkReadHistory();
  }, [source, id]);

  useEffect(() => {
    fetchChapters(selectedLang);
  }, [source, id, selectedLang]);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`${API_BASE}/crawler/manga/${id}?source=${source}`);
      const data = await res.json();
      setManga(data);
    } catch (e) {
      console.error('Loi tai chi tiet truyen:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (lang?: string) => {
    setLoadingChapters(true);
    try {
      const url = `${API_BASE}/crawler/manga/${id}/chapters?source=${source}&limit=99999${lang ? `&lang=${lang}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setChapters(data.data || []);
      
      // Khoi tao danh sach ngon ngu va tu dong chon ngon ngu uu tien
      if (data.availableLanguages && data.availableLanguages.length > 0 && availableLangs.length === 0) {
        setAvailableLangs(data.availableLanguages);
        if (!lang) {
           if (data.availableLanguages.includes('vi')) setSelectedLang('vi');
           else if (data.availableLanguages.includes('en')) setSelectedLang('en');
           else setSelectedLang(data.availableLanguages[0]);
        }
      }
    } catch (e) {
      console.error('Loi tai danh sach chuong:', e);
    } finally {
      setLoadingChapters(false);
    }
  };

  // Manage favorite list via LocalStorage
  const checkFavoriteStatus = () => {
    const favs = JSON.parse(localStorage.getItem('manga_favorites') || '[]');
    const exists = favs.some((fav: any) => fav.id === id && fav.source === source);
    setIsFavorite(exists);
  };

  const toggleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem('manga_favorites') || '[]');
    if (isFavorite) {
      const updated = favs.filter((fav: any) => !(fav.id === id && fav.source === source));
      localStorage.setItem('manga_favorites', JSON.stringify(updated));
      setIsFavorite(false);
    } else if (manga) {
      favs.push({
        id: manga.id,
        title: manga.title,
        coverUrl: manga.coverUrl,
        author: manga.author,
        source,
        addedAt: Date.now()
      });
      localStorage.setItem('manga_favorites', JSON.stringify(favs));
      setIsFavorite(true);
    }
  };

  // Manage reading history via LocalStorage
  const checkReadHistory = () => {
    const histories = JSON.parse(localStorage.getItem('manga_history') || '[]');
    const entry = histories.find((h: any) => h.mangaId === id && h.source === source);
    if (entry) {
      setLastReadChapter({ id: entry.chapterId, num: entry.chapterNum });
    }
  };

  // Search and filter chapter list
  const filteredChapters = chapters
    .filter(ch => {
      const matchNum = ch.chapter.toLowerCase().includes(chapterQuery.toLowerCase());
      const matchTitle = ch.title.toLowerCase().includes(chapterQuery.toLowerCase());
      return matchNum || matchTitle;
    })
    .sort((a, b) => {
      const numA = parseFloat(a.chapter) || 0;
      const numB = parseFloat(b.chapter) || 0;
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-purple-400 font-bold animate-pulse text-lg">Tải luồng thông tin truyện...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-red-400 font-bold">Không tìm thấy dữ liệu truyện. Vui lòng thử lại sau!</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between relative">
      <Header />

      {/* Cinematic backdrop blur */}
      <div 
        className="absolute top-16 left-0 right-0 h-[400px] bg-cover bg-top opacity-[0.08] blur-xl pointer-events-none scale-105"
        style={{ backgroundImage: `url(${manga.coverUrlHQ})` }}
      ></div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-8 uppercase tracking-wider text-left">
          <Link href="/" className="hover:text-purple-400 transition">Trang Chủ</Link>
          <span>/</span>
          <span className="text-gray-400 truncate max-w-[200px]">{manga.title}</span>
        </div>

        {/* 1. MANGA META OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start mb-12">
          
          {/* Cover Poster */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group glass-card">
              <img 
                src={manga.coverUrlHQ ? `${API_BASE}/crawler/proxy-image?url=${encodeURIComponent(manga.coverUrlHQ)}&source=${source}` : '/warning.svg'}
                alt={manga.title}
                className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${!manga.coverUrlHQ ? 'object-contain p-8 opacity-50' : ''}`}
                onError={(e) => { e.currentTarget.src = '/warning.svg'; e.currentTarget.className = 'w-full h-full object-cover group-hover:scale-105 transition-all duration-300 object-contain p-8 opacity-50'; }}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={toggleFavorite}
                className={`w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                  isFavorite 
                    ? 'bg-pink-600/80 hover:bg-pink-700/80 text-white border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isFavorite ? 'fill-white' : ''}`} />
                {isFavorite ? 'Đã Lưu Vào Tủ Sách' : 'Thêm Vào Yêu Thích'}
              </button>

              {lastReadChapter ? (
                <Link 
                  href={`/read/${source}/${id}/${encodeURIComponent(lastReadChapter.id)}?chapNum=${lastReadChapter.num}`}
                  className="w-full py-2.5 rounded-xl text-xs font-black bg-cyan-600/90 hover:bg-cyan-700/90 text-white border border-cyan-500/30 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition"
                >
                  <BookOpen className="h-4 w-4 animate-bounce" /> Tiếp Tục Đọc Chap {lastReadChapter.num}
                </Link>
              ) : chapters.length > 0 ? (
                <Link 
                  href={`/read/${source}/${id}/${encodeURIComponent(chapters[chapters.length - 1].id)}?chapNum=${chapters[chapters.length - 1].chapter}`}
                  className="w-full py-2.5 rounded-xl text-xs font-black bg-purple-600/90 hover:bg-purple-700/90 text-white border border-purple-500/30 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(138,43,226,0.3)] transition"
                >
                  <BookOpen className="h-4 w-4" /> Đọc Từ Chương Đầu
                </Link>
              ) : null}
            </div>
          </div>

          {/* Info Details */}
          <div className="col-span-1 md:col-span-3 text-left flex flex-col gap-6">
            
            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-purple-500/15 border border-purple-500/35 text-purple-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Nguồn: {source === 'vn' ? 'VNmanga' : 'Global'}
                </span>
                <span className="bg-white/5 border border-white/5 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {manga.status === 'ongoing' ? 'Đang phát hành' : 'Hoàn thành'}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none text-glow-purple">
                {manga.title}
              </h1>
            </div>

            {/* Grid properties */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 text-xs font-semibold">
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-purple-400" /> Tác Giả</span>
                <span className="text-white font-extrabold truncate">{manga.author}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-purple-400" /> Họa Sĩ</span>
                <span className="text-white font-extrabold truncate">{manga.artist}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 flex items-center gap-1.5"><Hash className="h-3.5 w-3.5 text-purple-400" /> Số Chương</span>
                <span className="text-white font-black text-sm">{chapters.length} Chap</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-purple-400" /> Phát Hành</span>
                <span className="text-white font-extrabold">{manga.year || 'N/A'}</span>
              </div>
            </div>

            {/* Description Collapse */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nội Dung Tóm Tắt</span>
              <p className={`text-xs md:text-sm text-gray-300 leading-relaxed font-medium transition-all ${descCollapsed ? 'line-clamp-3 md:line-clamp-4' : ''}`}>
                {manga.description || 'Chưa có tóm tắt cốt truyện tiếng Việt cho tác phẩm này. Mời bạn đón đọc chương đầu tiên để khám phá hành trình huyền thoại!'}
              </p>
              {manga.description && manga.description.length > 250 && (
                <button 
                  onClick={() => setDescCollapsed(!descCollapsed)}
                  className="text-xs text-purple-400 hover:text-white font-bold flex items-center gap-1 mt-1 focus:outline-none w-fit text-left"
                >
                  {descCollapsed ? (
                    <>Xem thêm <ChevronDown className="h-3.5 w-3.5" /></>
                  ) : (
                    <>Thu gọn <ChevronUp className="h-3.5 w-3.5" /></>
                  )}
                </button>
              )}
            </div>

            {/* Tags Badges */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Thể Loại Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {(manga.genres || []).map((genre, idx) => (
                  <span key={idx} className="bg-purple-950/20 hover:bg-purple-900/30 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-md text-[11px] font-extrabold tracking-wide transition cursor-pointer">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* 2. CHAPTERS LIST CONTAINER */}
        <section className="glass-panel p-6 border border-white/5">
          
          {/* Header & Filter HUD */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-5 border-b border-white/10 mb-6 text-left">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-400" /> DANH SÁCH CHƯƠNG TRUYỆN
            </h2>
            
            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2 flex-1 sm:max-w-md justify-end">
              {/* Language Selector cho MangaDex */}
              {source === 'global' && availableLangs.length > 0 && (
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-white font-bold cursor-pointer focus:outline-none focus:border-purple-500 hover:bg-white/10 transition"
                  title="Chọn ngôn ngữ"
                >
                  <option value="" className="bg-gray-900 text-white">Tất cả ngôn ngữ</option>
                  {availableLangs.map(l => (
                    <option key={l} value={l} className="bg-gray-900 text-white">
                      {l === 'vi' ? 'Vietnamese' : l === 'en' ? 'English' : l === 'es' ? 'Spanish' : l === 'pt-br' ? 'Portuguese' : l.toUpperCase()}
                    </option>
                  ))}
                </select>
              )}

              {/* Search Chapter input */}
              <div className="relative flex-1 min-w-[150px]">
                <input 
                  type="text" 
                  value={chapterQuery}
                  onChange={(e) => setChapterQuery(e.target.value)}
                  placeholder="Lọc số chương, tên chương..."
                  className="w-full px-3 py-1.5 pl-8 rounded-lg bg-white/5 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition"
                />
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-500" />
              </div>

              {/* Sort button */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition"
                title={sortOrder === 'asc' ? 'Đọc từ đầu' : 'Đọc chương mới nhất'}
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List display */}
          {loadingChapters ? (
            <div className="py-20 text-center text-purple-400 font-bold animate-pulse text-xs">
              Đang tải danh sách chương từ CDN...
            </div>
          ) : filteredChapters.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs font-bold">
              Không tìm thấy chương truyện nào khớp với bộ lọc!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar text-left">
              {filteredChapters.map((ch) => {
                const cleanId = ch.id.includes('/') ? ch.id.split('/').pop() || ch.id : ch.id;
                const isRead = lastReadChapter?.id === ch.id || lastReadChapter?.id === cleanId;
                
                return (
                  <Link 
                    key={ch.id} 
                    href={`/read/${source}/${id}/${encodeURIComponent(cleanId)}?chapNum=${ch.chapter}`}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-xs font-semibold group ${
                      isRead 
                        ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-300 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]' 
                        : 'bg-white/3 hover:bg-white/7 border-white/5 text-gray-300 hover:text-white hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 truncate max-w-[80%]">
                      <span className="font-extrabold text-sm text-white group-hover:text-purple-400 transition flex items-center gap-1.5">
                        Chương {ch.chapter} {isRead && <span className="bg-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase px-1.5 py-0.2 rounded">Đã Đọc</span>}
                      </span>
                      <span className="text-[10px] text-gray-500 group-hover:text-gray-400 transition truncate mt-0.5">
                        {ch.title || 'Không có tiêu đề'}
                      </span>
                    </div>
                    
                    <span className="text-[10px] text-gray-500 group-hover:text-purple-400 transition font-mono whitespace-nowrap bg-black/20 px-2 py-1 rounded">
                      {ch.group && !/otruyen|mangadex/i.test(ch.group) ? ch.group : 'Hệ Thống'}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

        </section>

      </main>

      <Footer />
    </div>
  );
}
