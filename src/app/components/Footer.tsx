'use client';

import { Activity, ShieldAlert, Cpu, HardDrive } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [ping, setPing] = useState<number>(12);

  useEffect(() => {
    // Gia lap dao dong nhe do tre mang de tang cam giac thoi gian thuc
    const interval = setInterval(() => {
      setPing(Math.floor(Math.random() * 8) + 8);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="mt-20 border-t border-white/5 bg-black/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pb-8 border-b border-white/5">
          
          {/* Col 1: Brand Info */}
          <div className="text-center md:text-left">
            <span className="text-lg font-black tracking-tighter text-gradient-neon text-glow-purple">
              MANGA<span className="text-white font-light">-BLACK</span>
            </span>
            <p className="text-xs text-gray-500 mt-2">
              Goku black Super saiyan rose
            </p>
          </div>

          {/* Col 2: Miku Mascot */}
          <div className="text-center md:text-right flex flex-col md:items-end justify-center">
            <div className="relative group flex justify-center md:justify-end w-full">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img 
                src="/miku.png" 
                alt="Hatsune Miku Mascot" 
                className="h-16 w-16 object-cover rounded-full border border-cyan-500/30 relative z-10 drop-shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:scale-110 transition-transform duration-300 cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 text-[10px] text-gray-500 gap-4">
          <p>
            MANGA-BLACK &copy; {new Date().getFullYear()} - Nền tảng Độc quyền Tối thượng của Bạn.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
            <span className="hover:text-[#39C5BB] cursor-pointer transition" title="Điều khoản sử dụng">Trỗi dậy</span>
            <span className="hover:text-cyan-400 cursor-pointer transition" title="Chính sách bảo mật">Bóng tối sẽ tuân lệnh ta</span>
            <span className="hover:text-red-400 cursor-pointer transition" title="Liên hệ báo cáo">Ngươi đã được Hệ Thống lựa chọn</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
