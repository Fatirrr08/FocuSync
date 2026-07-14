'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
}

interface MouseParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

export default function ChronosField() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, currentX: 0.5, currentY: 0.5 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const ripplesRef = useRef<Ripple[]>([]);
  const particlesRef = useRef<MouseParticle[]>([]);
  const buttonHoverRef = useRef({ active: false, x: 0, y: 0, opacity: 0 });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (pathname !== '/') return;
    
    const handleShockwave = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number }>;
      const { x, y } = customEvent.detail || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      
      ripplesRef.current.push({
        x,
        y,
        radius: 0,
        maxRadius: Math.max(window.innerWidth, window.innerHeight) * 1.5,
        speed: 22,
      });
    };

    const handleButtonHover = (e: Event) => {
      const customEvent = e as CustomEvent<{ active: boolean; x: number; y: number }>;
      buttonHoverRef.current.active = customEvent.detail.active;
      buttonHoverRef.current.x = customEvent.detail.x;
      buttonHoverRef.current.y = customEvent.detail.y;
    };

    window.addEventListener('chronos-shockwave', handleShockwave);
    window.addEventListener('chronos-button-hover', handleButtonHover);
    
    return () => {
      window.removeEventListener('chronos-shockwave', handleShockwave);
      window.removeEventListener('chronos-button-hover', handleButtonHover);
    };
  }, [pathname]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const handleResize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;

      // Add a cyan particle to the cursor tail
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 4) {
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          alpha: 0.85,
          size: Math.random() * 1.2 + 0.8,
        });
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    const focalLength = 360;
    const cameraDistance = 450;

    // Grid details
    const cols = 16;
    const rows = 12;
    const spacingX = 1400;
    const spacingY = 1000;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      mouse.currentX += (mouse.x - mouse.currentX) * 0.05;
      mouse.currentY += (mouse.y - mouse.currentY) * 0.05;

      // Adjust camera rotation depending on mouse
      const angleX = 1.0 + (mouse.currentY - 0.5) * 0.08;
      const angleY = (mouse.currentX - 0.5) * 0.16;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // 1. Calculate and Render Subtle 3D Grid (2 stroke calls)
      const points: { px: number; py: number }[][] = [];
      for (let r = 0; r < rows; r++) {
        points[r] = [];
        for (let c = 0; c < cols; c++) {
          const nx = (c / (cols - 1)) - 0.5;
          const ny = (r / (rows - 1)) - 0.5;

          const x3d = nx * spacingX;
          // Grid waves very slowly to simulate drift
          const y3d = ny * spacingY + Math.sin(time * 0.15 + nx * 2.5) * 15;
          const z3d = Math.cos(time * 0.1 + ny * 2) * 12;

          // Rotate
          const rx = x3d * cosY - z3d * sinY;
          const rz = x3d * sinY + z3d * cosY;
          const ry = y3d * cosX - rz * sinX;
          const rz2 = y3d * sinX + rz * cosX;

          const finalZ = rz2 + cameraDistance;
          const scale = focalLength / Math.max(10, finalZ);
          
          const px = width / 2 + rx * scale;
          const py = height / 2 + ry * scale + 120;
          points[r].push({ px, py });
        }
      }

      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.045)'; // Ultra-faint ultraviolet grid lines

      // Stroke horizontal paths
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        ctx.moveTo(points[r][0].px, points[r][0].py);
        for (let c = 1; c < cols; c++) {
          ctx.lineTo(points[r][c].px, points[r][c].py);
        }
      }
      ctx.stroke();

      // Stroke vertical paths
      ctx.beginPath();
      for (let c = 0; c < cols; c++) {
        ctx.moveTo(points[0][c].px, points[0][c].py);
        for (let r = 1; r < rows; r++) {
          ctx.lineTo(points[r][c].px, points[r][c].py);
        }
      }
      ctx.stroke();

      // 2. Render Spectral Rainbow Refraction around the CTA Button
      const hover = buttonHoverRef.current;
      hover.opacity += ((hover.active ? 1 : 0) - hover.opacity) * 0.08;

      if (hover.opacity > 0.01) {
        const rx = hover.x;
        const ry = hover.y;
        
        ctx.lineWidth = 2.0;
        const numArcs = 5;
        
        for (let i = 0; i < numArcs; i++) {
          const radius = 105 + i * 22;
          const speed = 0.3 * (1 + i * 0.15);
          const angleStart = time * speed + (i * Math.PI) / 2.5;
          const angleEnd = angleStart + Math.PI / 2.2;
          
          const xStart = rx + Math.cos(angleStart) * radius;
          const yStart = ry + Math.sin(angleStart) * radius;
          const xEnd = rx + Math.cos(angleEnd) * radius;
          const yEnd = ry + Math.sin(angleEnd) * radius;

          const grad = ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
          grad.addColorStop(0, 'rgba(34, 211, 238, 0)');
          grad.addColorStop(0.2, `rgba(34, 211, 238, ${0.16 * hover.opacity})`);
          grad.addColorStop(0.4, `rgba(52, 211, 153, ${0.12 * hover.opacity})`);
          grad.addColorStop(0.65, `rgba(168, 85, 247, ${0.16 * hover.opacity})`);
          grad.addColorStop(0.85, `rgba(236, 72, 153, ${0.14 * hover.opacity})`);
          grad.addColorStop(1, 'rgba(236, 72, 153, 0)');

          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.arc(rx, ry, radius, angleStart, angleEnd);
          ctx.stroke();
        }
      }

      // 3. Render Cyan Microscopic Particle Tail
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.06;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(34, 211, 238, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Render Data-Birefringent Shockwave Rings
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].radius += ripples[i].speed;
        if (ripples[i].radius > ripples[i].maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        const rip = ripples[i];
        const alpha = (1 - rip.radius / rip.maxRadius) * 0.28;
        if (alpha <= 0) continue;

        ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, Math.max(0, rip.radius - 15), 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [pathname]);

  if (pathname !== '/') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}
