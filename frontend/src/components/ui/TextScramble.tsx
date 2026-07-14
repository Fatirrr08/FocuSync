'use client';

import { useEffect, useState, useRef } from 'react';

interface TextScrambleProps {
  text: string;
  className?: string;
  delay?: number;
  triggerOnce?: boolean;
}

export default function TextScramble({
  text,
  className = '',
  delay = 0,
  triggerOnce = true,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState('');
  const chars = '01#@$%&*()_+=[{}]<>;:?1010';
  const elementRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number | null>(null);
  const isRevealedRef = useRef(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const startScramble = () => {
      let frame = 0;
      const targetText = text;
      const length = targetText.length;

      const scrambleReveal = () => {
        let current = '';
        let done = true;

        for (let i = 0; i < length; i++) {
          if (targetText[i] === ' ') {
            current += ' ';
            continue;
          }

          // Delay the start of each character's reveal to create a sweeping effect
          const charFrameStart = i * 2.5; 
          const charFrameEnd = charFrameStart + 12;

          if (frame >= charFrameEnd) {
            current += targetText[i];
          } else if (frame >= charFrameStart) {
            current += chars[Math.floor(Math.random() * chars.length)];
            done = false;
          } else {
            current += ' ';
            done = false;
          }
        }

        setDisplayText(current);

        if (!done) {
          frame++;
          animationRef.current = requestAnimationFrame(scrambleReveal);
        }
      };

      animationRef.current = requestAnimationFrame(scrambleReveal);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!isRevealedRef.current) {
            isRevealedRef.current = true;
            setTimeout(startScramble, delay);
            if (triggerOnce) {
              observer.unobserve(el);
            }
          }
        } else {
          if (!triggerOnce) {
            isRevealedRef.current = false;
            setDisplayText('');
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [text, delay, triggerOnce]);

  return (
    <span ref={elementRef} className={className}>
      {displayText || ' '}
    </span>
  );
}
