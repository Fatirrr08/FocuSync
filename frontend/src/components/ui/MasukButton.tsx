'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MasukButton() {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    // Calculate normalized position relative to button center (-1 to 1)
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Generate 3D transform strings based on mouse tilt coordinates
  const tiltX = coords.y * -8; // Tilt up/down
  const tiltY = coords.x * 8;  // Tilt left/right
  const transform = isHovered
    ? `perspective(400px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05) translate3d(0, -2px, 15px)`
    : `perspective(400px) rotateX(0deg) rotateY(0deg) scale(1) translate3d(0, 0, 0)`;

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => router.push('/login')}
      style={{ 
        transform,
        transition: isHovered ? 'none' : 'transform 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease'
      }}
      className={`relative inline-flex items-center justify-center font-display font-semibold text-lg px-8 py-4 rounded-xl border pointer-events-auto backdrop-blur-[24px] shadow-glass hover:shadow-[0_8px_32px_rgba(20,184,166,0.15)] transition-all duration-300 z-10 interactive ${
        isHovered
          ? 'bg-white/[0.06] border-cyan-400/40 text-cyan-400'
          : 'bg-white/[0.02] border-white/10 text-text-secondary'
      }`}
    >
      {/* Internal shine overlay representing refraction */}
      <div 
        className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08] pointer-events-none"
        style={{
          transform: isHovered ? `translate3d(${coords.x * -10}px, ${coords.y * -10}px, 0)` : 'none',
          transition: isHovered ? 'none' : 'transform 0.5s ease'
        }}
      />

      {/* Glow shadow inside */}
      {isHovered && (
        <div className="absolute inset-0 rounded-xl bg-cyan-400/5 blur-md pointer-events-none" />
      )}

      <span className="relative z-10">Masuk</span>
    </button>
  );
}
