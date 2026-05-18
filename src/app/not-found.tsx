'use client';

import Link from 'next/link';
import { AlertCircle, Terminal, Home } from 'lucide-react';
import SoloLevelingAura from './components/SoloLevelingAura';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden font-sans">
      <SoloLevelingAura />
      
      {/* System Notification Window */}
      <div className="relative z-10 w-[90%] max-w-2xl mx-auto animate-[system-teleport_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] origin-center">
        
        {/* Futuristic Top/Bottom Borders */}
        <div className="absolute -top-4 left-0 right-0 h-4 border-t-4 border-cyan-400/80 shadow-[0_-5px_20px_rgba(34,211,238,0.5)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-cyan-300 shadow-[0_0_15px_#22d3ee]"></div>
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-300"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-300"></div>
        </div>

        <div className="absolute -bottom-4 left-0 right-0 h-4 border-b-4 border-cyan-400/80 shadow-[0_5px_20px_rgba(34,211,238,0.5)]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-cyan-300 shadow-[0_0_15px_#22d3ee]"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-300"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-300"></div>
        </div>

        {/* Inner Window */}
        <div className="bg-[#040f16]/90 backdrop-blur-xl border border-cyan-500/30 p-8 md:p-12 relative shadow-[inset_0_0_50px_rgba(8,145,178,0.2)]">
          
          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            
            {/* Header: [ ! ] NOTIFICATION */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)] bg-cyan-950/50">
                <AlertCircle className="h-6 w-6 text-cyan-300 drop-shadow-[0_0_8px_#22d3ee]" />
              </div>
              <div className="border-2 border-cyan-400/70 px-6 py-2 bg-cyan-950/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <h1 className="text-cyan-300 font-bold text-xl md:text-2xl tracking-[0.2em] drop-shadow-[0_0_8px_#22d3ee]">
                  SYSTEM ALERT
                </h1>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-4 mb-10 max-w-lg">
              <p className="text-white text-lg md:text-xl font-medium tracking-wide">
                Lỗi 404: Không tìm thấy Tọa Độ Không Gian.
              </p>
              <p className="text-cyan-100/70 text-sm md:text-base leading-relaxed">
                Vùng dữ liệu bạn đang cố gắng truy cập không tồn tại hoặc đã bị xóa khỏi Hệ Thống. 
                Bạn không đủ thẩm quyền hoặc mục tiêu đã biến mất.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <Link 
                href="/"
                className="group relative px-8 py-3 bg-cyan-950/50 border border-cyan-400 text-cyan-300 font-bold tracking-widest uppercase overflow-hidden hover:bg-cyan-900/80 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] flex items-center justify-center gap-2"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                <Home className="h-4 w-4" />
                Chấp Nhận Quay Về
              </Link>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
