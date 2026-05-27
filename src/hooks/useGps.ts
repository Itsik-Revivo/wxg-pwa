import { useState, useEffect, useCallback } from 'react';

export interface GpsCoord { lat: number; lng: number; accuracy?: number; }
export type GpsStatus = 'idle' | 'loading' | 'ok' | 'denied' | 'error';

export function useGps() {
  const [coord,   setCoord]   = useState<GpsCoord | null>(null);
  const [status,  setStatus]  = useState<GpsStatus>('idle');

  const get = useCallback(() => {
    if (!navigator.geolocation) { setStatus('error'); return; }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoord({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setStatus('ok');
      },
      (err) => {
        setStatus(err.code === 1 ? 'denied' : 'error');
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }
    );
  }, []);

  useEffect(() => { get(); }, [get]);

  const statusLabel = {
    idle:    '',
    loading: 'מאתר מיקום...',
    ok:      coord ? `דיוק: ${Math.round(coord.accuracy ?? 0)}מ'` : '',
    denied:  'הרשאת מיקום נדחתה',
    error:   'שגיאת מיקום',
  }[status];

  return { coord, status, statusLabel, refresh: get };
}
