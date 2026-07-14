"use client";

import React from "react";

type BadgeVariant = "violet" | "emerald" | "crimson" | "amber";

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  violet: "bg-violet-pale text-violet-light border-violet/30",
  emerald: "bg-emerald-pale text-emerald-light border-emerald/30",
  crimson: "bg-crimson-pale text-crimson-light border-crimson/30",
  amber: "bg-amber-pale text-amber border-amber/30",
};

const dotColors: Record<BadgeVariant, string> = {
  violet: "bg-violet",
  emerald: "bg-emerald",
  crimson: "bg-crimson",
  amber: "bg-amber",
};

export default function Badge({
  variant = "violet",
  dot = false,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border rounded-full ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${dotColors[variant]}`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${dotColors[variant]}`}
          />
        </span>
      )}
      {children}
    </span>
  );
}
