'use client';

import { usePathname } from 'next/navigation';
import ChronosField from '@/components/ui/ChronosField';
import HyperGrid from '@/components/ui/HyperGrid';

export default function FuturisticBackground() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (isHome) {
    return (
      <>
        <HyperGrid />
        <ChronosField />
      </>
    );
  }

  // Fallback to original static background on dashboard and other routes
  return (
    <div className="scene-bg">
      <div className="orb w-[600px] h-[600px] -top-48 -left-24 bg-[radial-gradient(circle,rgba(124,58,237,0.18)_0%,transparent_70%)] animate-orb-float [animation-duration:25s]" />
      <div className="orb w-[500px] h-[500px] top-[30%] -right-36 bg-[radial-gradient(circle,rgba(16,185,129,0.12)_0%,transparent_70%)] animate-orb-float [animation-duration:30s] [animation-delay:-8s]" />
      <div className="orb w-[400px] h-[400px] -bottom-24 left-[30%] bg-[radial-gradient(circle,rgba(96,165,250,0.10)_0%,transparent_70%)] animate-orb-float [animation-duration:20s] [animation-delay:-15s]" />
      <div className="grid-overlay" />
    </div>
  );
}
