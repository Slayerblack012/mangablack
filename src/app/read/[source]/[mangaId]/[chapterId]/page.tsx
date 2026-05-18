'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Settings, Info, RefreshCw, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { API_BASE } from '@/app/config';

interface PagesResponse {
  quality: string[];
  dataSaver: string[];
  fallbackActive: boolean;
}

interface ChapterItem {
  id: string;
  chapter: string;
  title: string;
}

function ReaderContent({ source, mangaId, chapterId }: { source: string; mangaId: string; chapterId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chapNum = searchParams.get('chapNum') || 'N/A';

  const [pages, setPages] = useState<string[]>([]);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hudVisible, setHudVisible] = useState<boolean>(true);
  
  // Navigation pointers
  const [prevChapter, setPrevChapter] = useState<ChapterItem | null>(null);
  const [nextChapter, setNextChapter] = useState<ChapterItem | null>(null);

  useEffect(() => {
    fetchPages();
    fetchChaptersFeed();
    saveReadHistory();
  }, [source, mangaId, chapterId]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/crawler/chapter-pages?id=${encodeURIComponent(chapterId)}&source=${source}`);
      const data: PagesResponse = await res.json();
      setPages(data.quality || []);
    } catch (e) {
      console.error('Loi tai trang anh truyen:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchChaptersFeed = async () => {
    try {
      const res = await fetch(`${API_BASE}/crawler/manga/${mangaId}/chapters?source=${source}&limit=99999`);
      const data = await res.json();
      const list: ChapterItem[] = data.data || [];
      setChapters(list);

      // Sap xep tang dan theo so chuong de tim chuong truoc/sau de dang
      const sorted = [...list].sort((a, b) => (parseFloat(a.chapter) || 0) - (parseFloat(b.chapter) || 0));
      
      const currentIndex = sorted.findIndex(ch => ch.id === chapterId || ch.chapter === chapNum);
      if (currentIndex !== -1) {
        setPrevChapter(currentIndex > 0 ? sorted[currentIndex - 1] : null);
        setNextChapter(currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null);
      }
    } catch (e) {
      console.error('Loi tai danh sach dinh tuyen chuong:', e);
    }
  };

  // Save reading history for continuation
  const saveReadHistory = async () => {
    try {
      // Lightweight parallel fetch to get manga title and cover
      const res = await fetch(`${API_BASE}/crawler/manga/${mangaId}?source=${source}`);
      const mangaData = await res.json();
      
      const mangaTitle = mangaData?.title || 'Manga';
      const coverUrl = mangaData?.coverUrl || '';

      const history = JSON.parse(localStorage.getItem('manga_history') || '[]');
      const filtered = history.filter((h: any) => !(h.mangaId === mangaId && h.source === source));
      
      filtered.unshift({
        mangaId,
        source,
        chapterId,
        chapterNum: chapNum,
        mangaTitle,
        coverUrl,
        timestamp: Date.now()
      });

      // Chi luu toi da 50 truyen doc gan nhat de tiet kiem bo nho local
      localStorage.setItem('manga_history', JSON.stringify(filtered.slice(0, 50)));

      // Dispatch a storage update event so the drawer or any active component updates
      window.dispatchEvent(new Event('manga-history-updated'));
    } catch (e) {
      console.error('Loi khi luu lich su doc:', e);
    }
  };

  const handleNextChapter = () => {
    if (nextChapter) {
      const cleanNextId = nextChapter.id.includes('/') ? nextChapter.id.split('/').pop() || nextChapter.id : nextChapter.id;
      router.push(`/read/${source}/${mangaId}/${encodeURIComponent(cleanNextId)}?chapNum=${nextChapter.chapter}`);
    }
  };

  const handlePrevChapter = () => {
    if (prevChapter) {
      const cleanPrevId = prevChapter.id.includes('/') ? prevChapter.id.split('/').pop() || prevChapter.id : prevChapter.id;
      router.push(`/read/${source}/${mangaId}/${encodeURIComponent(cleanPrevId)}?chapNum=${prevChapter.chapter}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#030306] flex flex-col items-center relative select-none">
      
      {/* 1. FLOATING CONTROL HUD BAR (Top & Bottom) */}
      <div 
        className={`fixed top-0 left-0 right-0 h-16 glass-nav z-50 flex items-center justify-between px-4 md:px-8 transition-transform duration-300 ${
          hudVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center gap-4 text-left">
          <Link 
            href={`/manga/${source}/${mangaId}`}
            className="p-2 hover:bg-white/10 rounded-full border border-white/5 text-gray-300 hover:text-white transition flex items-center justify-center"
            title="Quay lại chi tiết"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <div>
            <h1 className="text-sm font-black text-white truncate max-w-[180px] sm:max-w-[280px]">
              Chương {chapNum}
            </h1>
            <span className="text-[10px] text-purple-400 font-bold tracking-wider uppercase">
              Nguồn: {source === 'vn' ? 'VNmanga' : 'Global'}
            </span>
          </div>
        </div>

        {/* HUD Center Controls */}
        <div className="flex items-center bg-black/40 border border-white/5 rounded-full p-0.5">
          <button 
            onClick={handlePrevChapter}
            disabled={!prevChapter}
            className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
              prevChapter ? 'text-white hover:bg-white/10 cursor-pointer' : 'text-gray-600 cursor-not-allowed'
            }`}
            title="Chương trước"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <span className="px-4 text-xs font-black text-gray-200">
            Chap {chapNum}
          </span>

          <button 
            onClick={handleNextChapter}
            disabled={!nextChapter}
            className={`p-1.5 rounded-full transition-all flex items-center justify-center ${
              nextChapter ? 'text-white hover:bg-white/10 cursor-pointer' : 'text-gray-600 cursor-not-allowed'
            }`}
            title="Chương sau"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* HUD Right Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHudVisible(!hudVisible)}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition flex items-center justify-center border border-white/5"
            title="Ẩn giao diện HUD"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. CORE READ PAGE DISPLAY GRID */}
      <div 
        className="w-full max-w-[800px] flex flex-col py-20 px-0 md:px-4 cursor-pointer"
        onClick={() => setHudVisible(!hudVisible)}
      >
        {loading ? (
          <div className="flex flex-col gap-6 w-full py-4 px-4 md:px-0">
            <div className="w-full h-[600px] rounded-xl border border-white/5 skeleton-shimmer flex items-center justify-center relative overflow-hidden">
              <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase animate-pulse">Kích hoạt trang số 1...</span>
            </div>
            <div className="w-full h-[600px] rounded-xl border border-white/5 skeleton-shimmer flex items-center justify-center relative overflow-hidden">
              <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase animate-pulse">Đang giải mã CDN trang số 2...</span>
            </div>
            <div className="w-full h-[600px] rounded-xl border border-white/5 skeleton-shimmer flex items-center justify-center relative overflow-hidden">
              <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase animate-pulse">Tải trước trang số 3...</span>
            </div>
          </div>
        ) : pages.length === 0 ? (
          <div className="py-32 text-center text-red-400 font-bold text-sm bg-white/5 border border-white/5 rounded-2xl mx-4">
            Không tìm thấy trang truyện. Máy chủ CDN có thể bị lỗi, vui lòng quay lại sau!
          </div>
        ) : (
          pages.map((imgUrl, index) => (
            <div 
              key={index}
              className="relative w-full bg-[#030306] overflow-hidden min-h-[400px] md:min-h-[600px] flex items-center justify-center"
            >
              {/* Lazy skeleton screen underneath */}
              <div className="absolute inset-0 skeleton-shimmer flex items-center justify-center">
                <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">Trang {index + 1} / {pages.length}</span>
              </div>

              {/* Compressed image */}
              <img 
                src={`${API_BASE}/crawler/proxy-image?url=${encodeURIComponent(imgUrl)}&source=${source}`}
                alt={`Trang ${index + 1}`}
                loading="lazy"
                className="w-full h-auto object-contain relative z-10 block pointer-events-none"
              />
            </div>
          ))
        )}
      </div>

      {/* 3. FLOATING HUD SIDE ACTION BUTTONS */}
      {!hudVisible && (
        <button 
          onClick={() => setHudVisible(true)}
          className="fixed bottom-6 right-6 p-3 bg-purple-600/90 text-white rounded-full shadow-[0_0_15px_#8a2be2] border border-white/10 hover:scale-105 active:scale-95 transition-all z-50 flex items-center justify-center"
          title="Hiện giao diện HUD"
        >
          <Eye className="h-5 w-5" />
        </button>
      )}

      {/* 4. CHAPTER NAVIGATION END HUD */}
      {!loading && pages.length > 0 && (
        <div className="w-full max-w-lg mb-20 px-4 flex flex-col gap-4 text-center mt-6">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 glass-panel">
            <h3 className="font-extrabold text-sm text-gray-200 mb-2">BẠN ĐÃ ĐỌC XONG CHƯƠNG {chapNum}</h3>
            <p className="text-xs text-gray-500 mb-6">Nền tảng tự động lưu lại vị trí và tiến trình đọc của bạn.</p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handlePrevChapter}
                disabled={!prevChapter}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                  prevChapter 
                    ? 'bg-white/5 hover:bg-white/10 text-white border-white/10 cursor-pointer' 
                    : 'text-gray-600 border-white/5 cursor-not-allowed'
                }`}
              >
                Chương Trước
              </button>
              
              <button
                onClick={handleNextChapter}
                disabled={!nextChapter}
                className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                  nextChapter 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500/20 shadow-[0_0_15px_rgba(138,43,226,0.3)] cursor-pointer' 
                    : 'text-gray-600 border-white/5 cursor-not-allowed'
                }`}
              >
                Chương Sau
              </button>
            </div>
            
            <Link 
              href={`/manga/${source}/${mangaId}`}
              className="block mt-4 text-[10px] font-bold text-purple-400 hover:text-white transition uppercase tracking-wider"
            >
              Quay lại danh mục truyện
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}

// Docking Component
export default function ReaderPage({ params }: { params: Promise<{ source: string; mangaId: string; chapterId: string }> }) {
  const resolvedParams = use(params);
  const { source, mangaId, chapterId } = resolvedParams;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030306] flex items-center justify-center">
        <div className="text-purple-500 font-bold animate-pulse text-xs tracking-wider">Đang khởi tạo máy đọc an toàn...</div>
      </div>
    }>
      <ReaderContent source={source} mangaId={mangaId} chapterId={decodeURIComponent(chapterId)} />
    </Suspense>
  );
}
