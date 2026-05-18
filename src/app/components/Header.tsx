'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Compass } from 'lucide-react';
import Link from 'next/link';
import { MANGA_SOURCES } from '../config';

export default function Header() {
  const router = useRouter();
  const [source, setSource] = useState<string>('global');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Doc nguon mac dinh tu localStorage
    let savedSource = localStorage.getItem('manga_source') || 'global';
    setSource(savedSource);

    // Bat su kien dong bo neu nguon thay doi tu trang khac
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
    // Ban event toan cuc bao hieu nguon thay doi de danh sach truyen tu dong tai lai
    window.dispatchEvent(new Event('manga-source-changed'));
    
    // Neu dang khong o trang chu, lap tuc quay ve trang chu de kham pha nguon moi
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
              <span className="text-2xl font-black tracking-tighter text-[#39C5BB] drop-shadow-[0_0_12px_#39C5BB]">
                MANGA<span className="text-white font-light">-BLACK</span>
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
                className="w-full px-4 py-2 pl-10 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all text-sm"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button type="submit" className="hidden">Tìm</button>
          </form>

          {/* Dynamic Source Switcher & Nav Links */}
          <div className="flex items-center gap-4">
            
            {/* Nav links */}
            <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold">
              <Link href="/" className="px-3 py-1.5 rounded-md hover:bg-white/5 text-gray-300 hover:text-white transition flex items-center gap-1.5">
                <Compass className="h-4 w-4" /> Khám Phá
              </Link>
            </nav>

            {/* Source Switcher */}
            <div className="flex items-center bg-black/30 border border-white/5 rounded-full p-0.5">
              {MANGA_SOURCES.map((src) => (
                <button
                  key={src.id}
                  onClick={() => handleSourceChange(src.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                    source === src.id
                      ? 'bg-purple-600/80 text-white shadow-lg border border-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
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
