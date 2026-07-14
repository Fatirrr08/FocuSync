'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function CustomCursor() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const coordsTextRef = useRef<HTMLSpanElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const ringRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (pathname !== '/') return;
    
    // Hide default cursor globally on landing page
    document.body.style.cursor = 'none';
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button') || 
        target.closest('.interactive') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.getAttribute('role') === 'button';
      
      if (isInteractive) {
        setIsHovered(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement;
      if (!related || (!related.closest('a') && !related.closest('button') && !related.closest('.interactive') && !related.closest('input') && !related.closest('textarea') && related.getAttribute('role') !== 'button')) {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    let animId: number;
    const updatePosition = () => {
      const dot = cursorDotRef.current;
      const ring = cursorRingRef.current;
      
      if (dot && ring) {
        // Fast hardware-accelerated translation
        dot.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0)`;
        
        ringRef.current.x += (mouseRef.current.x - ringRef.current.x) * 0.16;
        ringRef.current.y += (mouseRef.current.y - ringRef.current.y) * 0.16;
        
        ring.style.transform = `translate3d(${ringRef.current.x}px, ${ringRef.current.y}px, 0)`;

        const coordsText = coordsTextRef.current;
        if (coordsText) {
          coordsText.textContent = `POS: ${mouseRef.current.x},${mouseRef.current.y}`;
        }
      }
      
      animId = requestAnimationFrame(updatePosition);
    };
    
    animId = requestAnimationFrame(updatePosition);

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animId);
    };
  }, [isVisible, pathname]);

  if (pathname !== '/' || !isVisible) return null;

  return (
    <>
      {/* Central target dot (Hardware positioned, no transitions) */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-cyan-400 rounded-full pointer-events-none z-[9999] -ml-[3px] -mt-[3px] mix-blend-screen"
        style={{ willChange: 'transform' }}
      />

      {/* Outer lens scope wrapper (Hardware positioned, no transitions to prevent 120Hz/144Hz stuttering) */}
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-screen"
        style={{ willChange: 'transform' }}
      >
        {/* Inner visual ring (size shifts, color, and shadow animations via transition) */}
        <div
          className={`rounded-full transition-all duration-300 flex items-center justify-center relative ${
            isHovered 
              ? 'w-12 h-12 -ml-6 -mt-6 border border-violet/60 bg-violet/5 shadow-[0_0_15px_rgba(124,58,237,0.3)]' 
              : 'w-8 h-8 -ml-4 -mt-4 border border-cyan-400/40 shadow-[0_0_8px_rgba(34,211,238,0.15)]'
          }`}
        >
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-scale-in">
              {/* Horizontal crosshair lines */}
              <div className="absolute left-0 right-0 h-[0.5px] bg-violet-light/45" />
              {/* Vertical crosshair lines */}
              <div className="absolute top-0 bottom-0 w-[0.5px] bg-violet-light/45" />
              
              {/* Lens ticks */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-violet-light/60" />
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-violet-light/60" />
              <div className="absolute left-1 top-1/2 -translate-y-1/2 h-0.5 w-1 bg-violet-light/60" />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 h-0.5 w-1 bg-violet-light/60" />

              {/* Coordinate label */}
              <span ref={coordsTextRef} className="absolute left-14 top-2 text-[8px] font-mono text-cyan-400/80 whitespace-nowrap bg-deeper/80 px-1 py-0.5 border border-glass-border rounded">
                POS: 0,0
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
