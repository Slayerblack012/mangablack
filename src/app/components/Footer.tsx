'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.04] bg-[#07090e]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pb-8 border-b border-white/[0.04]">
          
          {/* Col 1: Brand Info */}
          <div className="text-center md:text-left flex flex-col gap-2">
            <span className="text-lg font-bold tracking-wider text-white font-display">
              MANGA<span className="text-[#c5a880] font-light">-BLACK</span>
            </span>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed mx-auto md:mx-0">
              Nền tảng đọc truyện trực tuyến cao cấp, mang lại trải nghiệm đọc truyện tuyệt đỉnh với công nghệ tối ưu WebP thời gian thực và đồng bộ đa nguồn hoàn toàn không chứa quảng cáo.
            </p>
          </div>

          {/* Col 2: Luxury Links */}
          <div className="flex justify-center md:justify-end gap-6 text-xs text-slate-400 font-bold flex-wrap">
            <Link href="/" className="hover:text-[#c5a880] transition-colors">Khám Phá</Link>
            <button 
              onClick={() => window.dispatchEvent(new Event('manga-open-history'))}
              className="hover:text-[#c5a880] transition-colors cursor-pointer"
            >
              Lịch Sử
            </button>
            <a href="#" className="hover:text-[#c5a880] transition-colors">Điều Khoản</a>
            <a href="#" className="hover:text-[#c5a880] transition-colors">Bảo Mật</a>
          </div>

        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 text-[10px] text-slate-500 gap-4">
          <p>
            MANGA-BLACK &copy; {new Date().getFullYear()} - Trải nghiệm độc giả cao cấp nhất.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end font-semibold">
            <span>Tối ưu hình ảnh WebP/AVIF</span>
            <span>•</span>
            <span>Dữ liệu cục bộ mã hóa</span>
            <span>•</span>
            <span>Đường truyền CDN băng thông rộng</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
