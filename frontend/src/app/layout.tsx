import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import PageTransition from '@/components/ui/PageTransition';
import AuthGuard from '@/components/layout/AuthGuard';
import FuturisticBackground from '@/components/layout/FuturisticBackground';
import CustomCursor from '@/components/ui/CustomCursor';

export const metadata: Metadata = {
  title: 'FocuSync — Lock Your Screen, Lock Your Phone, Unlock Your Potential',
  description: 'Aplikasi produktivitas cross-device yang menyinkronkan laptop dan HP untuk sesi belajar bebas distraksi.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen overflow-x-hidden">
        <CustomCursor />
        <FuturisticBackground />
        <ToastProvider>
          <AuthGuard>
            <PageTransition>
              {children}
            </PageTransition>
          </AuthGuard>
        </ToastProvider>
      </body>
    </html>
  );
}
