'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

function passwordStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: '', color: '', width: '0%' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = [
    { label: 'Lemah', color: 'bg-crimson', width: '20%' },
    { label: 'Cukup', color: 'bg-amber', width: '40%' },
    { label: 'Kuat', color: 'bg-emerald', width: '70%' },
    { label: 'Sangat Kuat', color: 'bg-emerald-light', width: '100%' },
  ];
  return map[Math.min(score, 4) - 1] || map[0];
}

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  // States for terms and privacy modal visibility
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !agree) return; 
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          agreeToTerms: agree,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registrasi gagal.');
      }

      addToast('success', 'Registrasi berhasil! Silakan periksa email Anda atau masuk.');
      router.push('/login');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan jaringan atau server offline.';
      addToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-glass border border-glass-border text-text-secondary text-xs font-semibold hover:text-text-primary hover:bg-glass-hover transition-all duration-300 flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5l-5 5l5 5" />
        </svg>
        Kembali ke Home
      </Link>
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <img src="/FocuSync.svg" alt="FocuSync" className="h-16 w-auto mb-4 mx-auto" />
          <h1 className="text-2xl font-display font-bold text-text-primary">Buat Akun FocuSync</h1>
          <p className="text-text-secondary text-sm mt-1">Mulai perjalanan fokusmu</p>
        </div>

        <div className="bg-glass border border-glass-border rounded-2xl p-8 shadow-glass backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-text-secondary text-xs font-medium mb-1.5">Nama Lengkap</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 rounded-xl bg-surface border border-glass-border text-text-primary text-sm placeholder-text-muted outline-none focus:border-violet/50 focus:shadow-[0_0_20px_rgba(124,58,237,0.15)] transition-all duration-300"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-text-secondary text-xs font-medium mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-surface border border-glass-border text-text-primary text-sm placeholder-text-muted outline-none focus:border-violet/50 focus:shadow-[0_0_20px_rgba(124,58,237,0.15)] transition-all duration-300"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-text-secondary text-xs font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Buat password kuat"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-surface border border-glass-border text-text-primary text-sm placeholder-text-muted outline-none focus:border-violet/50 focus:shadow-[0_0_20px_rgba(124,58,237,0.15)] transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors p-1"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="w-full h-1.5 rounded-full bg-glass-border overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${strength.color}`} style={{ width: strength.width }} />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3">
              <input
                id="agree"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 w-4 h-4 rounded accent-violet cursor-pointer shrink-0"
              />
              <span className="text-text-secondary text-xs leading-relaxed select-none">
                <label htmlFor="agree" className="cursor-pointer">Saya setuju dengan </label>
                <button 
                  type="button" 
                  onClick={() => setIsTermsOpen(true)} 
                  className="text-violet-light hover:underline cursor-pointer"
                >
                  Syarat & Ketentuan
                </button>
                <label htmlFor="agree" className="cursor-pointer"> dan </label>
                <button 
                  type="button" 
                  onClick={() => setIsPrivacyOpen(true)} 
                  className="text-violet-light hover:underline cursor-pointer"
                >
                  Kebijakan Privasi
                </button>
              </span>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading || !agree}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mendaftarkan...
                </span>
              ) : 'Daftar'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-glass-border" /></div>
            <div className="relative flex justify-center"><span className="bg-glass px-3 text-text-muted text-xs">atau daftar dengan</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface border border-glass-border text-text-secondary text-sm font-medium hover:bg-glass-hover hover:border-glass-border-h transition-all duration-200 active:scale-[0.98]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface border border-glass-border text-text-secondary text-sm font-medium hover:bg-glass-hover hover:border-glass-border-h transition-all duration-200 active:scale-[0.98]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
              GitHub
            </button>
          </div>

          <p className="text-center text-text-muted text-xs mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-violet-light hover:underline font-medium">Masuk</Link>
          </p>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#0d1117] border border-glass-border rounded-2xl shadow-glass flex flex-col p-6 max-h-[85vh] animate-scale-in">
            <div className="flex justify-between items-center pb-4 border-b border-glass-border mb-4">
              <h2 className="text-lg font-display font-bold text-text-primary">Syarat & Ketentuan FocusSync</h2>
              <button 
                type="button" 
                onClick={() => setIsTermsOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors p-1"
                aria-label="Tutup"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[55vh] text-text-secondary text-sm space-y-4 pr-2 scrollbar-thin">
              <p>Selamat datang di <strong>FocusSync</strong>. Dengan mendaftar dan menggunakan aplikasi kami, Anda menyetujui seluruh ketentuan layanan berikut:</p>
              
              <h3 className="text-text-primary font-semibold mt-4">1. Ekosistem Produktivitas Non-AI</h3>
              <p>FocusSync merupakan aplikasi produktivitas lintas perangkat (*cross-device*) yang 100% bebas dari algoritma AI. Sinkronisasi antara laptop (Chamber UI) dan ponsel pintar (Device Anchor) dilakukan secara langsung menggunakan <strong>Supabase Realtime</strong>.</p>
              
              <h3 className="text-text-primary font-semibold mt-4">2. Sistem Penguncian Layar</h3>
              <p>Layanan kami membatasi distraksi secara fisik dengan cara mengunci layar ponsel dan laptop secara sinkron saat sesi fokus aktif. Anda memahami dan menyetujui bahwa sistem penguncian ini bekerja secara otomatis berdasarkan aturan durasi yang Anda tetapkan.</p>
              
              <h3 className="text-text-primary font-semibold mt-4">3. Kelayakan & Keamanan Akun</h3>
              <p>Pengguna diwajibkan berusia minimal 13 tahun. Anda bertanggung jawab penuh untuk mengamankan kredensial akun Anda (Nama Lengkap, Email, Password). Anda dilarang memodifikasi atau melakukan reverse-engineering terhadap sistem sinkronisasi/penguncian perangkat FocusSync.</p>
              
              <h3 className="text-text-primary font-semibold mt-4">4. Batasan Tanggung Jawab</h3>
              <p>FocusSync tidak bertanggung jawab atas kehilangan data pekerjaan, terputusnya notifikasi penting dari pihak ketiga, atau keterlambatan menerima panggilan darurat selama sesi penguncian/fokus sedang berjalan aktif.</p>
            </div>
            
            <div className="pt-4 border-t border-glass-border mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTermsOpen(false)}
                className="px-5 py-2.5 rounded-xl text-white font-semibold bg-[#7C3AED] hover:bg-[#7C3AED]/80 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#0d1117] border border-glass-border rounded-2xl shadow-glass flex flex-col p-6 max-h-[85vh] animate-scale-in">
            <div className="flex justify-between items-center pb-4 border-b border-glass-border mb-4">
              <h2 className="text-lg font-display font-bold text-text-primary">Kebijakan Privasi FocusSync</h2>
              <button 
                type="button" 
                onClick={() => setIsPrivacyOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors p-1"
                aria-label="Tutup"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[55vh] text-text-secondary text-sm space-y-4 pr-2 scrollbar-thin">
              <p>Kebijakan Privasi ini menjelaskan bagaimana FocusSync mengelola informasi pribadi Anda sesuai dengan standar perlindungan privasi UU PDP Indonesia dan GDPR:</p>
              
              <h3 className="text-text-primary font-semibold mt-4">1. Data yang Dikumpulkan</h3>
              <p>Kami mengumpulkan data profil pendaftaran dasar (Nama Lengkap, Email), data koneksi simulator (Unique Device ID, Nama tipe perangkat), serta data giroskop sensor orientasi untuk validasi sesi fokus.</p>
              
              <h3 className="text-text-primary font-semibold mt-4">2. Penggunaan Data Lintas Perangkat</h3>
              <p>Seluruh informasi Anda digunakan secara eksklusif untuk otentikasi akun, melakukan sinkronisasi status perangkat, serta meningkatkan performa sistem. Kami menjamin <strong>data Anda tidak akan pernah dijual, disewakan, atau ditukarkan kepada pihak ketiga atau pengiklan</strong>.</p>
              
              <h3 className="text-text-primary font-semibold mt-4">3. Otentikasi Pihak Ketiga (OAuth)</h3>
              <p>Pendaftaran via Google atau GitHub dikelola secara terisolasi melalui protokol OAuth 2.0. Kami hanya mengambil data ID unik, email, dan nama profil publik tanpa menyimpan kata sandi eksternal Anda.</p>
              
              <h3 className="text-text-primary font-semibold mt-4">4. Keamanan Enkripsi</h3>
              <p>Seluruh password di-hash secara satu arah (one-way hashing) sebelum disimpan. Semua pengiriman data perangkat dilindungi oleh enkripsi Transport Layer Security (TLS 1.3 / HTTPS) tingkat tinggi.</p>
            </div>
            
            <div className="pt-4 border-t border-glass-border mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(false)}
                className="px-5 py-2.5 rounded-xl text-white font-semibold bg-[#7C3AED] hover:bg-[#7C3AED]/80 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
