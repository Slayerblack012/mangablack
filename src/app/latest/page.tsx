'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_BASE } from '../config';

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

function MangaCard({ manga, source }: { manga: MangaItem; source: string }) {
  const displayChap = manga.lastChapter ? `Chap ${manga.lastChapter}` : 'Mới';

  return (
    <Link href={`/manga/${source}/${manga.id}`} className="group">
      <div className="flex flex-col gap-3">
        <div className="aspect-[3/4] w-full rounded-xl overflow-hidden border border-white/5 relative glass-card shadow-lg">
          <img 
            src={manga.coverUrl ? `${API_BASE}/crawler/proxy-image?url=${encodeURIComponent(manga.coverUrl)}&source=${source}` : '/warning.svg'}
            alt={manga.title}
            loading="lazy"
            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-300 ${!manga.coverUrl ? 'object-contain p-4 opacity-50' : ''}`}
            onError={(e) => { e.currentTarget.src = '/warning.svg'; e.currentTarget.className = 'w-full h-full object-cover group-hover:scale-110 transition-all duration-300 object-contain p-4 opacity-50'; }}
          />
          <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur border border-purple-500/30 text-[10px] font-black text-purple-300 px-2.5 py-1 rounded-md shadow-md">
            {displayChap}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-sm">
              Xem chi tiết <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-left px-0.5">
          <h3 className="font-extrabold text-sm text-gray-200 group-hover:text-purple-400 transition line-clamp-2 leading-tight min-h-[2.5rem]">
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

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) {
  const generatePages = () => {
    let pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisible; i++) pages.push(i);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) pages.push(i);
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button 
        onClick={() => onPageChange(1)} 
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <ChevronsLeft className="h-4 w-4" />
      </button>
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      {generatePages().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition ${
            currentPage === page 
              ? 'bg-[#f97316] text-white shadow-lg' 
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {page}
        </button>
      ))}

      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <button 
        onClick={() => onPageChange(totalPages)} 
        disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function LatestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const [currentPage, setCurrentPage] = useState<number>(pageParam ? parseInt(pageParam, 10) : 1);
  const [source, setSource] = useState<string>('global');
  const latestSourceRef = useRef(source);
  latestSourceRef.current = source;
  const [mangas, setMangas] = useState<MangaItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const limit = 24;

  useEffect(() => {
    let savedSource = localStorage.getItem('manga_source') || 'global';
    setSource(savedSource);

    const handleSourceSync = () => {
      let activeSource = localStorage.getItem('manga_source') || 'global';
      setSource(activeSource);
      setCurrentPage(1); // Reset page on source change
    };

    window.addEventListener('manga-source-changed', handleSourceSync);
    return () => {
      window.removeEventListener('manga-source-changed', handleSourceSync);
    };
  }, []);

  useEffect(() => {
    fetchLatestMangas();
  }, [source, currentPage]);

  const fetchLatestMangas = async () => {
    const currentSource = source;
    setLoading(true);
    try {
      const offset = (currentPage - 1) * limit;
      const res = await fetch(`${API_BASE}/crawler/latest?source=${source}&limit=${limit}&offset=${offset}`);
      const data = await res.json();
      if (currentSource !== latestSourceRef.current) return;
      setMangas(data.data || []);
      const total = data.total || 0;
      setTotalPages(Math.max(1, Math.ceil(total / limit)));
    } catch (e) {
      console.error('Loi tai truyen moi cap nhat:', e);
    } finally {
      if (currentSource === latestSourceRef.current) {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.push(`/latest?page=${page}`, { scroll: false });
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {Array.from({ length: 24 }).map((_, idx) => (
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

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/5">
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tight">
            <Calendar className="h-7 w-7 text-cyan-400" /> 
            MỚI CẬP NHẬT
          </h1>
          <div className="text-sm font-medium text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            Trang {currentPage} / {totalPages}
          </div>
        </div>

        {loading ? renderSkeletons() : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {mangas.map((manga) => (
                <MangaCard key={manga.id} manga={manga} source={source} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function LatestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#06060c] flex items-center justify-center">
        <div className="text-purple-400 font-bold animate-pulse text-lg">Đang kết nối chiều không gian...</div>
      </div>
    }>
      <LatestContent />
    </Suspense>
  );
}
