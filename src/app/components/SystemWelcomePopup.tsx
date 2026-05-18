'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Sparkles, Compass, ShieldAlert, Zap } from 'lucide-react';

export default function SystemWelcomePopup() {
  const [show, setShow] = useState(false);
  const [teleporting, setTeleporting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if the user has already seen the welcome message
    const seen = localStorage.getItem('manga_welcome_seen');
    if (!seen) {
      // Delay slightly for dramatic entry
      const timer = setTimeout(() => {
        setShow(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted || !show) return null;

  const handleTeleportClose = () => {
    setTeleporting(true);
    // Simulate teleport flash out animation before closing completely
    setTimeout(() => {
      localStorage.setItem('manga_welcome_seen', 'true');
      setShow(false);
      setTeleporting(false);
    }, 600);
  };

  return (
    <div 
      className={`fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-500 ${
        teleporting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'
      }`}
    >
      
      {/* Teleport flash beam overlay */}
      {teleporting && (
        <div className="absolute inset-0 bg-white z-[9999999] animate-pulse duration-100 mix-blend-difference pointer-events-none"></div>
      )}

      {/* Cyber System Window with 404 Teleport Animation */}
      <div 
        className={`relative w-full max-w-lg mx-auto ${
          teleporting 
            ? 'animate-out fade-out zoom-out-95 duration-300' 
            : 'animate-[system-teleport_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards] origin-center'
        }`}
      >
        
        {/* Glowing top cyan/teal borders */}
        <div className="absolute -top-4 left-0 right-0 h-4 border-t-4 border-cyan-400/80 shadow-[0_-5px_20px_rgba(34,211,238,0.5)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-cyan-300 shadow-[0_0_15px_#22d3ee]"></div>
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-300"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-300"></div>
        </div>

        {/* Glowing bottom cyan/teal borders */}
        <div className="absolute -bottom-4 left-0 right-0 h-4 border-b-4 border-cyan-400/80 shadow-[0_5px_20px_rgba(34,211,238,0.5)]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-cyan-300 shadow-[0_0_15px_#22d3ee]"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-300"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-300"></div>
        </div>

        {/* Inner Window Body */}
        <div className="bg-[#040f16]/95 backdrop-blur-2xl border border-cyan-500/35 p-6 md:p-10 relative overflow-hidden shadow-[inset_0_0_40px_rgba(8,145,178,0.3)] rounded-sm">
          
          {/* Grid/Scanline cyber background mask */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-25"></div>
          <div className="absolute inset-0 pointer-events-none bg-hud-scanlines opacity-10"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            
            {/* Header: [ ! ] QUEST ACTIVE */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full border border-cyan-400/70 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.4)] bg-cyan-950/40">
                <AlertCircle className="h-5 w-5 text-cyan-300 animate-pulse" />
              </div>
              <div className="border border-cyan-400/50 px-4 py-1.5 bg-cyan-950/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <h2 className="text-cyan-300 font-black text-sm tracking-[0.25em] uppercase font-mono drop-shadow-[0_0_8px_#22d3ee]">
                  Nhiem Vu Hang Ngay
                </h2>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mb-4 uppercase text-glow-purple">
              Chuyen Giao Y Chi Hoang De
            </h1>

            {/* Message Body */}
            <div className="space-y-3.5 mb-8 max-w-sm text-left border-l-2 border-cyan-500/40 pl-3 bg-cyan-950/10 py-3 rounded-r-md">
              <p className="text-xs text-cyan-300 font-mono font-bold">
                [HET THONG]: Cong dich chuyen chieu khong gian da mo.
              </p>
              <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
                Ban da duoc Lua Chon boi Bong Toi. Hay kiet tac vao vu tru truyen tranh tuyet mat de thu thap EXP nang luc, dot pha suc manh thot xep hang linh hon cua ban.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-500/10 text-[10px] font-mono text-cyan-400/70">
                <div>- DIEM DEN: Manga-Black</div>
                <div>- TRANG THAI: San Sang</div>
              </div>
            </div>

            {/* Interactive Teleport Trigger Button */}
            <button
              onClick={handleTeleportClose}
              className="group relative w-full sm:w-auto px-8 py-3 bg-cyan-950/60 border border-cyan-400 text-cyan-300 font-black text-xs tracking-widest uppercase overflow-hidden hover:bg-cyan-900/80 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
              <Compass className="h-4 w-4 text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />
              Kich Hoat Dich Chuyen
            </button>

          </div>
        </div>
      </div>

    </div>
  );
}
