'use client';
import { useState, useEffect, useCallback } from 'react';

interface OrientationData {
  beta: number | null;
  gamma: number | null;
  alpha: number | null;
  isFaceDown: boolean;
  isSupported: boolean;
  permissionGranted: boolean;
}

export function useOrientationSensor(): OrientationData & {
  requestPermission: () => Promise<void>;
  isStable: boolean;
} {
  const [data, setData] = useState<OrientationData>({
    beta: null, gamma: null, alpha: null,
    isFaceDown: false, isSupported: false, permissionGranted: false,
  });
  const [isStable, setIsStable] = useState(false);
  const [history, setHistory] = useState<Array<{ beta: number; time: number }>>([]);

  useEffect(() => {
    const supported = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
    setData(prev => ({ ...prev, isSupported: supported }));
    if (!supported) return;

    const needsPermission = typeof (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission === 'function';
    if (!needsPermission) {
      setData(prev => ({ ...prev, permissionGranted: true }));
    }
  }, []);

  useEffect(() => {
    if (!data.permissionGranted) return;
    const handler = (event: DeviceOrientationEvent) => {
      const beta = event.beta;
      if (beta == null) return;
      const isFaceDown = Math.abs(Math.abs(beta) - 180) < 30 || Math.abs(beta) < 30;
      setData(prev => ({ ...prev, beta, gamma: event.gamma, alpha: event.alpha, isFaceDown }));
      setHistory(prev => {
        const next = [...prev, { beta, time: Date.now() }];
        return next.slice(-20);
      });
    };
    window.addEventListener('deviceorientation', handler, true);
    return () => window.removeEventListener('deviceorientation', handler, true);
  }, [data.permissionGranted]);

  useEffect(() => {
    if (history.length < 5) { setIsStable(false); return; }
    const recent = history.slice(-10);
    const avg = recent.reduce((a, b) => a + b.beta, 0) / recent.length;
    setIsStable(recent.every(r => Math.abs(r.beta - avg) < 5));
  }, [history]);

  const requestPermission = useCallback(async () => {
    if (typeof (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission === 'function') {
      const state = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
      if (state === 'granted') setData(prev => ({ ...prev, permissionGranted: true }));
    }
  }, []);

  return { ...data, requestPermission, isStable };
}
