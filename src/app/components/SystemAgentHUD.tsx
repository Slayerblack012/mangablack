'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, Shield, Compass, Sparkles, Activity, Cpu, Sliders, Play, X, MessageSquare, Zap, Target } from 'lucide-react';
import { API_BASE } from '../config';

interface TerminalLine {
  text: string;
  type: 'system' | 'user' | 'success' | 'error' | 'appraisal';
}

export default function SystemAgentHUD() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<TerminalLine[]>([]);
  const [systemPing, setSystemPing] = useState(14);
  const [hunterRank, setHunterRank] = useState('E-Rank');
  const [hunterTitle, setHunterTitle] = useState('Tan Binh Dot Bien');
  const [isExtracting, setIsExtracting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Initialize system greeting
    setTerminalLogs([
      { text: 'SYSTEM VERSION 2.0.4 - DETECTING DIMENSION...', type: 'system' },
      { text: '[HET THONG]: Ket noi chieu khong gian hoan tat.', type: 'success' },
      { text: '[HET THONG]: Xin chao Tho San. Hay nhap lenh hoac nhan cac chi thi duoi day.', type: 'system' }
    ]);

    // Network delay fluctuation simulator
    const pingInterval = setInterval(() => {
      setSystemPing(Math.floor(Math.random() * 8) + 10);
    }, 5000);

    return () => clearInterval(pingInterval);
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, isOpen]);

  // Recalculate rank on load or open
  useEffect(() => {
    if (!mounted) return;
    const history = JSON.parse(localStorage.getItem('manga_history') || '[]');
    const count = history.length;
    
    if (count >= 30) {
      setHunterRank('S-Rank');
      setHunterTitle('Hoang De Bong Toi');
    } else if (count >= 15) {
      setHunterRank('A-Rank');
      setHunterTitle('Bong Ma Doc Hanh');
    } else if (count >= 5) {
      setHunterRank('C-Rank');
      setHunterTitle('Tho San Ham Nguc');
    } else {
      setHunterRank('E-Rank');
      setHunterTitle('Tan Binh Dot Bien');
    }
  }, [isOpen, mounted]);

  if (!mounted) return null;

  const pushLog = (text: string, type: 'system' | 'user' | 'success' | 'error' | 'appraisal') => {
    setTerminalLogs(prev => [...prev, { text, type }]);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.trim().toLowerCase();
    if (!cmd) return;

    pushLog(`> ${command}`, 'user');
    setCommand('');

    setTimeout(() => {
      processCommand(cmd);
    }, 200);
  };

  const processCommand = (cmd: string) => {
    const args = cmd.split(' ');
    const primary = args[0];

    switch (primary) {
      case 'help':
      case '/help':
      case '?':
        pushLog('[HET THONG] Cac chi thi kha dung:', 'system');
        pushLog('  /rank    - Giam dinh xep hang va nang luc cua Tho San', 'system');
        pushLog('  /extract - Trich xuat du lieu 1 bo truyen pho bien ngau nhien', 'system');
        pushLog('  /gate    - Dich chuyen sang phan loai truyen ngau nhien', 'system');
        pushLog('  /status  - Hien thi thong so an toan va hieu nang proxy', 'system');
        pushLog('  /clear   - Xoa sach nhat ky dieu hanh', 'system');
        break;
      case 'clear':
      case '/clear':
        setTerminalLogs([]);
        break;
      case 'rank':
      case '/rank':
        runAppraisal();
        break;
      case 'extract':
      case '/extract':
        runExtraction();
        break;
      case 'gate':
      case '/gate':
        runGateTeleport();
        break;
      case 'status':
      case '/status':
        runStatusCheck();
        break;
      default:
        pushLog(`[CANH BAO]: Chi thi "${cmd}" khong ton tai. Nhap "/help" de tro giup.`, 'error');
    }
  };

  // 1. Appraisal Action (Giám định thợ săn)
  const runAppraisal = () => {
    pushLog('[HET THONG]: Dang quet thong tin linh hon tu LocalStorage...', 'system');
    
    setTimeout(() => {
      const history = JSON.parse(localStorage.getItem('manga_history') || '[]');
      const favorites = JSON.parse(localStorage.getItem('manga_favorites') || '[]');
      const readChaptersCount = history.length;
      const favoritesCount = favorites.length;

      // Stats calculation
      const baseHp = 100 + readChaptersCount * 12;
      const baseMp = 50 + favoritesCount * 25;
      const speed = Math.min(99, 10 + readChaptersCount * 3);
      const level = Math.floor(readChaptersCount / 3) + 1;

      pushLog('=========== KET QUA GIAM DINH THO SAN ===========', 'appraisal');
      pushLog(`- CAP DO (LEVEL): ${level}`, 'appraisal');
      pushLog(`- DANH HIEU: ${hunterTitle}`, 'appraisal');
      pushLog(`- XEP HANG (RANK): ${hunterRank}`, 'appraisal');
      pushLog(`- SINH LUC (HP): ${baseHp} | MA PHAP (MP): ${baseMp}`, 'appraisal');
      pushLog(`- TOC DO DI CHUYEN: ${speed}/99`, 'appraisal');
      pushLog(`- CHI CHIEN TIU (DA DOC): ${readChaptersCount} chuong truyen`, 'appraisal');
      pushLog(`- TRUYEN DONG BO (YEU THICH): ${favoritesCount} tac pham`, 'appraisal');
      pushLog('-------------------------------------------------', 'appraisal');
      
      if (hunterRank === 'S-Rank') {
        pushLog('[HET THONG]: Bong toi se tuan lenh ta. Troi day!', 'success');
      } else {
        pushLog('[HET THONG]: Ban dang tren con duong tro thanh Chuyen Gia. Hay tiep tuc vuot qua ham nguc!', 'success');
      }
    }, 600);
  };

  // 2. Extraction Action (Trích xuất chỉ số - Recommend)
  const runExtraction = async () => {
    if (isExtracting) return;
    setIsExtracting(true);
    pushLog('[HET THONG]: Dang truy cap mang luoi thong tin chieu khong gian...', 'system');
    
    try {
      const savedSource = localStorage.getItem('manga_source') || 'global';
      // Fetch popular list
      const res = await fetch(`${API_BASE}/crawler/popular?source=${savedSource}&limit=24`);
      const data = await res.json();
      const list = data.data || [];

      if (list.length === 0) {
        throw new Error('Database empty');
      }

      pushLog('[HET THONG]: Dang dinh vi muc tieu tiem nang...', 'system');
      
      setTimeout(() => {
        const randomManga = list[Math.floor(Math.random() * list.length)];
        pushLog(`[TRICH XUAT THANH CONG]: Da khoa muc tieu: "${randomManga.title}"`, 'success');
        pushLog('[HET THONG]: Kich hoat cong dich chuyen den trang chi tiet sau 2 giay...', 'system');
        
        setTimeout(() => {
          setIsExtracting(false);
          setIsOpen(false);
          router.push(`/manga/${savedSource}/${randomManga.id}`);
        }, 2000);
      }, 1000);

    } catch (e) {
      pushLog('[LOI TRICH XUAT]: Khong the ket noi den cong truyen tranh.', 'error');
      setIsExtracting(false);
    }
  };

  // 3. Gate Teleport Action (Cổng không gian)
  const runGateTeleport = () => {
    pushLog('[HET THONG]: Dang lay danh sach cac Cong Khong Gian hien co...', 'system');
    
    setTimeout(() => {
      const gates = ['action', 'fantasy', 'romance', 'comedy', 'shounen', 'isekai'];
      const randomGate = gates[Math.floor(Math.random() * gates.length)];
      
      pushLog(`[CONG MO]: Cong chieu khong gian tag "${randomGate.toUpperCase()}" da duoc mo.`, 'success');
      pushLog('[HET THONG]: Kich hoat buoc nhay khong gian tro ve Trang Chu...', 'system');
      
      setTimeout(() => {
        setIsOpen(false);
        router.push(`/?search=&category=${randomGate}`);
      }, 1500);
    }, 800);
  };

  // 4. Status Check Action (Kiểm tra hệ thống)
  const runStatusCheck = () => {
    pushLog('=========== THONG SO HE THONG MA HOA ===========', 'system');
    pushLog(`- DO TRE MANG (LATENCY): ${systemPing}ms (Sieu Nhanh)`, 'system');
    pushLog('- AN TOAN PROXY: Kich Hoat (Strict Domain Whitelist)', 'system');
    pushLog('- PHONG VE SSRF: Kich Hoat (Chan IP Localhost/Private)', 'system');
    pushLog('- CHE DO HINH ANH: Auto-transcode WebP (Turbo Mode Active)', 'system');
    pushLog('- TOC DO NEN: Effort level 2 | Chat luong 75%', 'system');
    pushLog('- CACHE HIT RATE: 91.2% (Giam tai server toi da)', 'system');
    pushLog('-------------------------------------------------', 'system');
    pushLog('[HET THONG]: Tat ca cac thong so deu an toan va dat hieu suat dinh cao.', 'success');
  };

  return (
    <>
      {/* Floating System Icon Trigger */}
      <div className="fixed bottom-6 left-6 z-[9999]">
        <button
          onClick={() => setIsOpen(true)}
          className="relative h-12 w-12 rounded-full bg-black/85 border border-[#39C5BB] flex items-center justify-center shadow-[0_0_15px_#39C5BB] hover:scale-110 active:scale-95 transition-all group cursor-pointer overflow-hidden"
        >
          {/* Pulsing light */}
          <div className="absolute inset-0 bg-[#39C5BB]/10 animate-ping rounded-full"></div>
          
          <Terminal className="h-5 w-5 text-[#39C5BB] group-hover:rotate-6 transition-transform" />
          
          {/* Subtle glow border */}
          <div className="absolute inset-0 border border-white/5 rounded-full"></div>
        </button>
      </div>

      {/* System HUD Panel Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Central System Interface */}
          <div className="relative w-full max-w-2xl bg-[#030712]/95 border-2 border-cyan-500/50 rounded-lg overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.3)] glass-panel animate-in zoom-in-95 duration-250 flex flex-col max-h-[85vh]">
            
            {/* Cyber Scanline effect */}
            <div className="absolute inset-0 pointer-events-none bg-hud-scanlines opacity-10 z-20"></div>
            
            {/* HUD Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-cyan-950/40 border-b border-cyan-500/30 relative">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
                <span className="text-xs font-black text-cyan-400 tracking-widest uppercase font-mono">
                  Bieu Do Dieu Hanh He Thong
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-gray-500 font-mono">
                  PING: <span className="text-cyan-400">{systemPing}ms</span>
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition flex items-center justify-center border border-white/5"
                  title="Dong giao dien"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Hunter Rank Overview HUD Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-cyan-500/20 bg-cyan-950/10">
              
              {/* Profile Rank */}
              <div className="p-3 flex items-center gap-3 border-r border-cyan-500/10">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-black text-sm border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  {hunterRank.split('-')[0]}
                </div>
                <div className="text-left">
                  <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider">Xep Hang Linh Hon</span>
                  <span className="text-xs font-black text-white">{hunterRank}</span>
                </div>
              </div>

              {/* Persona Title */}
              <div className="p-3 flex items-center gap-3 border-r border-cyan-500/10">
                <Zap className="h-5 w-5 text-cyan-400 animate-pulse" />
                <div className="text-left">
                  <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider">Danh Hieu Hien Tai</span>
                  <span className="text-xs font-black text-cyan-400 truncate max-w-[140px] block">{hunterTitle}</span>
                </div>
              </div>

              {/* Server Security status */}
              <div className="p-3 flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-400" />
                <div className="text-left">
                  <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider">Lop Bao Ve Quoc Gia</span>
                  <span className="text-xs font-black text-green-400">Security Active</span>
                </div>
              </div>

            </div>

            {/* Terminal Logging logs */}
            <div className="flex-grow p-4 overflow-y-auto font-mono text-xs flex flex-col gap-2 min-h-[250px] bg-black/40 pr-2 custom-scrollbar text-left select-text">
              {terminalLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed whitespace-pre-wrap ${
                    log.type === 'system'
                      ? 'text-cyan-400'
                      : log.type === 'user'
                      ? 'text-white font-bold'
                      : log.type === 'success'
                      ? 'text-green-400 font-extrabold'
                      : log.type === 'error'
                      ? 'text-red-400 font-extrabold'
                      : 'text-purple-400 font-bold border-l-2 border-purple-500 pl-2 py-0.5 bg-purple-950/10'
                  }`}
                >
                  {log.text}
                </div>
              ))}
              <div ref={terminalEndRef}></div>
            </div>

            {/* Interactive System Directives Console panel */}
            <div className="p-3 bg-cyan-950/20 border-t border-cyan-500/20 flex flex-wrap gap-2 justify-center">
              
              <button
                onClick={runAppraisal}
                className="flex items-center gap-1 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 rounded text-[11px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
              >
                <Sliders className="h-3.5 w-3.5" /> Giam Dinh Tho San
              </button>

              <button
                onClick={runExtraction}
                disabled={isExtracting}
                className="flex items-center gap-1 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 rounded text-[11px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Target className="h-3.5 w-3.5" /> Trich Xuat Muc Tieu
              </button>

              <button
                onClick={runGateTeleport}
                className="flex items-center gap-1 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 rounded text-[11px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
              >
                <Compass className="h-3.5 w-3.5" /> Mo Cong Gate
              </button>

              <button
                onClick={runStatusCheck}
                className="flex items-center gap-1 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 rounded text-[11px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
              >
                <Activity className="h-3.5 w-3.5" /> Status Kiem Tra
              </button>

            </div>

            {/* Input terminal shell */}
            <form onSubmit={handleCommandSubmit} className="flex border-t border-cyan-500/30 bg-[#030712] relative">
              <span className="flex items-center pl-4 pr-1 text-cyan-500 font-mono text-xs select-none">
                $
              </span>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Nhap chi thi vao day (vi du: /help, /rank, /status, /clear)..."
                className="flex-grow bg-transparent border-0 text-white placeholder-gray-600 focus:outline-none focus:ring-0 text-xs font-mono py-3 px-1"
              />
              <button
                type="submit"
                className="bg-cyan-950/60 hover:bg-cyan-900/80 border-l border-cyan-500/30 px-6 py-2.5 text-cyan-400 font-black text-[10px] uppercase font-mono tracking-widest transition"
              >
                Goi
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Futuristic Scanline and Cyber grid styles */}
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
