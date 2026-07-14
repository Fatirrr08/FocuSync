'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface FluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface FuturisticCtaProps {
  onActionCompleted?: (payload: {
    action: string;
    timestamp: string;
    source: string;
    buttonId: string;
  }) => void;
}

export default function FuturisticCta({ onActionCompleted }: FuturisticCtaProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const particlesRef = useRef<FluidParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
        canvas.width = width;
        canvas.height = height;
      }
    });
    resizeObserver.observe(canvas);

    // Initialize fluid particles
    const initParticles = () => {
      particlesRef.current = [];
      const count = 16;
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 8 + 8,
          alpha: Math.random() * 0.25 + 0.1,
          color: Math.random() > 0.5 ? 'rgba(34, 211, 238, ' : 'rgba(168, 85, 247, ',
        });
      }
    };

    initParticles();

    let time = 0;

    const renderFluid = () => {
      time += isHovered ? 0.08 : 0.02;
      ctx.clearRect(0, 0, width, height);

      // Swirling fluid blobs
      const speedFactor = isHovered ? 3.0 : 1.0;
      
      const cx1 = width * 0.35 + Math.sin(time * 1.5) * (width * 0.15);
      const cy1 = height / 2 + Math.cos(time * 1.1) * (height * 0.25);
      const cx2 = width * 0.65 + Math.cos(time * 1.7) * (width * 0.15);
      const cy2 = height / 2 + Math.sin(time * 1.3) * (height * 0.25);

      const grad1 = ctx.createRadialGradient(cx1, cy1, 1, cx1, cy1, width * 0.6);
      grad1.addColorStop(0, 'rgba(34, 211, 238, 0.40)');
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');

      const grad2 = ctx.createRadialGradient(cx2, cy2, 1, cx2, cy2, width * 0.65);
      grad2.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Animate fluid particles and shooting droplets
      const particles = particlesRef.current;

      particles.forEach((p, idx) => {
        if (isClicked) {
          const targetX = width / 2;
          const targetY = height / 2;
          p.x += (targetX - p.x) * 0.2;
          p.y += (targetY - p.y) * 0.2;
          p.size = Math.max(0.5, p.size * 0.9);
          p.alpha = Math.max(0, p.alpha - 0.03);
        } else if (isHovered) {
          const dx = p.x - width / 2;
          const dy = p.y - height / 2;
          const angle = Math.atan2(dy, dx) + 0.04;
          const radius = Math.sqrt(dx * dx + dy * dy);
          
          p.x = width / 2 + Math.cos(angle) * radius;
          p.y = height / 2 + Math.sin(angle) * radius;

          // Emit particles from arrow
          if (idx === 0 && Math.random() < 0.35) {
            particles.push({
              x: width - 24,
              y: height / 2 + (Math.random() - 0.5) * 12,
              vx: -Math.random() * 4 - 3,
              vy: (Math.random() - 0.5) * 1.5,
              size: Math.random() * 2.2 + 1.2,
              alpha: 0.9,
              color: 'rgba(34, 211, 238, ',
            });
          }
        } else {
          p.x += p.vx * speedFactor;
          p.y += p.vy * speedFactor;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();
      });

      if (particles.length > 40) {
        particlesRef.current = particles.filter(p => p.alpha > 0.05 && p.x > -10);
      }

      animationFrameRef.current = requestAnimationFrame(renderFluid);
    };

    renderFluid();

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered, isClicked]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setCoords({ x, y });

    const hoverX = rect.left + rect.width / 2;
    const hoverY = rect.top + rect.height / 2;
    window.dispatchEvent(
      new CustomEvent('chronos-button-hover', {
        detail: { active: true, x: hoverX, y: hoverY },
      })
    );
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });

    window.dispatchEvent(
      new CustomEvent('chronos-button-hover', {
        detail: { active: false, x: 0, y: 0 },
      })
    );
  };

  const handleClick = () => {
    if (isClicked) return;
    setIsClicked(true);

    // Prepare JSON payload for Backend/API integration
    const payload = {
      action: 'cta_click_mulai_gratis',
      timestamp: new Date().toISOString(),
      source: 'hero_landing_page',
      buttonId: 'mulai_gratis_energy_core_glass'
    };

    // Callback execution
    onActionCompleted?.(payload);

    const btn = buttonRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const clickX = rect.left + rect.width / 2;
      const clickY = rect.top + rect.height / 2;

      window.dispatchEvent(
        new CustomEvent('chronos-shockwave', {
          detail: { x: clickX, y: clickY },
        })
      );
    }

    setTimeout(() => {
      router.push('/register');
    }, 600);
  };

  // 3D perspective calculation
  const tiltX = coords.y * -9;
  const tiltY = coords.x * 9;
  const transform = isHovered
    ? `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.06) translate3d(0, -3px, 20px)`
    : `perspective(600px) rotateX(0deg) rotateY(0deg) scale(1) translate3d(0, 0, 0)`;

  // Custom organic cubic-bezier transitions for premium feel
  const transition = isHovered
    ? 'transform 0.15s ease-out'
    : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

  return (
    <div className="relative group interactive z-30">
      {/* 3D shifting cyan & purple shadow */}
      <div 
        className={`absolute inset-0 rounded-xl blur-xl transition-all ease-organic duration-500 pointer-events-none ${
          isHovered 
            ? 'translate-y-3 translate-x-2 opacity-95 scale-105 bg-gradient-to-r from-cyan-400/40 to-violet/40 shadow-[0_4px_30px_rgba(34,211,238,0.3),_0_4px_30px_rgba(124,58,237,0.3)]' 
            : 'translate-y-0.5 translate-x-0 opacity-30 scale-100 bg-violet-glow'
        }`}
      />

      <button
        ref={buttonRef}
        type="button"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          transform,
          transition
        }}
        className={`relative inline-flex items-center justify-center font-display font-semibold text-lg px-9 py-4.5 rounded-xl border overflow-hidden backdrop-blur-[12px] shadow-glass active:scale-95 border-white/20 bg-white/[0.04] text-white ${
          isHovered 
            ? 'border-white/40 shadow-[0_12px_32px_rgba(0,0,0,0.6),_0_0_30px_rgba(34,211,238,0.35),_0_0_30px_rgba(124,58,237,0.35),_inset_0_1px_0_rgba(255,255,255,0.3)] text-cyan-200 saturate-[1.4] contrast-[1.15]' 
            : 'text-text-primary'
        }`}
      >
        {/* Swirling Fluid Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* Content Overlay */}
        <span className={`relative z-10 flex items-center gap-2 transition-transform ease-organic duration-500 ${isHovered ? 'scale-105 text-white' : 'scale-100 text-text-primary'}`}>
          <span>Mulai Gratis</span>
          
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-all ease-organic duration-500 relative ${
              isHovered ? 'text-cyan-300 translate-x-1.5' : 'text-violet-light'
            }`}
          >
            <path 
              d="M4 10h12" 
              className={`transition-all ease-organic duration-500 ${
                isHovered ? 'stroke-dasharray-none' : 'stroke-dasharray-3'
              }`}
              style={{
                strokeDasharray: isHovered ? 'none' : '3,3',
              }}
            />
            <path d="M12 6l4 4l-4 4" />
          </svg>
        </span>

        {/* Diagonal glare animation */}
        <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[slide-right_1s_ease-in-out_infinite] pointer-events-none z-20" />
      </button>
    </div>
  );
}
