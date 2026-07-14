'use client';

import React from 'react';

export default function HyperGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20 bg-[#010103]">
      {/* 3D Perspective Glowing Grid Floor */}
      <div 
        className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] will-change-transform"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 0px 0px, rgba(34, 211, 238, 0.95) 100%, transparent 0%),
            radial-gradient(8px 8px at 0px 0px, rgba(34, 211, 238, 0.28) 100%, transparent 0%),
            linear-gradient(to right, rgba(34, 211, 238, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(167, 139, 250, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(450px) rotateX(60deg) translate3d(0, 0, 0)',
          animation: 'hyper-grid-drift 22s linear infinite',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)',
        }}
      />

      {/* Cyberpunk Purple Radial Backdrop Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(124,58,237,0.1),transparent_60%)]" />

      {/* Embedded CSS for GPU accelerated Drift Animation */}
      <style jsx global>{`
        @keyframes hyper-grid-drift {
          from {
            transform: perspective(450px) rotateX(60deg) translate3d(0, 0, 0);
          }
          to {
            transform: perspective(450px) rotateX(60deg) translate3d(0, 60px, 0);
          }
        }
      `}</style>
    </div>
  );
}
