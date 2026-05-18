'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Trash2, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { API_BASE, getSecureProxyUrl } from '../config';

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
  const [showConfirm, setShowConfirm] = useState(false);

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
    window.dispatchEvent(new Event('manga-history-updated'));
  };

  const clearAllHistory = () => {
    setShowConfirm(true);
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
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[99998] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      ></div>

      {/* Main Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:max-w-md bg-[#07090e] border-l border-white/[0.05] z-[99999] shadow-[-10px_0_40px_rgba(0,0,0,0.6)] flex flex-col transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.05] bg-white/[0.01]">
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-[#c5a880]" />
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">
              Lịch Sử Đọc Truyện
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition flex items-center justify-center border border-transparent hover:border-white/5 cursor-pointer"
            title="Đóng bảng lịch sử"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-grow overflow-y-auto px-5 py-6 flex flex-col gap-4 custom-scrollbar bg-black/[0.02]">
          {history.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center gap-4 px-4 py-20">
              <div className="h-14 w-14 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center shadow-inner">
                <Clock className="h-6 w-6 text-slate-500/50" />
              </div>
              <div className="max-w-xs">
                <h3 className="text-xs font-bold text-slate-300 mb-1 tracking-wider uppercase">LỊCH SỬ TRỐNG</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  Bạn chưa đọc tác phẩm nào gần đây. Hãy bắt đầu chọn một tác phẩm để theo dõi tiến độ đọc của mình!
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
                  className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 flex gap-3.5 relative group hover:border-[#c5a880]/30 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                >
                  {/* Poster Image */}
                  <Link
                    href={`/manga/${item.source}/${item.mangaId}`}
                    onClick={() => setIsOpen(false)}
                    className="h-20 w-15 rounded-lg overflow-hidden border border-white/[0.08] flex-shrink-0 bg-slate-950 relative group cursor-pointer shadow-md"
                  >
                    <img
                      src={item.coverUrl ? getSecureProxyUrl(item.coverUrl, item.source) : '/warning.svg'}
                      alt={item.mangaTitle}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = '/warning.svg'; }}
                    />
                  </Link>

                  {/* Item Metadata Details */}
                  <div className="flex-grow flex flex-col justify-between text-left min-w-0 pr-8">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                          item.source === 'vn'
                            ? 'bg-[#c5a880]/10 text-[#c5a880] border-[#c5a880]/20'
                            : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                        }`}>
                          {item.source === 'vn' ? 'VNmanga' : 'Global'}
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold">
                          {getRelativeTime(item.timestamp)}
                        </span>
                      </div>
                      
                      <Link
                        href={`/manga/${item.source}/${item.mangaId}`}
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-bold text-white hover:text-[#c5a880] transition-colors block truncate pr-1"
                        title={item.mangaTitle}
                      >
                        {item.mangaTitle}
                      </Link>

                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                        Đang đọc: <span className="text-[#c5a880] font-bold">Chương {item.chapterNum}</span>
                      </span>
                    </div>

                    <Link
                      href={continueUrl}
                      onClick={() => setIsOpen(false)}
                      className="mt-2.5 px-3 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-[#c5a880]/40 text-slate-200 hover:text-white font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 w-fit transition-all shadow-sm"
                    >
                      <BookOpen className="h-3 w-3" /> Đọc tiếp <ArrowRight className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Single Delete Button */}
                  <button
                    onClick={() => deleteItem(item.mangaId, item.source)}
                    className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/10 rounded-lg border border-transparent hover:border-red-900/20 transition cursor-pointer"
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
          <div className="p-4 border-t border-white/[0.05] bg-white/[0.01] flex gap-2">
            <button
              onClick={clearAllHistory}
              className="w-full py-2.5 rounded-xl border border-red-500/20 hover:border-red-500/40 bg-red-950/5 hover:bg-red-950/15 text-red-400 hover:text-red-300 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Xoá Sạch Lịch Sử
            </button>
          </div>
        )}
      </div>

      {/* Custom Solo Leveling-inspired System Prompt Alert */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[999999] flex items-center justify-center select-none transition-all duration-300 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 bg-[#0a0d14] border-2 border-red-500/50 rounded-xl p-7 md:p-8 shadow-[0_0_60px_rgba(239,68,68,0.2)] text-center overflow-hidden">
            {/* Solo Leveling neon-red ambient radial lighting */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/[0.04] to-transparent pointer-events-none" />
            
            <div className="text-xs md:text-sm font-black text-red-500 tracking-[0.3em] uppercase mb-3 animate-pulse font-mono">
              🚨 HỆ THỐNG CẢNH BÁO 🚨
            </div>
            
            <h3 className="text-lg md:text-xl font-black text-white tracking-widest uppercase mb-5 border-b border-red-500/20 pb-4 font-mono">
              [ RESET LỊCH SỬ ĐỌC ]
            </h3>
            
            <div className="text-slate-200 leading-relaxed mb-6">
              <p className="text-sm md:text-base font-extrabold mb-4 leading-snug">
                Bạn có chắc chắn muốn thi hành chỉ thị xóa bỏ toàn bộ lịch sử đọc truyện?
              </p>
              
              <div className="bg-black/60 p-4.5 rounded-lg border border-red-500/20 text-left">
                <span className="text-xs md:text-sm text-red-400 font-black block mb-1.5 tracking-wide font-mono">
                  HỆ THỐNG CẢNH BÁO:
                </span>
                <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
                  Sau khi được thi hành, toàn bộ bản ghi tiến trình đọc truyện của ký chủ sẽ bị xóa bỏ vĩnh viễn khỏi phân khu lưu trữ cục bộ của hệ thống.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center font-black">
              <button
                onClick={() => {
                  localStorage.removeItem('manga_history');
                  setHistory([]);
                  window.dispatchEvent(new Event('manga-history-updated'));
                  setShowConfirm(false);
                }}
                className="flex-1 py-3 px-6 border border-red-500 bg-red-950/40 text-red-400 hover:bg-red-500 hover:text-white rounded-lg active:scale-95 transition duration-200 text-xs md:text-sm uppercase tracking-widest cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.35)] font-mono animate-glow"
              >
                [ CHẤP NHẬN ]
              </button>
              
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 px-6 border border-slate-700 bg-slate-900/40 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg active:scale-95 transition duration-200 text-xs md:text-sm uppercase tracking-widest cursor-pointer font-mono"
              >
                [ TỪ CHỐI ]
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
