'use client';

import { useState, useEffect } from 'react';
import { X, Award, Shield, Zap, Sparkles, Plus, Check, Edit2 } from 'lucide-react';

interface StatusScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate: () => void;
}

export default function StatusScreenModal({ isOpen, onClose, onProfileUpdate }: StatusScreenModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Customizable fields
  const [userName, setUserName] = useState('Hoàng Đế Bóng Tối');
  const [userTitle, setUserTitle] = useState('Bóng Ma Độc Hành');
  
  // Gamified status metrics
  const [level, setLevel] = useState(3);
  const [fatigue] = useState(0);
  const [hp, setHp] = useState(11035);
  const [mp, setMp] = useState(1022);

  // Dynamic RPG stats (load/save from local storage)
  const [stats, setStats] = useState({
    strength: 132,
    vitality: 91,
    agility: 111,
    intelligence: 70,
    sense: 93,
  });
  const [remainingPoints, setRemainingPoints] = useState(10);

  useEffect(() => {
    setMounted(true);
    if (!isOpen) return;

    // Load from localStorage or calculate
    const savedName = localStorage.getItem('manga_user_name') || 'Hoàng Đế Bóng Tối';
    const savedTitle = localStorage.getItem('manga_user_title') || 'Bóng Ma Độc Hành';
    setUserName(savedName);
    setUserTitle(savedTitle);

    const history = JSON.parse(localStorage.getItem('manga_history') || '[]');
    const count = history.length;
    
    // Level & HP/MP formulas based on read count
    const calculatedLevel = Math.max(3, Math.floor(count / 3) + 3);
    const calculatedHp = 5000 + calculatedLevel * 120 + stats.vitality * 45;
    const calculatedMp = 500 + calculatedLevel * 10 + stats.intelligence * 20;

    setLevel(calculatedLevel);
    setHp(calculatedHp);
    setMp(calculatedMp);

    const savedStats = localStorage.getItem('manga_user_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    const savedPoints = localStorage.getItem('manga_user_points');
    if (savedPoints !== null) {
      setRemainingPoints(parseInt(savedPoints, 10));
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleSaveProfile = () => {
    localStorage.setItem('manga_user_name', userName.trim() || 'Hoàng Đế Bóng Tối');
    localStorage.setItem('manga_user_title', userTitle.trim() || 'Bóng Ma Độc Hành');
    setIsEditing(false);
    
    // Sync with Header
    window.dispatchEvent(new Event('manga-profile-updated'));
    onProfileUpdate();
  };

  const increaseStat = (statName: keyof typeof stats) => {
    if (remainingPoints <= 0) return;
    
    const newStats = {
      ...stats,
      [statName]: stats[statName] + 1
    };
    
    const newPoints = remainingPoints - 1;

    setStats(newStats);
    setRemainingPoints(newPoints);

    localStorage.setItem('manga_user_stats', JSON.stringify(newStats));
    localStorage.setItem('manga_user_points', newPoints.toString());

    // Update HP/MP accordingly
    if (statName === 'vitality') {
      setHp(prev => prev + 45);
    } else if (statName === 'intelligence') {
      setMp(prev => prev + 20);
    }
  };

  const resetStats = () => {
    const defaultStats = {
      strength: 132,
      vitality: 91,
      agility: 111,
      intelligence: 70,
      sense: 93,
    };
    const defaultPoints = 10;
    
    setStats(defaultStats);
    setRemainingPoints(defaultPoints);
    
    localStorage.setItem('manga_user_stats', JSON.stringify(defaultStats));
    localStorage.setItem('manga_user_points', defaultPoints.toString());

    const calculatedHp = 5000 + level * 120 + defaultStats.vitality * 45;
    const calculatedMp = 500 + level * 10 + defaultStats.intelligence * 20;
    setHp(calculatedHp);
    setMp(calculatedMp);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Outer Status Screen Board */}
      <div className="relative w-full max-w-md bg-[#020d18] border-2 border-cyan-500/80 rounded-lg overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.4)] flex flex-col animate-in zoom-in-95 duration-250 max-h-[90vh]">
        
        {/* Cyber Grid scanline */}
        <div className="absolute inset-0 pointer-events-none bg-hud-scanlines opacity-10 z-20"></div>

        {/* Closing trigger */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-cyan-900/40 border border-cyan-500/30 rounded-md text-cyan-400 hover:text-white transition z-30 flex items-center justify-center cursor-pointer"
          title="Đóng Bảng Trạng Thái"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* 1. MONARCH EYES BANNER GRAPHIC */}
        <div className="relative w-full h-[150px] border-b-2 border-cyan-500/50 flex items-center justify-center overflow-hidden">
          <img 
            src="/monarch-eyes.png" 
            alt="Monarch Eyes Banner"
            className="w-full h-full object-cover brightness-95 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020d18] via-transparent to-[#020d18]/40"></div>
          
          {/* Neon Title tag */}
          <div className="absolute bottom-2 px-6 py-1 bg-black/60 border border-cyan-500/50 rounded-sm">
            <h1 className="text-cyan-300 font-black text-lg tracking-[0.2em] font-mono uppercase drop-shadow-[0_0_8px_#22d3ee]">
              STATUS
            </h1>
          </div>
        </div>

        {/* 2. CORE SYSTEM CONTENT GRID */}
        <div className="flex-grow p-5 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4 text-left font-mono select-none">
          
          {/* Identity Block */}
          <div className="border-b border-cyan-500/20 pb-3 relative">
            
            {isEditing ? (
              <div className="flex flex-col gap-2.5 bg-cyan-950/20 border border-cyan-500/30 p-3 rounded-md">
                <div>
                  <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1">Tên Thợ Săn (Name)</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-black/60 border border-cyan-500/40 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Nhập tên..."
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1">Danh Hiệu (Title)</label>
                  <input
                    type="text"
                    value={userTitle}
                    onChange={(e) => setUserTitle(e.target.value)}
                    className="w-full bg-black/60 border border-cyan-500/40 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Nhập danh hiệu..."
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="mt-1 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[10px] uppercase py-1.5 rounded flex items-center justify-center gap-1 transition"
                >
                  <Check className="h-3.5 w-3.5" /> Lưu Thay Đổi
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 pr-8 relative group">
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 hover:bg-cyan-900/30 rounded border border-transparent hover:border-cyan-500/30 text-cyan-400 opacity-60 group-hover:opacity-100 transition cursor-pointer"
                  title="Thay đổi Tên/Danh hiệu"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tên (NAME)</span>
                  <span className="text-sm font-black text-white">{userName}</span>
                </div>
                
                <div className="flex flex-col mt-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Nghề Nghiệp (JOB)</span>
                  <span className="text-xs font-black text-cyan-400 uppercase">Hoàng Đế Bóng Tối (Monarch)</span>
                </div>

                <div className="flex flex-col mt-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Danh Hiệu (TITLE)</span>
                  <span className="text-xs font-black text-purple-400 uppercase">{userTitle}</span>
                </div>
              </div>
            )}
            
          </div>

          {/* Level & Fatigue Stats Row */}
          <div className="grid grid-cols-2 gap-4 border-b border-cyan-500/20 pb-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Cấp Độ (LEVEL)</span>
              <span className="text-lg font-black text-cyan-400">{level}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Mệt Mỏi (FATIGUE)</span>
              <span className="text-lg font-black text-red-500">{fatigue}</span>
            </div>
          </div>

          {/* HP / MP Bar Display */}
          <div className="flex flex-col gap-3 border-b border-cyan-500/20 pb-4">
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-gray-400">SINH LỰC (HP)</span>
                <span className="text-white">{hp} / {hp}</span>
              </div>
              <div className="w-full h-2 bg-black/60 border border-cyan-500/30 rounded-sm overflow-hidden">
                <div className="h-full bg-cyan-500 shadow-[0_0_8px_#06b6d4] rounded-sm" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-gray-400">MA PHÁP (MP)</span>
                <span className="text-white">{mp} / {mp}</span>
              </div>
              <div className="w-full h-2 bg-black/60 border border-purple-500/30 rounded-sm overflow-hidden">
                <div className="h-full bg-purple-500 shadow-[0_0_8px_#a855f7] rounded-sm" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          {/* Main Attributes Panel */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Thuộc Tính Thể Chất (STATS)</span>
              {remainingPoints > 0 && (
                <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(6,182,212,0.3)] animate-pulse font-black uppercase">
                  Điểm Thặng Dư: {remainingPoints}
                </span>
              )}
            </div>

            {/* Stats Attributes list */}
            <div className="flex flex-col gap-2">
              {[
                { key: 'strength', name: 'Sức Mạnh (Strength)', value: stats.strength },
                { key: 'vitality', name: 'Sinh Lực (Vitality)', value: stats.vitality },
                { key: 'agility', name: 'Nhanh Nhẹn (Agility)', value: stats.agility },
                { key: 'intelligence', name: 'Trí Tuệ (Intelligence)', value: stats.intelligence },
                { key: 'sense', name: 'Giác Quan (Sense)', value: stats.sense },
              ].map((stat) => (
                <div key={stat.key} className="flex justify-between items-center text-xs bg-cyan-950/10 hover:bg-cyan-950/20 border border-cyan-500/10 px-3 py-1.5 rounded transition">
                  <span className="text-gray-400 font-semibold">{stat.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-black">{stat.value}</span>
                    {remainingPoints > 0 && (
                      <button
                        onClick={() => increaseStat(stat.key as keyof typeof stats)}
                        className="h-5 w-5 bg-cyan-500 hover:bg-cyan-400 text-white rounded flex items-center justify-center shadow-md active:scale-90 transition cursor-pointer"
                        title="Tăng thuộc tính"
                      >
                        <Plus className="h-3.5 w-3.5 font-black" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Defense & Skills Footer list */}
          <div className="flex flex-col gap-2 pt-3 border-t border-cyan-500/20 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Hấp thụ sát thương vật lý:</span>
              <span className="text-white font-bold">46%</span>
            </div>
            
            {/* Passive / Active Skills display */}
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">[KỸ NĂNG ĐANG TRANG BỊ]</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {['Trích Xuất Bóng Tối (S-Rank)', 'Bảo Vệ Quân Thù (A-Rank)', 'Cổng Không Gian (B-Rank)', 'Dịch Chuyển Tức Thời'].map((skill, idx) => (
                  <span key={idx} className="bg-cyan-950/40 border border-cyan-500/30 text-[9px] font-black text-cyan-300 px-2 py-0.5 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reset Stats trigger if they want to distribute points again */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={resetStats}
              className="flex-1 py-1.5 border border-cyan-500/30 hover:border-cyan-500/60 bg-transparent text-gray-400 hover:text-white rounded text-[10px] font-bold uppercase transition"
            >
              Reset Điểm Số
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 rounded text-[10px] font-black uppercase transition"
            >
              Hoàn Thành
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
