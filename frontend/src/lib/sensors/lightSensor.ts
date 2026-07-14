'use client';
import { useState, useEffect } from 'react';

export function useLightSensor() {
  const [lux, setLux] = useState<number | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isSupported = 'AmbientLightSensor' in window;
    setSupported(isSupported);
    if (!isSupported) return;
    try {
      const sensor = new (window as unknown as { AmbientLightSensor: new () => { start: () => void; addEventListener: (e: string, fn: () => void) => void; illuminance: number } }).AmbientLightSensor();
      sensor.addEventListener('reading', () => setLux(sensor.illuminance));
      sensor.start();
    } catch {}
  }, []);

  return { lux, supported };
}
