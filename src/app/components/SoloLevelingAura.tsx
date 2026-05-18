'use client';

export default function SoloLevelingAura() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Top Left Indigo Glow */}
      <div 
        className="absolute top-[-25%] left-[-15%] w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-75"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
        }}
      ></div>
      
      {/* Bottom Right Champagne Gold Glow */}
      <div 
        className="absolute bottom-[-20%] right-[-15%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-70"
        style={{
          background: 'radial-gradient(circle, rgba(197, 168, 128, 0.035) 0%, transparent 70%)',
        }}
      ></div>
      
      {/* Subtle top central violet aura node */}
      <div 
        className="absolute top-[-10%] left-[30%] w-[40vw] h-[30vw] rounded-full blur-[100px] opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.02) 0%, transparent 70%)',
        }}
      ></div>
    </div>
  );
}
