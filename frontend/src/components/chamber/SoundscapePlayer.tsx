"use client";

import React, { useState, useEffect, useRef } from "react";

type SoundType = "binaural" | "brown" | "rain" | "lofi";

export default function SoundscapePlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [soundType, setSoundType] = useState<SoundType>("binaural");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4); // 0 to 1

  // Web Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);

  // Audio HTML elements refs
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  // Close popup click listener
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Update volume of active source
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = volume;
    }
  }, [volume]);

  const startSynthesizedAudio = () => {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = volume;
    gainNodeRef.current = gain;

    if (soundType === "binaural") {
      // Binaural Beats: 400Hz Left, 440Hz Right (Gamma 40Hz)
      const merger = ctx.createChannelMerger(2);

      const oscLeft = ctx.createOscillator();
      oscLeft.type = "sine";
      oscLeft.frequency.value = 400;
      const gainLeft = ctx.createGain();
      oscLeft.connect(gainLeft);
      gainLeft.connect(merger, 0, 0); // Left channel

      const oscRight = ctx.createOscillator();
      oscRight.type = "sine";
      oscRight.frequency.value = 440;
      const gainRight = ctx.createGain();
      oscRight.connect(gainRight);
      gainRight.connect(merger, 0, 1); // Right channel

      merger.connect(gain);
      gain.connect(ctx.destination);

      oscLeft.start();
      oscRight.start();

      leftOscRef.current = oscLeft;
      rightOscRef.current = oscRight;
      sourceNodeRef.current = merger;
    } else if (soundType === "brown") {
      // Brown Noise
      const bufferSize = 10 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate volume
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      noiseSource.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();
      sourceNodeRef.current = noiseSource;
    }
  };

  const stopSynthesizedAudio = () => {
    try {
      leftOscRef.current?.stop();
    } catch {}
    try {
      rightOscRef.current?.stop();
    } catch {}
    try {
      if (sourceNodeRef.current && "stop" in sourceNodeRef.current) {
        (sourceNodeRef.current as unknown as { stop: () => void }).stop();
      }
    } catch {}
    try {
      audioCtxRef.current?.close();
    } catch {}

    leftOscRef.current = null;
    rightOscRef.current = null;
    sourceNodeRef.current = null;
    audioCtxRef.current = null;
    gainNodeRef.current = null;
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      // Stop
      if (soundType === "binaural" || soundType === "brown") {
        stopSynthesizedAudio();
      } else {
        htmlAudioRef.current?.pause();
      }
      setIsPlaying(false);
    } else {
      // Start
      if (soundType === "binaural" || soundType === "brown") {
        startSynthesizedAudio();
      } else {
        if (htmlAudioRef.current) {
          htmlAudioRef.current.play().catch((err) => {
            console.error("Playback failed:", err);
          });
        }
      }
      setIsPlaying(true);
    }
  };

  const handleSoundChange = (type: SoundType) => {
    // Stop current playbacks
    if (isPlaying) {
      if (soundType === "binaural" || soundType === "brown") {
        stopSynthesizedAudio();
      } else {
        htmlAudioRef.current?.pause();
      }
    }

    setSoundType(type);

    // Auto-restart if it was playing
    if (isPlaying) {
      setTimeout(() => {
        if (type === "binaural" || type === "brown") {
          const ctxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new ctxClass();
          audioCtxRef.current = ctx;
          const gain = ctx.createGain();
          gain.gain.value = volume;
          gainNodeRef.current = gain;

          if (type === "binaural") {
            const merger = ctx.createChannelMerger(2);
            const oscLeft = ctx.createOscillator();
            oscLeft.type = "sine";
            oscLeft.frequency.value = 400;
            const gainL = ctx.createGain();
            oscLeft.connect(gainL);
            gainL.connect(merger, 0, 0);

            const oscRight = ctx.createOscillator();
            oscRight.type = "sine";
            oscRight.frequency.value = 440;
            const gainR = ctx.createGain();
            oscRight.connect(gainR);
            gainR.connect(merger, 0, 1);

            merger.connect(gain);
            gain.connect(ctx.destination);
            oscLeft.start();
            oscRight.start();
            leftOscRef.current = oscLeft;
            rightOscRef.current = oscRight;
            sourceNodeRef.current = merger;
          } else {
            const bufferSize = 10 * ctx.sampleRate;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
              const white = Math.random() * 2 - 1;
              output[i] = (lastOut + 0.02 * white) / 1.02;
              lastOut = output[i];
              output[i] *= 3.5;
            }
            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;
            noiseSource.connect(gain);
            gain.connect(ctx.destination);
            noiseSource.start();
            sourceNodeRef.current = noiseSource;
          }
        } else {
          if (htmlAudioRef.current) {
            htmlAudioRef.current.src =
              type === "rain"
                ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" // Fallback rain stream/music
                : "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"; // Fallback lofi stream/music
            htmlAudioRef.current.volume = volume;
            htmlAudioRef.current.play().catch((err) => console.error(err));
          }
        }
      }, 100);
    }
  };

  // Clean up Web Audio API node tree on unmount
  useEffect(() => {
    return () => {
      stopSynthesizedAudio();
    };
  }, []);

  const currentStreamUrl =
    soundType === "rain"
      ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
      : "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";

  return (
    <div ref={containerRef} className="relative z-40">
      {/* Hidden audio element for fallback streams */}
      <audio
        ref={htmlAudioRef}
        src={currentStreamUrl}
        loop
        className="hidden"
      />

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-2 rounded-lg border transition-all duration-300 relative flex items-center justify-center ${
          isPlaying
            ? "bg-violet-pale/20 border-violet text-violet-light shadow-[0_0_15px_rgba(124,58,237,0.3)]"
            : "bg-glass border-glass-border text-text-secondary hover:text-text-primary hover:bg-glass-hover"
        }`}
        title="Fokus Audio Soundscape"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
        {isPlaying && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-violet animate-ping" />
        )}
      </button>

      <div 
        className={`absolute right-0 mt-2.5 w-64 bg-[#0d1117]/95 border border-glass-border/40 rounded-xl p-4 shadow-glass backdrop-blur-xl text-left transition-all duration-200 origin-top-right will-change-[transform,opacity] z-50 ${
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between mb-3.5">
          <h4 className="text-text-primary font-display font-bold text-xs">Audio Focus</h4>
          {isPlaying && (
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 bg-violet animate-eq-bar-1 rounded-sm" />
              <span className="w-0.5 bg-violet animate-eq-bar-2 rounded-sm" />
              <span className="w-0.5 bg-violet animate-eq-bar-3 rounded-sm" />
            </div>
          )}
        </div>

        <div className="space-y-1.5 mb-4">
          {[
            { id: "binaural", label: "🎧 Gamma Beats (40Hz)" },
            { id: "brown", label: "🌊 Deep Brown Noise" },
            { id: "rain", label: "🌧️ Ambient Rain Mix" },
            { id: "lofi", label: "☕ Lofi Chill Beats" },
          ].map((sound) => (
            <button
              key={sound.id}
              type="button"
              onClick={() => handleSoundChange(sound.id as SoundType)}
              className={`w-full px-3 py-2 rounded-lg text-left text-xs transition-all duration-200 ${
                soundType === sound.id
                  ? "bg-violet-pale/20 border border-violet/30 text-violet-light font-medium"
                  : "bg-glass border border-transparent text-text-secondary hover:bg-glass-hover"
              }`}
            >
              {sound.label}
            </button>
          ))}
        </div>

        <div className="space-y-3 pt-3 border-t border-glass-border">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePlayToggle}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-200 ${
                isPlaying
                  ? "bg-crimson text-white hover:bg-crimson/80"
                  : "bg-violet text-white hover:bg-violet/85 shadow-glow-v"
              }`}
            >
              {isPlaying ? (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="16" height="16" />
                  </svg>
                  <span>Mute</span>
                </>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Putar</span>
                </>
              )}
            </button>
            <div className="text-[10px] text-text-muted font-mono w-8 text-right">
              {Math.round(volume * 100)}%
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs">🔈</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-glass-border rounded-lg appearance-none cursor-pointer accent-violet"
            />
            <span className="text-xs">🔊</span>
          </div>
        </div>
      </div>
    </div>
  );
}
