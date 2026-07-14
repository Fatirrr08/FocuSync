"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "violet" | "emerald" | "none";
}

export default function Card({
  children,
  className = "",
  hover = true,
  glow = "none",
}: CardProps) {
  const glowStyles: Record<string, string> = {
    violet:
      "hover:shadow-[0_0_60px_rgba(124,58,237,0.25)] hover:border-violet/30",
    emerald:
      "hover:shadow-[0_0_60px_rgba(16,185,129,0.25)] hover:border-emerald/30",
    none: "",
  };

  return (
    <div
      className={`
        bg-glass border border-glass-border rounded-xl p-6 shadow-glass backdrop-blur-md
        transition-all duration-300
        ${hover ? "hover:border-glass-border-h hover:-translate-y-0.5" : ""}
        ${glow !== "none" ? glowStyles[glow] : ""}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}
