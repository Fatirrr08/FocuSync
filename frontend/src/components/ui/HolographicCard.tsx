"use client";

import React, { useState, useRef, useCallback } from "react";

interface HolographicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function HolographicCard({
  children,
  className = "",
  ...props
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    "--rx": "0deg",
    "--ry": "0deg",
    "--mx": "50%",
    "--my": "50%",
    "--opacity": "0",
  } as React.CSSProperties);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to card
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Convert to percentages (0 to 100)
    const pctX = (px / width) * 100;
    const pctY = (py / height) * 100;

    // Calculate rotation: center (50, 50) is 0deg rotation
    // Max rotation is 12 degrees
    const maxRotation = 12;
    const rx = ((pctY - 50) / 50) * -maxRotation; // tilt backward/forward
    const ry = ((pctX - 50) / 50) * maxRotation;  // tilt left/right

    setStyle({
      "--rx": `${rx.toFixed(2)}deg`,
      "--ry": `${ry.toFixed(2)}deg`,
      "--mx": `${pctX.toFixed(2)}%`,
      "--my": `${pctY.toFixed(2)}%`,
      "--opacity": "1",
      transform: `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`,
    } as React.CSSProperties);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Smoothly reset tilt and spotlight
    setStyle({
      "--rx": "0deg",
      "--ry": "0deg",
      "--mx": "50%",
      "--my": "50%",
      "--opacity": "0",
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
      transition: "all 0.5s ease-out",
    } as React.CSSProperties);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`relative rounded-xl overflow-hidden transition-shadow duration-300 ${className}`}
      {...props}
    >
      {/* Dynamic spotlight/holographic shine effect */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 mix-blend-overlay"
        style={{
          opacity: "var(--opacity, 0)",
          background: `radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.12) 0%, transparent 60%)`,
        }}
      />
      
      {/* Corner laser reflection borders */}
      <div
        className="absolute inset-0 pointer-events-none z-15 transition-opacity duration-300"
        style={{
          opacity: "var(--opacity, 0)",
          background: `radial-gradient(circle 120px at var(--mx, 50%) var(--my, 50%), rgba(124,58,237,0.15) 0%, transparent 100%)`,
          border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: "inherit",
        }}
      />

      {/* Render children inside wrapper */}
      <div className="relative z-20 h-full w-full">{children}</div>
    </div>
  );
}
