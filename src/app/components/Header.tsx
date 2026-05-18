'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Compass, Clock } from 'lucide-react';
import Link from 'next/link';
import { MANGA_SOURCES } from '../config';

export default function Header() {
  const router = useRouter();
  const [source, setSource] = useState<string>('global');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    let savedSource = localStorage.getItem('manga_source') || 'global';
    setSource(savedSource);

    const handleSourceSync = () => {
      let activeSource = localStorage.getItem('manga_source') || 'global';
      setSource(activeSource);
    };

    window.addEventListener('manga-source-changed', handleSourceSync);
    return () => {
      window.removeEventListener('manga-source-changed', handleSourceSync);
    };
  }, []);

  const handleSourceChange = (newSource: string) => {
    localStorage.setItem('manga_source', newSource);
    setSource(newSource);
    window.dispatchEvent(new Event('manga-source-changed'));
    
    if (window.location.pathname !== '/') {
      router.push('/');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="glass-nav sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wider text-white font-display">
                MANGA<span className="text-[#c5a880] font-light">-BLACK</span>
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <div className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={source === 'vn' ? 'Tìm kiếm truyện Việt hóa...' : 'Search global manga...'}
                className="w-full px-4 py-2 pl-10 rounded-full bg-white/[0.03] border border-white/[0.06] text-white placeholder-slate-400 focus:outline-none focus:border-[#c5a880]/50 focus:bg-white/[0.05] transition-all text-xs"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            <button type="submit" className="hidden">Tìm</button>
          </form>

          {/* Dynamic Source Switcher & Nav Links */}
          <div className="flex items-center gap-4">
            
            {/* Nav links */}
            <nav className="flex items-center gap-1.5 text-xs font-bold">
              <Link href="/" className="hidden lg:flex px-3 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition items-center gap-1.5">
                <Compass className="h-4 w-4 text-slate-400" /> Khám Phá
              </Link>
              <button 
                onClick={() => window.dispatchEvent(new Event('manga-open-history'))}
                className="px-3 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-white/[0.05] hover:border-[#c5a880]/30 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Lịch sử đọc truyện"
              >
                <Clock className="h-4 w-4 text-[#c5a880]" /> <span>Lịch Sử</span>
              </button>
            </nav>

            {/* Source Switcher */}
            <div className="flex items-center bg-slate-950/40 border border-white/[0.05] rounded-full p-0.5">
              {MANGA_SOURCES.map((src) => (
                <button
                  key={src.id}
                  onClick={() => handleSourceChange(src.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                    source === src.id
                      ? 'bg-[#c5a880] text-[#07090e] shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{src.flag}</span>
                  <span className="hidden sm:inline">{src.name}</span>
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
