'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Trash2, BookOpen, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { API_BASE } from '../config';

interface HistoryItem {
  mangaId: string;
  source: string;
  chapterId: string;
  chapterNum: string;
  mangaTitle: string;
  coverUrl: string;
  timestamp: number;
}

export default function HistoryDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadHistory();

    const handleOpen = () => setIsOpen(true);
    const handleUpdate = () => loadHistory();

    window.addEventListener('manga-open-history', handleOpen);
    window.addEventListener('manga-history-updated', handleUpdate);

    return () => {
      window.removeEventListener('manga-open-history', handleOpen);
      window.removeEventListener('manga-history-updated', handleUpdate);
    };
  }, []);

  const loadHistory = () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = JSON.parse(localStorage.getItem('manga_history') || '[]');
      setHistory(saved);
    } catch (e) {
      console.error('Error loading history:', e);
    }
  };

  const deleteItem = (mangaId: string, source: string) => {
    const updated = history.filter(item => !(item.mangaId === mangaId && item.source === source));
    localStorage.setItem('manga_history', JSON.stringify(updated));
    setHistory(updated);
    // Dispatch events to notify other components (e.g. details page)
    window.dispatchEvent(new Event('manga-history-updated'));
  };

  const clearAllHistory = () => {
    if (confirm('Hệ thống sẽ xoá toàn bộ lịch sử đọc truyện của bạn. Xác nhận thực hiện?')) {
      localStorage.removeItem('manga_history');
      setHistory([]);
      window.dispatchEvent(new Event('manga-history-updated'));
    }
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop overlay with transition */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      ></div>

      {/* Main Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:max-w-md bg-[#040815]/95 border-l border-cyan-500/30 z-[99999] shadow-[0_0_35px_rgba(6,182,212,0.2)] flex flex-col transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Holographic Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-hud-scanlines opacity-[0.03] z-20"></div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-cyan-950/20 relative">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
            <h2 className="text-xs font-black text-cyan-400 tracking-widest uppercase font-mono flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Nhật Ký Hành Trình
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition flex items-center justify-center border border-white/5 cursor-pointer"
            title="Đóng bảng lịch sử"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-grow overflow-y-auto px-5 py-6 flex flex-col gap-4 custom-scrollbar bg-black/10 z-10">
          {history.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center gap-4 px-4 py-20">
              <div className="h-16 w-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shadow-inner relative group overflow-hidden">
                <Clock className="h-7 w-7 text-cyan-500/50 group-hover:scale-110 transition duration-300" />
                <div className="absolute inset-0 bg-[#39C5BB]/5 animate-ping rounded-full"></div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-300 mb-1 font-mono uppercase tracking-wider">CỔNG TRUYỆN CHƯA MỞ</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                  Hệ thống chưa tìm thấy dữ liệu vết chân linh hồn của bạn. Hãy bước chân vào các cổng truyện để lưu lại tiến trình!
                </p>
              </div>
            </div>
          ) : (
            history.map((item) => {
              const cleanId = item.chapterId.includes('/') ? item.chapterId.split('/').pop() || item.chapterId : item.chapterId;
              const continueUrl = `/read/${item.source}/${item.mangaId}/${encodeURIComponent(cleanId)}?chapNum=${item.chapterNum}`;
              
              return (
                <div
                  key={`${item.source}-${item.mangaId}`}
                  className="bg-white/3 border border-white/5 rounded-xl p-3 flex gap-3.5 relative group hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.06)]"
                >
                  {/* Poster Image */}
                  <Link
                    href={`/manga/${item.source}/${item.mangaId}`}
                    onClick={() => setIsOpen(false)}
                    className="h-20 w-15 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-gray-950 relative group cursor-pointer"
                  >
                    <img
                      src={item.coverUrl ? `${API_BASE}/crawler/proxy-image?url=${encodeURIComponent(item.coverUrl)}&source=${item.source}` : '/warning.svg'}
                      alt={item.mangaTitle}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => { e.currentTarget.src = '/warning.svg'; }}
                    />
                  </Link>

                  {/* Item Metadata Details */}
                  <div className="flex-grow flex flex-col justify-between text-left min-w-0 pr-8">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={`px-2 py-0.2 rounded text-[8px] font-black uppercase tracking-wider border ${
                          item.source === 'vn'
                            ? 'bg-purple-950/20 text-purple-400 border-purple-500/20'
                            : 'bg-cyan-950/20 text-cyan-400 border-cyan-500/20'
                        }`}>
                          {item.source === 'vn' ? 'VNmanga' : 'Global'}
                        </span>
                        <span className="text-[9px] text-gray-500 font-mono font-bold">
                          {getRelativeTime(item.timestamp)}
                        </span>
                      </div>
                      
                      <Link
                        href={`/manga/${item.source}/${item.mangaId}`}
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-black text-white hover:text-cyan-400 transition-colors block truncate pr-1"
                        title={item.mangaTitle}
                      >
                        {item.mangaTitle}
                      </Link>

                      <span className="text-[10px] text-cyan-400 font-extrabold block mt-0.5 font-mono">
                        Đang đọc: Chương {item.chapterNum}
                      </span>
                    </div>

                    <Link
                      href={continueUrl}
                      onClick={() => setIsOpen(false)}
                      className="mt-2.5 px-3 py-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-700 text-white font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1 w-fit transition shadow-sm"
                    >
                      <BookOpen className="h-3 w-3" /> Đọc tiếp <ArrowRight className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Single Delete Button */}
                  <button
                    onClick={() => deleteItem(item.mangaId, item.source)}
                    className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/20 rounded-md border border-transparent hover:border-red-900/30 transition cursor-pointer"
                    title="Xoá khỏi lịch sử"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer Actions */}
        {history.length > 0 && (
          <div className="p-4 border-t border-cyan-500/20 bg-cyan-950/10 z-10 flex gap-2">
            <button
              onClick={clearAllHistory}
              className="w-full py-2.5 rounded-xl border border-red-500/30 hover:border-red-500/50 bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300 font-extrabold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Xoá Sạch Nhật Ký
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .bg-hud-scanlines {
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.25) 50%
          ), linear-gradient(
            90deg, 
            rgba(255, 0, 0, 0.06), 
            rgba(0, 255, 0, 0.02), 
            rgba(0, 0, 255, 0.06)
          );
          background-size: 100% 4px, 6px 100%;
        }
      `}</style>
    </>
  );
}
