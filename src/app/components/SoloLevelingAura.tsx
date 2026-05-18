'use client';

import { useEffect, useState } from 'react';

export default function SoloLevelingAura() {
  const [particles, setParticles] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
      const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      side: i % 2 === 0 ? 'left' : 'right',
      width: Math.random() * 4 + 2,
      height: Math.random() * 20 + 8,
      left: Math.random() * 12,
      delay: Math.random() * 5,
      duration: Math.random() * 6 + 4,
      opacity: Math.random() * 0.6 + 0.2,
      scale: Math.random() * 1.5 + 0.5,
    }));
    setParticles(newParticles);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-90">
      
      {/* System Aura (Cyan) - GPU Optimized */}
      <div className="absolute top-0 bottom-0 left-0 w-[20vw] max-w-[250px] bg-gradient-to-r from-[#083344]/80 via-[#0ea5e9]/10 to-transparent blur-2xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute top-0 bottom-0 right-0 w-[20vw] max-w-[250px] bg-gradient-to-l from-[#083344]/80 via-[#0ea5e9]/10 to-transparent blur-2xl animate-pulse" style={{ animationDuration: '5s' }}></div>

      {/* System Edges (Dark Blue) */}
      <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-[#020617]/90 to-transparent blur-xl mix-blend-multiply"></div>
      <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-[#020617]/90 to-transparent blur-xl mix-blend-multiply"></div>

      {/* System Particles (Cyan) */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-t from-[#0284c7] to-[#22d3ee]"
          style={{
            [p.side]: `${p.left}%`,
            width: `${p.width}px`,
            height: `${p.height}px`,
            bottom: '-10%',
            boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)',
            animation: `systemFloat ${p.duration}s cubic-bezier(0.25, 0.1, 0.25, 1) ${p.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        ></div>
      ))}

      <style>{`
        @keyframes systemFloat {
          0% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          80% {
            opacity: 0.3;
          }
          100% {
            transform: translate3d(0, -120vh, 0) scale(0.2) rotate(45deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
