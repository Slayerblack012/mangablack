'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Sparkles, Flame, Calendar, RefreshCw, Award, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';
import { API_BASE, getSecureProxyUrl } from './config';

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

// Home Page Content Component
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

  // Categories & States
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [genreResults, setGenreResults] = useState<MangaItem[]>([]);
  const [loadingGenreResults, setLoadingGenreResults] = useState<boolean>(false);

  // Sync Source from LocalStorage
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

  // Fetch Category List & Reset on Source Change
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

  // Fetch Manga by Category
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
          <div className="aspect-[3/4] w-full rounded-2xl skeleton-shimmer bg-white/[0.02] border border-white/[0.04]"></div>
          <div className="h-4 w-4/5 rounded skeleton-shimmer bg-white/[0.02]"></div>
          <div className="h-3 w-1/2 rounded skeleton-shimmer bg-white/[0.02]"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full relative z-10">
        
        {/* Featured Manga Banner */}
        {!searchQuery && featuredManga && (
          <div className="system-window w-full overflow-hidden mb-12 min-h-[350px] md:min-h-[450px] flex items-end">
            
            {/* Backdrop Blur Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-[0.15] scale-105"
              style={{ backgroundImage: `url(${getSecureProxyUrl(featuredManga.coverUrl, source)})` }}
            ></div>
            
            {/* Dark & Gold Gradient Masks */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/85 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#c5a880]/5 via-transparent to-transparent"></div>

            {/* Banner Contents */}
            <div className="relative p-6 md:p-10 z-10 grid grid-cols-1 md:grid-cols-4 gap-8 items-center w-full">
              
              {/* Poster Column */}
              <div className="hidden md:block col-span-1">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/[0.06] relative group">
                  <img 
                    src={featuredManga.coverUrl ? getSecureProxyUrl(featuredManga.coverUrl, source) : '/warning.svg'}
                    alt={featuredManga.title}
                    className={`w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ${!featuredManga.coverUrl ? 'object-contain p-8 opacity-50' : ''}`}
                    onError={(e) => { e.currentTarget.src = '/warning.svg'; e.currentTarget.className = 'w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 object-contain p-8 opacity-50'; }}
                  />
                  <div className="absolute top-3.5 left-3.5 bg-[#c5a880] text-[#07090e] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-lg shadow-md">
                    Hot Trend
                  </div>
                </div>
              </div>

              {/* Info Column */}
              <div className="col-span-1 md:col-span-3 flex flex-col gap-4 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#c5a880]/10 text-[#c5a880] border border-[#c5a880]/20 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Flame className="h-3.5 w-3.5 text-[#c5a880]" /> Xu Hướng Tuần
                  </span>
                  <span className="bg-white/[0.04] text-slate-300 border border-white/[0.06] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                    {featuredManga.status === 'ongoing' ? 'Đang phát hành' : 'Hoàn thành'}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight text-glow-gold drop-shadow-md">
                  {featuredManga.title}
                </h1>

                <p className="text-xs md:text-sm text-slate-300 max-w-2xl line-clamp-3 md:line-clamp-4 leading-relaxed font-medium">
                  {featuredManga.description || 'Không có mô tả chi tiết cho tác phẩm nghệ thuật này.'}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(featuredManga.genres || []).slice(0, 5).map((genre, idx) => (
                    <span key={idx} className="bg-white/[0.03] border border-white/[0.04] text-[10px] font-bold text-slate-400 px-3 py-1 rounded-lg">
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <Link 
                    href={`/manga/${source}/${featuredManga.id}`}
                    className="bg-gradient-to-r from-[#c5a880] to-[#b59250] text-[#07090e] hover:shadow-[0_8px_25px_rgba(197,168,128,0.2)] px-6 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4" /> Đọc Ngay
                  </Link>
                  
                  <div className="flex flex-col text-xs text-slate-400">
                    <span className="font-semibold text-slate-300 flex items-center gap-1"><User className="h-3.5 w-3.5 text-[#c5a880]" /> Tác giả:</span>
                    <span className="font-bold text-[#c5a880] truncate max-w-[150px]">{featuredManga.author}</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Genre Scrolling Bar */}
        {!searchQuery && genres.length > 0 && (
          <div className="mb-10 text-left">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#c5a880]" /> Khám phá theo Thể loại
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar snap-x whitespace-nowrap">
              <button
                onClick={() => setSelectedGenre('')}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition snap-start ${
                  selectedGenre === ''
                    ? 'bg-[#c5a880] text-[#07090e] border border-[#c5a880]/30 shadow-md'
                    : 'bg-white/[0.02] border border-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.06]'
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
                      ? 'bg-[#c5a880] text-[#07090e] border border-[#c5a880]/30 shadow-md'
                      : 'bg-white/[0.02] border border-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Home Content Grids */}
        {searchQuery ? (
          /* SECTION: KẾT QUẢ TÌM KIẾM */
          <section className="mb-12">
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/[0.04]">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#c5a880]" /> 
                KẾT QUẢ TÌM KIẾM: <span className="text-gradient-neon">"{searchQuery}"</span>
              </h2>
              <span className="text-xs bg-white/[0.02] border border-white/[0.04] px-3 py-1 rounded-full font-mono text-slate-400">
                Tìm thấy {searchResults.length} kết quả
              </span>
            </div>

            {loadingSearch ? renderSkeletons() : searchResults.length === 0 ? (
              <div className="glass-panel p-16 text-center border border-white/[0.04]">
                <p className="text-slate-400 font-semibold text-sm">Không tìm thấy kết quả nào phù hợp. Vui lòng thử từ khoá khác!</p>
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
          /* SECTION: TRUYỆN THEO THỂ LOẠI */
          <section className="mb-12 text-left animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/[0.04]">
              <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight uppercase">
                <Award className="h-5 w-5 text-[#c5a880]" /> 
                Thể loại: <span className="text-gradient-neon">{genres.find(g => g.id === selectedGenre)?.name || 'Đang tải...'}</span>
              </h2>
              
              <button 
                onClick={fetchGenreResults}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-bold bg-white/[0.02] hover:bg-white/[0.06] px-3.5 py-1.5 rounded-full border border-white/[0.06] transition"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Làm mới
              </button>
            </div>

            {loadingGenreResults ? renderSkeletons() : genreResults.length === 0 ? (
              <div className="glass-panel p-16 text-center border border-white/[0.04]">
                <p className="text-slate-400 font-semibold text-sm">Không tìm thấy truyện nào thuộc thể loại này trên máy chủ!</p>
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
          /* SECTION: PHỔ BIẾN & CẬP NHẬT */
          <>
            {/* POPULAR GRID */}
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/[0.04]">
                <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight">
                  <Flame className="h-5 w-5 text-[#c5a880]" /> 
                  TRUYỆN PHỔ BIẾN <span className="text-slate-400 font-normal text-xs ml-2">Được xem nhiều nhất</span>
                </h2>
                
                <button 
                  onClick={fetchPopular}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-bold bg-white/[0.02] hover:bg-white/[0.06] px-3.5 py-1.5 rounded-full border border-white/[0.06] transition-all shadow-sm"
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
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/[0.04]">
                <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight">
                  <Calendar className="h-5 w-5 text-[#c5a880]" /> 
                  MỚI CẬP NHẬT <span className="text-slate-400 font-normal text-xs ml-2">Cập nhật nhanh nhất</span>
                </h2>
                
                <button 
                  onClick={() => fetchLatest(false)}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-bold bg-white/[0.02] hover:bg-white/[0.06] px-3.5 py-1.5 rounded-full border border-white/[0.06] transition-all shadow-sm"
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
                      <button 
                        onClick={() => fetchLatest(true)}
                        className="bg-gradient-to-r from-[#c5a880] to-[#b59250] text-[#07090e] font-bold text-xs px-8 py-3.5 rounded-xl shadow-md hover:shadow-[0_8px_25px_rgba(197,168,128,0.2)] transition-all flex items-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider cursor-pointer"
                      >
                        Xem Thêm Truyện <ArrowRight className="h-4 w-4" />
                      </button>
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
  const displayChap = manga.lastChapter ? `Chap ${manga.lastChapter}` : 'Mới';

  return (
    <Link href={`/manga/${source}/${manga.id}`} className="group cursor-pointer">
      <div className="flex flex-col gap-3">
        
        {/* Poster container with system card */}
        <div className="aspect-[3/4] w-full bg-[#0b0e14] rounded-xl overflow-hidden relative system-card shadow-md">
          <img 
            src={manga.coverUrl ? getSecureProxyUrl(manga.coverUrl, source) : '/warning.svg'}
            alt={manga.title}
            loading="lazy"
            className={`w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ${!manga.coverUrl ? 'object-contain p-4 opacity-50' : ''}`}
            onError={(e) => { e.currentTarget.src = '/warning.svg'; e.currentTarget.className = 'w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 object-contain p-4 opacity-50'; }}
          />
          
          {/* Chapter Badge */}
          <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur border border-white/[0.08] text-[9px] font-bold text-[#c5a880] px-2.5 py-1 rounded-lg shadow-md">
            {displayChap}
          </div>

          {/* Overlay cover on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e]/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3.5">
            <span className="text-[9px] font-bold text-[#c5a880] uppercase tracking-wider flex items-center gap-1">
              Đọc ngay <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Info detail */}
        <div className="flex flex-col gap-1 text-left px-0.5">
          <h3 className="font-bold text-xs text-slate-200 group-hover:text-[#c5a880] transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
            {manga.title}
          </h3>
          <span className="text-[9px] text-slate-500 font-bold truncate">
            {manga.author || 'Đang cập nhật'}
          </span>
        </div>

      </div>
    </Link>
  );
}

// Wrap inside Suspense
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="text-[#c5a880] font-bold text-xs tracking-widest uppercase animate-pulse">Đang tải trang...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
