'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import HolographicCard from '@/components/ui/HolographicCard';
import TextScramble from '@/components/ui/TextScramble';
import FuturisticCta from '@/components/ui/FuturisticCta';

const navLinks = [
  { label: 'Fitur', href: '#features' },
  { label: 'Cara Kerja', href: '#how-it-works' },
  { label: 'Masuk', href: '/login' },
];

const features = [
  { icon: '🔗', title: 'Dual-Device Lock-In', desc: 'Sinkronkan laptop & HP. Sesimu otomatis terkunci, HP wajib tengkurap di meja.' },
  { icon: '📖', title: 'Fullscreen Chamber', desc: 'Lingkungan belajar bebas distraksi dengan PDF viewer & markdown editor.' },
  { icon: '🧘', title: 'Zen Editor', desc: 'Editor markdown dengan auto-save yang bisa dipakai fullscreen. Tenang, nggak ada notifikasi.' },
  { icon: '📥', title: 'Distraction Inbox', desc: 'Catat pikiran yang mengganggu via Ctrl+I. Catatanmu terkunci sampai sesi selesai.' },
  { icon: '🧩', title: 'TaskChunker + Heatmap', desc: 'Pecah tugas jadi chunk kecil. Lihat progress lewat heatmap kontribusi.' },
  { icon: '🛡️', title: 'Focus Allow-list', desc: 'Tentukan website & aplikasi yang boleh diakses selama sesi fokus.' },
];

const steps = [
  { num: '01', title: 'Buat Akun', desc: 'Daftar gratis, langsung bisa mulai.' },
  { num: '02', title: 'Atur Allow-list', desc: 'Tentukan website & aplikasi yang diizinkan selama fokus.' },
  { num: '03', title: 'Mulai Sesi', desc: 'Upload PDF, atur task chunks, dan mulai sesi fokus.' },
  { num: '04', title: 'Anchor HP-mu', desc: 'Tengkurapkan HP di meja. Sensor orientation akan mengunci posisinya.' },
];

const techLogos = [
  { name: 'Next.js 14', color: 'text-white' },
  { name: 'TypeScript', color: 'text-blue-500' },
  { name: 'Tailwind CSS', color: 'text-sky-400' },
  { name: 'Zustand', color: 'text-amber' },
  { name: 'Supabase', color: 'text-emerald-light' },
  { name: 'Supabase Realtime', color: 'text-emerald' },
  { name: 'PDF.js', color: 'text-crimson-light' },
  { name: 'Chart.js', color: 'text-violet-light' },
];

function FadeInSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showNav, setShowNav] = useState(false);

  // States and refs for Navbar Flow Line
  const navRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navLinksRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);
  const [hoveredNavItem, setHoveredNavItem] = useState<number | null>(null);
  const [lineCoords, setLineCoords] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Contextual Navigation Trigger: show nav on hover near top, or when scrolled
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 110 || scrolled) {
        setShowNav(true);
      } else {
        setShowNav(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [scrolled]);

  // Update navbar flow line coordinates
  useEffect(() => {
    if (hoveredNavItem === null || !logoRef.current || !navRef.current) {
      setLineCoords(null);
      return;
    }

    const updateCoords = () => {
      const logoEl = logoRef.current;
      const navEl = navRef.current;
      const itemEl = navLinksRefs.current[hoveredNavItem];
      
      if (!logoEl || !navEl || !itemEl) return;

      const logoRect = logoEl.getBoundingClientRect();
      const navRect = navEl.getBoundingClientRect();
      const itemRect = itemEl.getBoundingClientRect();

      setLineCoords({
        startX: logoRect.right - navRect.left - 10,
        startY: logoRect.top - navRect.top + logoRect.height / 2,
        endX: itemRect.left - navRect.left + itemRect.width / 2,
        endY: itemRect.bottom - navRect.top - 8,
      });
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [hoveredNavItem]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const [simState, setSimState] = useState<'idle' | 'pairing' | 'focusing' | 'lifted' | 'blurred' | 'failed'>('idle');
  const [simStrikes, setSimStrikes] = useState(0);
  const [simTime, setSimTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (['focusing', 'lifted', 'blurred'].includes(simState)) {
      timer = setInterval(() => {
        setSimTime(prev => prev + 1);
      }, 1000);
    } else {
      setSimTime(0);
    }
    return () => clearInterval(timer);
  }, [simState]);

  const simTimeFormatted = `${Math.floor(simTime / 60).toString().padStart(2, '0')}:${(simTime % 60).toString().padStart(2, '0')}`;

  const handleSimPair = () => {
    setSimState('pairing');
    setSimStrikes(0);
    setTimeout(() => {
      setSimState('focusing');
    }, 1500);
  };

  const handleSimLift = () => {
    if (simState === 'focusing') {
      const nextStrikes = simStrikes + 1;
      setSimStrikes(nextStrikes);
      if (nextStrikes >= 3) {
        setSimState('failed');
      } else {
        setSimState('lifted');
      }
    }
  };

  const handleSimBlur = () => {
    if (simState === 'focusing') {
      setSimState('blurred');
    }
  };

  const handleSimRefocus = () => {
    if (simState === 'lifted' || simState === 'blurred') {
      setSimState('focusing');
    }
  };

  const handleSimReset = () => {
    setSimState('idle');
    setSimStrikes(0);
    setSimTime(0);
  };

  return (
    <div className="relative min-h-screen">

      <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${showNav ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'} ${scrolled ? 'bg-deeper/80 backdrop-blur-xl border-b border-glass-border shadow-glass' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
          
          <div ref={logoRef} className="flex items-center gap-3 relative z-20">
            <img src="/FocuSync.svg" alt="FocuSync" className="h-8 w-auto animate-breathe" />
            <span className="font-display font-bold text-lg text-text-primary">FocuSync</span>
          </div>

          <div className="hidden md:flex items-center gap-8 relative z-20">
            {navLinks.map((l, idx) => (
              l.href.startsWith('#') ? (
                <button 
                  key={l.label} 
                  ref={el => { navLinksRefs.current[idx] = el; }}
                  onMouseEnter={() => setHoveredNavItem(idx)}
                  onMouseLeave={() => setHoveredNavItem(null)}
                  onClick={() => scrollTo(l.href.slice(1))} 
                  className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
                >
                  {l.label}
                </button>
              ) : (
                <Link 
                  key={l.label} 
                  href={l.href}
                  ref={el => { navLinksRefs.current[idx] = el; }}
                  onMouseEnter={() => setHoveredNavItem(idx)}
                  onMouseLeave={() => setHoveredNavItem(null)}
                  className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
                >
                  {l.label}
                </Link>
              )
            ))}
          </div>

          {/* SVG Flow Line Node Connection */}
          {lineCoords && (
            <svg className="absolute inset-0 pointer-events-none w-full h-full z-10">
              <path
                d={`M ${lineCoords.startX} ${lineCoords.startY} C ${lineCoords.startX + (lineCoords.endX - lineCoords.startX) * 0.3} ${lineCoords.startY}, ${lineCoords.endX - (lineCoords.endX - lineCoords.startX) * 0.3} ${lineCoords.endY + 12}, ${lineCoords.endX} ${lineCoords.endY}`}
                fill="none"
                stroke="rgba(167, 139, 250, 0.7)"
                strokeWidth="1.2"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(124, 58, 237, 0.5))',
                }}
              />
              <circle r="2.5" fill="#22d3ee">
                <animateMotion
                  path={`M ${lineCoords.startX} ${lineCoords.startY} C ${lineCoords.startX + (lineCoords.endX - lineCoords.startX) * 0.3} ${lineCoords.startY}, ${lineCoords.endX - (lineCoords.endX - lineCoords.startX) * 0.3} ${lineCoords.endY + 12}, ${lineCoords.endX} ${lineCoords.endY}`}
                  dur="0.6s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          )}

          <div className="flex items-center gap-3 relative z-20">
            <Link href="/register" className="hidden sm:inline-flex px-5 py-2 rounded-xl bg-glass border border-white/10 hover:border-violet-light/35 text-text-primary hover:text-white text-sm font-semibold transition-all duration-300 active:scale-95 interactive">
              Daftar
            </Link>
            <button className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-glass-hover transition-all interactive" aria-label="Toggle navigation menu">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 5h14M3 10h14M3 15h10" /></svg>
            </button>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-pale border border-violet/30 text-violet-light text-xs font-semibold uppercase tracking-wider mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="w-2 h-2 rounded-full bg-violet animate-pulse" />
            Cross-Device Focus App
          </div>

          <h1 className={`text-5xl sm:text-6xl md:text-8xl font-display font-bold leading-[1.1] mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="bg-gradient-to-r from-teal-300 via-teal-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(52,211,153,0.12)]">
              <TextScramble text="Unlock Your Potential." delay={150} />
            </span>
          </h1>

          <p className={`text-text-secondary text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Aplikasi produktivitas cross-device yang menyinkronkan laptop dan HP-mu.
           <br className="hidden sm:block" />Belajar bebas distraksi dengan sistem dua perangkat yang saling mengunci.
          </p>

          <div className={`flex items-center justify-center transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <FuturisticCta />
          </div>

          <p className={`text-text-muted text-xs mt-20 transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            6 Fitur Inti · 14 Hari Build · 0 AI Digunakan
          </p>
        </div>
      </section>

      {/* Interactive Simulator Section */}
      <section className="relative px-6 py-16 border-t border-b border-glass-border bg-deeper/50">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-pale border border-violet/30 text-violet-light text-xs font-semibold uppercase tracking-wider mb-4">Coba Sekarang</span>
            <h2 className="text-3xl font-display font-bold text-text-primary">Live Interactive Simulator</h2>
            <p className="text-text-secondary text-sm mt-2 max-w-xl mx-auto">Simulasikan sistem penguncian lintas perangkat FocuSync langsung dari browser Anda.</p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center mb-10">
            {/* Mock Desktop Chamber View */}
            <div className="md:col-span-3 bg-surface border border-glass-border rounded-2xl p-6 shadow-glass relative min-h-[300px] flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet/5 via-transparent to-transparent pointer-events-none" />
              
              {/* Mock Header */}
              <div className="flex items-center justify-between border-b border-glass-border pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-[10px] text-text-muted font-mono ml-2">FocuSync Chamber (Laptop)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-emerald">● ONLINE</span>
                  {['focusing', 'lifted', 'blurred'].includes(simState) && (
                    <span className="text-xs font-mono font-bold text-text-primary">{simTimeFormatted}</span>
                  )}
                </div>
              </div>

              {/* Mock Content */}
              <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10 py-4">
                {simState === 'idle' && (
                  <div className="space-y-3">
                    <p className="text-text-secondary text-sm">Menunggu koneksi dari perangkat mobile Anda...</p>
                    <div className="w-24 h-24 bg-white p-2 rounded-lg mx-auto flex items-center justify-center border border-glass-border">
                      {/* Fake QR representation */}
                      <div className="grid grid-cols-4 gap-1 w-full h-full bg-deeper p-1 rounded">
                        {Array.from({ length: 16 }).map((_, idx) => (
                          <div key={idx} className={`rounded-xs ${idx % 3 === 0 || idx === 10 ? 'bg-white' : 'bg-transparent'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-text-muted">Pindai kode QR untuk menghubungkan</p>
                  </div>
                )}

                {simState === 'pairing' && (
                  <div className="space-y-3">
                    <div className="w-8 h-8 rounded-full border border-t-2 border-violet border-t-transparent animate-spin mx-auto" />
                    <p className="text-text-secondary text-sm">Menghubungkan perangkat...</p>
                  </div>
                )}

                {simState === 'focusing' && (
                  <div className="space-y-4 w-full">
                    <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-emerald-pale border border-emerald/20 text-emerald-light text-xs font-semibold max-w-xs mx-auto animate-pulse">
                      <span>🧘 Sesi Fokus Aktif (Layar Terkunci)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
                      <div className="bg-glass border border-glass-border p-3 rounded-xl">
                        <div className="text-[10px] text-text-muted font-bold uppercase">Materi Belajar (PDF)</div>
                        <p className="text-xs text-text-secondary mt-1 truncate">materi_kuliah_v2.pdf</p>
                      </div>
                      <div className="bg-glass border border-glass-border p-3 rounded-xl">
                        <div className="text-[10px] text-text-muted font-bold uppercase">Markdown Editor</div>
                        <p className="text-xs text-text-secondary mt-1 truncate">Catatan tersimpan...</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted font-semibold">Strikes: {simStrikes} / 3</p>
                  </div>
                )}

                {simState === 'lifted' && (
                  <div className="space-y-3 w-full animate-strike-shake">
                    <div className="bg-crimson-pale border border-crimson/50 text-crimson-light text-xs font-bold px-4 py-2.5 rounded-xl max-w-xs mx-auto">
                      ⚠️ WARNING: PHONE LIFTED!
                    </div>
                    <p className="text-text-secondary text-xs">Kembalikan ponsel menghadap ke bawah di meja!</p>
                    <p className="text-sm font-bold text-crimson-light">Strikes: {simStrikes} / 3</p>
                  </div>
                )}

                {simState === 'blurred' && (
                  <div className="absolute inset-0 bg-deeper/80 backdrop-blur-md flex flex-col justify-center items-center p-6 z-20">
                    <div className="bg-glass border border-glass-border rounded-xl p-5 max-w-xs text-center space-y-3 animate-scale-in">
                      <p className="text-text-primary text-xs font-bold">Refocus Self-Report</p>
                      <p className="text-[11px] text-text-secondary">Anda terdeteksi keluar dari layar peramban belajar.</p>
                      <button
                        onClick={handleSimRefocus}
                        className="w-full px-3 py-1.5 rounded-lg bg-violet text-white text-[11px] font-semibold hover:bg-violet/85 transition-all"
                      >
                        Kembali ke Sesi (+1 Strike)
                      </button>
                    </div>
                  </div>
                )}

                {simState === 'failed' && (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-crimson-pale border border-crimson/30 flex items-center justify-center mx-auto mb-2 text-xl">
                      🔴
                    </div>
                    <p className="text-crimson-light text-sm font-bold">SESI GAGAL</p>
                    <p className="text-text-secondary text-xs">Batas pelanggaran terlampaui (3 Strikes).</p>
                    <button
                      onClick={handleSimReset}
                      className="px-4 py-1.5 rounded-lg bg-glass border border-glass-border text-text-primary text-xs font-semibold hover:bg-glass-hover transition-all"
                    >
                      Mulai Ulang Simulasi
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mock Mobile View */}
            <div className="md:col-span-2 flex justify-center">
              <div className="w-48 h-96 bg-deeper border-4 border-glass-border rounded-[36px] p-3 shadow-glass relative flex flex-col justify-between overflow-hidden">
                {/* Speaker/Camera notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-glass-border rounded-full z-20" />
                
                {/* Screen background glow */}
                <div className={`absolute inset-0 transition-colors duration-500 ${
                  simState === 'lifted' 
                    ? 'bg-crimson-pale/25 shadow-[inset_0_0_40px_rgba(239,68,68,0.3)]' 
                    : simState === 'focusing' 
                    ? 'bg-emerald-pale/5' 
                    : 'bg-transparent'
                }`} />

                {/* Screen Content */}
                <div className="flex-1 flex flex-col justify-between pt-6 pb-2 text-center relative z-10">
                  <div className="text-[9px] text-text-muted font-mono tracking-widest mt-1">FocuSync Mobile Anchor</div>

                  <div className="my-auto py-4">
                    {simState === 'idle' && (
                      <div className="space-y-2">
                        <span className="text-2xl">📷</span>
                        <p className="text-[10px] text-text-secondary px-2">Buka kamera HP dan pindai kode QR di layar desktop.</p>
                      </div>
                    )}

                    {simState === 'pairing' && (
                      <div className="space-y-2">
                        <div className="w-6 h-6 rounded-full border border-t-2 border-amber border-t-transparent animate-spin mx-auto" />
                        <p className="text-[10px] text-amber">Menghubungkan...</p>
                      </div>
                    )}

                    {simState === 'focusing' && (
                      <div className="space-y-2 animate-pulse">
                        <span className="text-3xl">📴</span>
                        <p className="text-[10px] text-emerald-light font-bold">HP Terkunci</p>
                        <p className="text-[8px] text-text-muted px-3">Terbaring aman menghadap ke bawah di meja.</p>
                      </div>
                    )}

                    {simState === 'lifted' && (
                      <div className="space-y-2 animate-strike-shake">
                        <span className="text-3xl animate-bounce">🚨</span>
                        <p className="text-[10px] text-crimson-light font-bold">HP TERANGKAT!</p>
                        <p className="text-[8px] text-text-secondary px-2">Ponsel bergetar keras. Kembalikan ke meja!</p>
                      </div>
                    )}

                    {simState === 'blurred' && (
                      <div className="space-y-2">
                        <span className="text-3xl">💤</span>
                        <p className="text-[10px] text-text-secondary">Desktop Blur</p>
                        <p className="text-[8px] text-text-muted px-2">Sesi ditangguhkan di laptop.</p>
                      </div>
                    )}

                    {simState === 'failed' && (
                      <div className="space-y-2">
                        <span className="text-3xl">❌</span>
                        <p className="text-[10px] text-crimson-light font-bold">Sesi Gagal</p>
                        <p className="text-[8px] text-text-muted px-2">Batas pelanggaran 3/3 tercapai.</p>
                      </div>
                    )}
                  </div>

                  {/* Home Bar indicator */}
                  <div className="w-16 h-1 bg-glass-border rounded-full mx-auto mt-2" />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 bg-glass border border-glass-border rounded-2xl p-4 max-w-2xl mx-auto shadow-glass backdrop-blur-md">
            {simState === 'idle' && (
              <button
                onClick={handleSimPair}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet to-purple-700 text-white text-xs font-semibold shadow-glow-v hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] transition-all duration-300 active:scale-95"
              >
                1. Simulasikan QR Scan
              </button>
            )}

            {simState === 'focusing' && (
              <>
                <button
                  onClick={handleSimLift}
                  className="px-5 py-2.5 rounded-xl bg-crimson-pale border border-crimson/30 text-crimson-light text-xs font-semibold hover:bg-crimson/20 transition-all duration-300 active:scale-95"
                >
                  2. Angkat HP (Ponsel Bergerak)
                </button>
                <button
                  onClick={handleSimBlur}
                  className="px-5 py-2.5 rounded-xl bg-glass border border-glass-border text-text-secondary text-xs font-semibold hover:bg-glass-hover transition-all duration-300 active:scale-95"
                >
                  3. Pindah Tab (Alt + Tab)
                </button>
              </>
            )}

            {simState === 'lifted' && (
              <button
                onClick={handleSimRefocus}
                className="px-5 py-2.5 rounded-xl bg-emerald text-white text-xs font-semibold shadow-glow-e hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all duration-300 active:scale-95"
              >
                4. Kembalikan Posisi HP (Telungkup)
              </button>
            )}

            {(simState === 'failed' || simState === 'blurred') && (
              <button
                onClick={handleSimReset}
                className="px-5 py-2.5 rounded-xl bg-glass border border-glass-border text-text-primary text-xs font-semibold hover:bg-glass-hover transition-all duration-300 active:scale-95"
              >
                Kembalikan ke Sesi Baru (Reset)
              </button>
            )}

            {simState !== 'idle' && (
              <button
                onClick={handleSimReset}
                className="px-4 py-2 rounded-xl bg-glass border border-glass-border text-text-muted hover:text-text-primary text-xs font-medium transition-all"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </section>

      <section id="features" className="relative px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-pale border border-violet/30 text-violet-light text-xs font-semibold uppercase tracking-wider mb-4">Fitur Unggulan</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-text-primary">Segala yang Kamu Butuhkan untuk Fokus</h2>
            <p className="text-text-secondary mt-4 max-w-xl mx-auto">Dirancang khusus untuk mengurangi friction dan memaksimalkan konsentrasi.</p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FadeInSection key={f.title}>
                <HolographicCard className="group h-full bg-glass border border-glass-border rounded-xl p-6 shadow-glass backdrop-blur-md">
                  <div className="w-12 h-12 rounded-xl bg-violet-pale border border-violet/20 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                  <h3 className="text-text-primary font-display font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
                </HolographicCard>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-pale border border-emerald/30 text-emerald-light text-xs font-semibold uppercase tracking-wider mb-4">Cara Kerja</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-text-primary">Mulai dalam 4 Langkah</h2>
            <p className="text-text-secondary mt-4 max-w-xl mx-auto">Dari setup sampai sesi fokus pertama dalam hitungan menit.</p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <FadeInSection key={s.num}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-violet-pale border border-violet/20 flex items-center justify-center mx-auto mb-5">
                    <span className="text-violet-light text-2xl font-display font-bold">{s.num}</span>
                  </div>
                  <h3 className="text-text-primary font-display font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>

          <FadeInSection className="mt-16">
            <div className="relative bg-glass border border-glass-border rounded-2xl p-8 shadow-glass backdrop-blur-md overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet/5 via-transparent to-emerald/5 pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-text-primary font-display font-bold text-xl mb-2">Siap Meningkatkan Produktivitas?</h3>
                  <p className="text-text-secondary text-sm">Bergabung gratis. Tidak perlu kartu kredit.</p>
                </div>
                <Button href="/register" size="lg">Mulai Sekarang</Button>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      <section className="relative px-6 py-20 border-t border-glass-border">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-12">
            <h2 className="text-xl font-display font-bold text-text-primary mb-4">Dibangun dengan Teknologi Modern</h2>
          </FadeInSection>
          <div className="flex flex-wrap justify-center gap-6">
            {techLogos.map((t) => (
              <FadeInSection key={t.name}>
                <div className={`px-5 py-3 rounded-xl bg-glass border border-glass-border text-sm font-mono font-semibold ${t.color}`}>
                  {t.name}
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-glass-border px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/FocuSync.svg" alt="FocuSync" className="h-6 w-auto" />
            <span className="font-display font-bold text-text-primary">FocuSync</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <Link href="/login" className="hover:text-text-primary transition-colors">Masuk</Link>
            <Link href="/register" className="hover:text-text-primary transition-colors">Daftar</Link>
            <Link href="/dashboard" className="hover:text-text-primary transition-colors">Dashboard</Link>
            <span className="text-text-muted">© {new Date().getFullYear()} FocuSync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
