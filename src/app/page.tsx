'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Sparkles, Flame, Calendar, RefreshCw, Award, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';
import { API_BASE } from './config';

interface MangaItem {
  id: string;
  title: string;
  description: string;
  status: string;
  coverUrl: string;
  genres: string[];
  author: string;
  lastChapter?: string;
}

// Home Page Component
function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [source, setSource] = useState<string>('global');
  const latestSourceRef = useRef(source);
  latestSourceRef.current = source;
  const [popular, setPopular] = useState<MangaItem[]>([]);
  const [latest, setLatest] = useState<MangaItem[]>([]);
  const [searchResults, setSearchResults] = useState<MangaItem[]>([]);
  
  const [loadingPopular, setLoadingPopular] = useState<boolean>(true);
  const [loadingLatest, setLoadingLatest] = useState<boolean>(true);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  
  const [featuredManga, setFeaturedManga] = useState<MangaItem | null>(null);

  // The loai & Cac states danh muc
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [genreResults, setGenreResults] = useState<MangaItem[]>([]);
  const [loadingGenreResults, setLoadingGenreResults] = useState<boolean>(false);

  // Dong bo source tu localStorage
  useEffect(() => {
    let savedSource = localStorage.getItem('manga_source') || 'global';
    setSource(savedSource);

    const handleSourceSync = () => {
      let activeSource = localStorage.getItem('manga_source') || 'global';
      setSource(activeSource);
    };

    window.addEventListener('manga-source-changed', handleSourceSync);
    return () => {
      window.removeEventListener('manga-source-changed', handleSourceSync);
    };
  }, []);

  // Tai danh sach the loai & Reset khi nguon thay doi
  useEffect(() => {
    setSelectedGenre('');
    setLatest([]);
    setPopular([]);
    fetchGenres();
    if (searchQuery) {
      fetchSearchResults();
    } else {
      fetchPopular();
      fetchLatest(false);
    }
  }, [source, searchQuery]);

  // Tai truyen theo the loai da chon
  useEffect(() => {
    if (selectedGenre) {
      fetchGenreResults();
    }
  }, [source, selectedGenre]);

  const fetchGenres = async () => {
    const currentSource = source;
    try {
      const res = await fetch(`${API_BASE}/crawler/tags?source=${source}`);
      const data = await res.json();
      if (currentSource !== latestSourceRef.current) return;
      setGenres(data || []);
    } catch (e) {
      console.error('Loi tai danh muc the loai:', e);
    }
  };

  const fetchGenreResults = async () => {
    const currentSource = source;
    setLoadingGenreResults(true);
    try {
      const res = await fetch(`${API_BASE}/crawler/browse?source=${source}&category=${selectedGenre}&limit=24`);
      const data = await res.json();
      if (currentSource !== latestSourceRef.current) return;
      setGenreResults(data.data || []);
    } catch (e) {
      console.error('Loi tai truyen theo the loai:', e);
    } finally {
      if (currentSource === latestSourceRef.current) {
        setLoadingGenreResults(false);
      }
    }
  };

  const fetchPopular = async () => {
    const currentSource = source;
    setLoadingPopular(true);
    try {
      const res = await fetch(`${API_BASE}/crawler/popular?source=${source}&limit=12`);
      const data = await res.json();
      if (currentSource !== latestSourceRef.current) return;
      const list = data.data || [];
      setPopular(list);
      
      // Chon ngau nhien 1 bo truyen lam Hero Banner noi bat
      if (list.length > 0) {
        setFeaturedManga(list[Math.floor(Math.random() * Math.min(list.length, 5))]);
      }
    } catch (e) {
      console.error('Loi tai truyen pho bien:', e);
    } finally {
      if (currentSource === latestSourceRef.current) {
        setLoadingPopular(false);
      }
    }
  };

  const fetchLatest = async (isLoadMore = false) => {
    const currentSource = source;
    setLoadingLatest(true);
    try {
      const currentOffset = isLoadMore ? latest.length : 0;
      const res = await fetch(`${API_BASE}/crawler/latest?source=${source}&limit=12&offset=${currentOffset}`);
      const data = await res.json();
      if (currentSource !== latestSourceRef.current) return;
      if (isLoadMore) {
        setLatest(prev => [...prev, ...(data.data || [])]);
      } else {
        setLatest(data.data || []);
      }
    } catch (e) {
      console.error('Loi tai truyen moi cap nhat:', e);
    } finally {
      if (currentSource === latestSourceRef.current) {
        setLoadingLatest(false);
      }
    }
  };

  const fetchSearchResults = async () => {
    const currentSource = source;
    setLoadingSearch(true);
    try {
      const res = await fetch(`${API_BASE}/crawler/search?title=${encodeURIComponent(searchQuery)}&source=${source}`);
      const data = await res.json();
      if (currentSource !== latestSourceRef.current) return;
      setSearchResults(data || []);
    } catch (e) {
      console.error('Loi tim kiem:', e);
    } finally {
      if (currentSource === latestSourceRef.current) {
        setLoadingSearch(false);
      }
    }
  };

  // Skeleton Grid Loading
  const renderSkeletons = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {Array.from({ length: 12 }).map((_, idx) => (
        <div key={idx} className="flex flex-col gap-3">
          <div className="aspect-[3/4] w-full rounded-xl skeleton-shimmer bg-white/5 border border-white/5"></div>
          <div className="h-4 w-4/5 rounded skeleton-shimmer bg-white/5"></div>
          <div className="h-3 w-1/2 rounded skeleton-shimmer bg-white/5"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        
        {/* Featured Manga Banner */}
        {!searchQuery && featuredManga && (
          <div className="system-window w-full overflow-hidden mb-12 min-h-[350px] md:min-h-[450px] flex items-end z-10">
            
            {/* Backdrop Blur Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-25 scale-105"
              style={{ backgroundImage: `url(${featuredManga.coverUrl})` }}
            ></div>
            
            {/* Dark & Cyan Gradient Masks */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-[#020617]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/40 via-transparent to-transparent"></div>

            {/* Banner Contents */}
            <div className="relative p-6 md:p-10 z-10 grid grid-cols-1 md:grid-cols-4 gap-8 items-center w-full">
              
              {/* Poster Column */}
              <div className="hidden md:block col-span-1">
                <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group">
                  <img 
                    src={featuredManga.coverUrl ? (source === 'global' ? featuredManga.coverUrl : `${API_BASE}/crawler/proxy-image?url=${encodeURIComponent(featuredManga.coverUrl)}&source=${source}`) : '/warning.svg'}
                    alt={featuredManga.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${!featuredManga.coverUrl ? 'object-contain p-8 opacity-50' : ''}`}
                    onError={(e) => { e.currentTarget.src = '/warning.svg'; e.currentTarget.className = 'w-full h-full object-cover group-hover:scale-105 transition-all duration-300 object-contain p-8 opacity-50'; }}
                  />
                  <div className="absolute top-2 left-2 bg-cyan-600/90 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-[0_0_10px_#0891b2]">
                    Hot Trend
                  </div>
                </div>
              </div>

              {/* Info Column */}
              <div className="col-span-1 md:col-span-3 flex flex-col gap-4 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    <Flame className="h-3 w-3 text-cyan-500 fill-cyan-500" /> Xu Hướng Tuần
                  </span>
                  <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                    {featuredManga.status === 'ongoing' ? 'Đang phát hành' : 'Hoàn thành'}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight text-glow-purple drop-shadow">
                  {featuredManga.title}
                </h1>

                <p className="text-xs md:text-sm text-gray-300 max-w-2xl line-clamp-3 md:line-clamp-4 leading-relaxed font-medium">
                  {featuredManga.description || 'Không có mô tả chi tiết cho tác phẩm nghệ thuật này.'}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(featuredManga.genres || []).slice(0, 5).map((genre, idx) => (
                    <span key={idx} className="bg-white/5 border border-white/5 text-[11px] font-bold text-gray-400 px-3 py-1 rounded-md">
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <Link 
                    href={`/manga/${source}/${featuredManga.id}`}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_#0891b2] border border-cyan-400/50 px-6 py-2.5 rounded-sm flex items-center gap-2 text-sm font-bold transition-all hover:scale-105"
                  >
                    <BookOpen className="h-4.5 w-4.5" /> Khởi Động Truyện
                  </Link>
                  
                  <div className="flex flex-col text-xs text-gray-400">
                    <span className="font-semibold text-white flex items-center gap-1"><User className="h-3.5 w-3.5 text-cyan-400" /> Tác giả:</span>
                    <span className="font-bold text-cyan-300 truncate max-w-[150px]">{featuredManga.author}</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Genre Scrolling Bar */}
        {!searchQuery && genres.length > 0 && (
          <div className="mb-10 text-left">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" /> Khám phá theo Thể loại
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar snap-x whitespace-nowrap">
              <button
                onClick={() => setSelectedGenre('')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition snap-start ${
                  selectedGenre === ''
                    ? 'bg-purple-600/95 text-white shadow-[0_0_15px_rgba(138,43,226,0.4)] border border-purple-500/40'
                    : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Tất cả thể loại
              </button>
              {genres.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGenre(g.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition snap-start ${
                    selectedGenre === g.id
                      ? 'bg-purple-600/95 text-white shadow-[0_0_15px_rgba(138,43,226,0.4)] border border-purple-500/40'
                      : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. DU LIEU DOC TRUYEN */}
        {searchQuery ? (
          /* SECTION: KET QUA TIM KIEM */
          <section className="mb-12">
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/5">
              <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" /> 
                KẾT QUẢ TÌM KIẾM: <span className="text-gradient-neon">"{searchQuery}"</span>
              </h2>
              <span className="text-xs bg-white/5 border border-white/5 px-3 py-1 rounded-full font-mono text-gray-400">
                Tìm thấy {searchResults.length} kết quả
              </span>
            </div>

            {loadingSearch ? renderSkeletons() : searchResults.length === 0 ? (
              <div className="glass-panel p-16 text-center border border-white/5">
                <p className="text-gray-400 font-bold">Không tìm thấy kết quả nào phù hợp. Vui lòng thử từ khoá khác!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {searchResults.map((manga) => (
                  <MangaCard key={manga.id} manga={manga} source={source} />
                ))}
              </div>
            )}
          </section>
        ) : selectedGenre ? (
          /* SECTION: TRUYEN THEO THE LOAI DANH RIENG CHO USER */
          <section className="mb-12 text-left animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/5">
              <h2 className="text-xl md:text-2xl font-black flex items-center gap-2 tracking-tight uppercase">
                <Award className="h-5 w-5 text-purple-400" /> 
                Thể loại: <span className="text-gradient-neon">{genres.find(g => g.id === selectedGenre)?.name || 'Đang tải...'}</span>
              </h2>
              
              <button 
                onClick={fetchGenreResults}
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-white font-bold bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Làm mới
              </button>
            </div>

            {loadingGenreResults ? renderSkeletons() : genreResults.length === 0 ? (
              <div className="glass-panel p-16 text-center border border-white/5">
                <p className="text-gray-400 font-bold">Không tìm thấy truyện nào thuộc thể loại này trên CDN!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {genreResults.map((manga) => (
                  <MangaCard key={manga.id} manga={manga} source={source} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* SECTION: POPULAR & LATEST RELEASES */
          <>
            {/* POPULAR GRID */}
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-cyan-500/10">
                <h2 className="text-xl md:text-2xl font-black flex items-center gap-2 tracking-tight">
                  <Flame className="h-5 w-5 text-cyan-500 fill-cyan-500" /> 
                  TRUYỆN PHỔ BIẾN <span className="text-cyan-400 font-medium text-sm ml-2">Được xem nhiều nhất</span>
                </h2>
                
                <button 
                  onClick={fetchPopular}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-white font-bold bg-white/5 hover:bg-cyan-900/40 px-3.5 py-1.5 rounded-full border border-cyan-500/20 transition shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Làm mới
                </button>
              </div>

              {loadingPopular ? renderSkeletons() : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {popular.map((manga) => (
                    <MangaCard key={manga.id} manga={manga} source={source} />
                  ))}
                </div>
              )}
            </section>

            {/* LATEST GRID */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-cyan-500/10">
                <h2 className="text-xl md:text-2xl font-black flex items-center gap-2 tracking-tight">
                  <Calendar className="h-5 w-5 text-cyan-400" /> 
                  MỚI CẬP NHẬT <span className="text-cyan-400 font-medium text-sm ml-2">Cập nhật nhanh nhất</span>
                </h2>
                
                <button 
                  onClick={() => fetchLatest(false)}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-white font-bold bg-white/5 hover:bg-cyan-900/40 px-3.5 py-1.5 rounded-full border border-cyan-500/20 transition shadow-[0_0_10px_rgba(34,211,238,0.1)]"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Làm mới
                </button>
              </div>

              {loadingLatest ? renderSkeletons() : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {latest.map((manga) => (
                      <MangaCard key={manga.id} manga={manga} source={source} />
                    ))}
                  </div>
                  
                  {latest.length > 0 && (
                    <div className="mt-10 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <Link 
                        href="/latest"
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm md:text-base px-8 py-3.5 rounded-sm shadow-[0_0_20px_rgba(8,145,178,0.6)] border border-cyan-400/50 transition-all flex items-center gap-2 transform hover:scale-105 uppercase tracking-widest"
                      >
                        Trích Xuất Thêm Dữ Liệu <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}

      </main>

      <Footer />
    </div>
  );
}

// Manga Card Component
function MangaCard({ manga, source }: { manga: MangaItem; source: string }) {
  // Loc lay chuong hien thi
  const displayChap = manga.lastChapter ? `Chap ${manga.lastChapter}` : 'Mới';

  return (
    <Link href={`/manga/${source}/${manga.id}`} className="group">
      <div className="flex flex-col gap-3">
        
        {/* Poster container with system card */}
        <div className="aspect-[3/4] w-full bg-[#020617] rounded-sm overflow-hidden relative system-card">
          <img 
            src={manga.coverUrl ? (source === 'global' ? manga.coverUrl : `${API_BASE}/crawler/proxy-image?url=${encodeURIComponent(manga.coverUrl)}&source=${source}`) : '/warning.svg'}
            alt={manga.title}
            loading="lazy"
            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-300 ${!manga.coverUrl ? 'object-contain p-4 opacity-50' : ''}`}
            onError={(e) => { e.currentTarget.src = '/warning.svg'; e.currentTarget.className = 'w-full h-full object-cover group-hover:scale-110 transition-all duration-300 object-contain p-4 opacity-50'; }}
          />
          
          {/* Neon Chapter Pill */}
          <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur border border-cyan-500/50 text-[10px] font-black text-cyan-300 px-2.5 py-1 rounded shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            {displayChap}
          </div>

          {/* Neon overlay cover on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#083344]/90 via-[#0ea5e9]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1 shadow-sm drop-shadow-[0_0_5px_#22d3ee]">
              Trích Xuất <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Info detail */}
        <div className="flex flex-col gap-1 text-left px-0.5">
          <h3 className="font-extrabold text-sm text-gray-200 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all line-clamp-2 leading-tight min-h-[2.5rem]">
            {manga.title}
          </h3>
          <span className="text-[10px] text-gray-500 font-bold truncate">
            {manga.author || 'Đang cập nhật'}
          </span>
        </div>

      </div>
    </Link>
  );
}

// Wrap inside Suspense for useSearchParams requirement
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#06060c] flex items-center justify-center">
        <div className="text-purple-400 font-bold animate-pulse text-lg">Đang kết nối chiều không gian...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
