'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.04] bg-[#07090e]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/[0.04]">
          
          {/* Col 1: Brand Info */}
          <div className="text-center md:text-left flex flex-col gap-2">
            <span className="text-lg font-bold tracking-wider text-white font-display">
              MANGA<span className="text-[#c5a880] font-light">-BLACK</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold pr-4">
              Thế giới đọc truyện trực tuyến tối thượng, mang lại trải nghiệm đọc truyện đỉnh cao dành riêng cho cộng đồng Wibu và Otaku chân chính hoàn toàn không chứa quảng cáo.
            </p>
          </div>

          {/* Links section */}
          <div className="flex flex-col gap-4 text-left">
            <h3 className="text-[10px] font-bold text-white tracking-widest uppercase">Danh Mục</h3>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400 font-semibold">
              <Link href="/" className="hover:text-[#c5a880] transition-colors">Trang Chủ</Link>
              <Link href="/latest" className="hover:text-[#c5a880] transition-colors">Mới Cập Nhật</Link>
            </div>
          </div>

          {/* Support section */}
          <div className="flex flex-col gap-4 text-left">
            <h3 className="text-[10px] font-bold text-white tracking-widest uppercase">Trợ Giúp</h3>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400 font-semibold">
              <button 
                onClick={() => window.dispatchEvent(new Event('manga-open-history'))}
                className="hover:text-[#c5a880] transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
              >
                Lịch Sử
              </button>
              <a href="#" className="hover:text-[#c5a880] transition-colors">Điều Khoản</a>
              <a href="#" className="hover:text-[#c5a880] transition-colors">Bảo Mật</a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 text-[10px] text-slate-500 gap-4">
          <p>
            MANGA-BLACK &copy; {new Date().getFullYear()} - Trải nghiệm độc giả cao cấp nhất.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end font-semibold">
            <span>Hình ảnh siêu sắc nét, mượt mà</span>
            <span>•</span>
            <span>Lưu lịch sử đọc thông minh</span>
            <span>•</span>
            <span>Đọc truyện cực nhanh, không giật lag</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
