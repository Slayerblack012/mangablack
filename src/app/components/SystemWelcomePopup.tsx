'use client';

import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

export default function SystemWelcomePopup() {
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const seen = localStorage.getItem('manga_welcome_seen');
    if (!seen) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted || !show) return null;

  const handleClose = () => {
    setFading(true);
    setTimeout(() => {
      localStorage.setItem('manga_welcome_seen', 'true');
      setShow(false);
      setFading(false);
    }, 450);
  };

  return (
    <div 
      className={`fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-all duration-500 ease-in-out ${
        fading ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Outer elegant card with champagne gold highlights */}
      <div className="relative w-full max-w-md mx-auto bg-[#0b0e14]/90 border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Soft elegant warm ambient glow */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-[#c5a880]/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-[#6366f1]/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col items-center text-center gap-5">
          {/* Logo/Icon Container */}
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#c5a880]/20 to-[#6366f1]/20 border border-[#c5a880]/30 flex items-center justify-center shadow-lg">
            <BookOpen className="h-5 w-5 text-[#c5a880]" />
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#c5a880]">Chào Mừng Bạn Đến Với</span>
            <h1 className="text-2xl font-black text-white mt-1 font-display tracking-tight">
              MANGA<span className="text-[#c5a880] font-light">-BLACK</span>
            </h1>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
            Trải nghiệm thế giới truyện tranh đỉnh cao được thiết kế riêng cho các Wibu và Otaku chân chính, tự động ghi nhớ lịch sử đọc thông minh và giao diện tối giản sang trọng hoàn toàn không chứa quảng cáo.
          </p>

          <div className="w-full border-t border-white/[0.05] pt-4 flex flex-col gap-1.5 text-[10px] text-slate-400 font-medium">
            <div className="flex justify-between">
              <span>● Trải nghiệm hình ảnh:</span>
              <span className="text-slate-200 font-semibold">Siêu Sắc Nét, Mượt Mà</span>
            </div>
            <div className="flex justify-between">
              <span>● Tốc độ tải truyện:</span>
              <span className="text-[#c5a880] font-semibold">Siêu Tốc Không Giật Lag</span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full mt-2 py-3 bg-gradient-to-r from-[#c5a880] to-[#b59250] text-[#07090e] font-bold text-xs uppercase tracking-wider rounded-xl hover:shadow-[0_8px_25px_rgba(197,168,128,0.25)] transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            Bắt đầu hành trình
          </button>
        </div>
      </div>
    </div>
  );
}
