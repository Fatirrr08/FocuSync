"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "emerald" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  href?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-violet to-violet/50 text-white shadow-glow-v hover:shadow-[0_0_60px_rgba(124,58,237,0.5)]",
  emerald:
    "bg-gradient-to-r from-emerald to-emerald/50 text-white shadow-glow-e hover:shadow-[0_0_60px_rgba(16,185,129,0.5)]",
  ghost:
    "bg-glass border border-glass-border backdrop-blur-md text-text-primary hover:bg-glass-hover hover:border-glass-border-h",
  danger:
    "bg-gradient-to-r from-crimson to-crimson/50 text-white hover:shadow-[0_0_60px_rgba(239,68,68,0.5)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-lg gap-1.5",
  md: "px-6 py-3 text-base rounded-xl gap-2",
  lg: "px-8 py-4 text-lg rounded-xl gap-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  href,
  children,
  disabled = false,
  onClick,
  type = "button",
}: ButtonProps) {
  const btnRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleRipple = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  };

  const baseStyles =
    "relative inline-flex items-center justify-center font-display font-semibold overflow-hidden transition-all duration-300 active:scale-95 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-violet/50 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none";

  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={classes}
        ref={btnRef as React.Ref<HTMLAnchorElement>}
        onClick={handleRipple}
      >
        {children}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="absolute rounded-full bg-white/20 pointer-events-none animate-ripple"
            style={{ left: r.x, top: r.y, width: 20, height: 20, marginLeft: -10, marginTop: -10 }}
          />
        ))}
      </Link>
    );
  }

  return (
    <button
      ref={btnRef as React.Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      className={classes}
      onClick={(e) => {
        handleRipple(e);
        onClick?.(e);
      }}
    >
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/20 pointer-events-none animate-ripple"
          style={{ left: r.x, top: r.y, width: 20, height: 20, marginLeft: -10, marginTop: -10 }}
        />
      ))}
    </button>
  );
}
