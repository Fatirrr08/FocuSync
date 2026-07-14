"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = "" }: PageTransitionProps) {
  const [animating, setAnimating] = useState(false);
  const [content, setContent] = useState(children);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(children);
  }, [children]);

  const triggerTransition = useCallback((href: string) => {
    setAnimating(true);
    setTimeout(() => {
      window.location.href = href;
    }, 400);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:")) return;
      const isExternal = target.getAttribute("target") === "_blank";
      if (isExternal) return;
      e.preventDefault();
      triggerTransition(href);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [triggerTransition]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`transition-all duration-500 ${
          animating ? "opacity-0 translate-y-4 scale-[0.98]" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {content}
      </div>

      <div
        className={`fixed inset-0 z-[200] pointer-events-none bg-deeper transition-all duration-500 ${
          animating ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
