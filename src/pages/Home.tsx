import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { attendanceApi, projectApi, Project, TimeEntry } from '../api/client';
import { useAuthStore } from '../store/auth.store';
import { useGps } from '../hooks/useGps';
import ProjectPicker from '../components/ProjectPicker';
import RetroModal    from '../components/RetroModal';

export default function Home() {
  const { employee }  = useAuthStore();
  const qc            = useQueryClient();
  const gps           = useGps();
  const [showPicker,  setShowPicker]  = useState(false);
  const [showRetro,   setShowRetro]   = useState(false);
  const [retroType,   setRetroType]   = useState<'in'|'out'>('in');

  const { data: today, isLoading } = useQuery({
    queryKey: ['today'],
    queryFn:  () => attendanceApi.getToday().then(r => r.data),
    refetchInterval: 60_000,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn:  () => projectApi.getMyProjects().then(r => r.data),
  });

  const clockInMutation = useMutation({
    mutationFn: (projectId: string) => attendanceApi.clockIn({
      projectId, lat: gps.coord?.lat, lng: gps.coord?.lng,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['today'] }),
    onError:   (e: any) => alert(e.response?.data?.error ?? 'שגיאה בחתימת כניסה'),
  });

  const clockOutMutation = useMutation({
    mutationFn: () => attendanceApi.clockOut({ lat: gps.coord?.lat, lng: gps.coord?.lng }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['today'] }),
    onError:   (e: any) => alert(e.response?.data?.error ?? 'שגיאה בחתימת יציאה'),
  });

  const isClockedIn  = today?.isCurrentlyClockedIn ?? false;
  const entries      = today?.entries ?? [];
  const openEntry    = entries.find(e => !e.endTime);
  const todayMinutes = entries.filter(e => e.endTime).reduce((s,e) => s+(e.totalMinutes??0), 0);
  const isBusy       = clockInMutation.isPending || clockOutMutation.isPending;
  const now          = new Date();
  const greeting     = now.getHours() < 12 ? 'בוקר טוב' : now.getHours() < 17 ? 'צהריים טובים' : 'ערב טוב';

  const handleClockOut = () => {
    if (!window.confirm(`לאשר יציאה מ-${openEntry?.project?.name}?`)) return;
    clockOutMutation.mutate();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-primary px-5 pt-14 pb-6 safe-top">
        <p className="text-white/70 text-sm">{greeting}</p>
        <h1 className="text-white text-2xl font-bold">{employee?.fullName?.split(' ')[0]}</h1>
        <p className="text-white/50 text-xs mt-1">
          {format(now, 'EEEE, d בMMMM', { locale: he })}
        </p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 pb-28">

        {/* Status card */}
        <div className={`card p-4 border-2 transition-colors ${
          isClockedIn ? 'border-green-400 bg-green-50' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-3 flex-row-reverse">
            <div className={`w-3 h-3 rounded-full ${isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <div className="flex-1 text-right">
              <p className={`font-semibold ${isClockedIn ? 'text-green-700' : 'text-gray-500'}`}>
                {isClockedIn ? `בעבודה — ${openEntry?.project?.name}` : 'לא מחתים נוכחות'}
              </p>
              {isClockedIn && openEntry && (
                <p className="text-green-600 text-sm mt-0.5">
                  מאז {format(new Date(openEntry.startTime), 'HH:mm')}
                </p>
              )}
              {todayMinutes > 0 && (
                <p className="text-gray-500 text-sm">סה״כ היום: {fmtMin(todayMinutes)}</p>
              )}
            </div>
          </div>

          {/* GPS indicator */}
          <div className="mt-3 flex items-center justify-end gap-1.5">
            <span className="text-xs text-gray-400">{gps.statusLabel}</span>
            <span className="text-xs">{
              gps.status === 'ok'      ? '📍' :
              gps.status === 'loading' ? '🔄' :
              gps.status === 'denied'  ? '⚠️' : '📍'
            }</span>
          </div>
        </div>

        {/* Main CTA button */}
        <button
          onClick={isClockedIn ? handleClockOut : () => setShowPicker(true)}
          disabled={isBusy}
          className={`w-full py-6 rounded-3xl text-white text-xl font-black
                      shadow-lg active:scale-95 transition-transform disabled:opacity-60
                      flex items-center justify-center gap-3 ${
            isClockedIn ? 'bg-danger' : 'bg-success'
          }`}
        >
          {isBusy ? (
            <span className="text-2xl animate-spin">⏳</span>
          ) : (
            <>
              <span className="text-2xl">{isClockedIn ? '🚪' : '✅'}</span>
              {isClockedIn ? 'חתימת יציאה' : 'חתימת כניסה'}
            </>
          )}
        </button>

        {/* Retroactive buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setRetroType('in');  setShowRetro(true); }}
            className="card p-3 text-sm text-primary-light font-medium text-center active:bg-gray-50"
          >
            + כניסה רטרואקטיבית
          </button>
          <button
            onClick={() => { setRetroType('out'); setShowRetro(true); }}
            className="card p-3 text-sm text-primary-light font-medium text-center active:bg-gray-50"
          >
            + יציאה רטרואקטיבית
          </button>
        </div>

        {/* Today's entries */}
        {entries.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-2">פעילות היום</h2>
            <div className="card divide-y divide-gray-50">
              {entries.map(e => <EntryRow key={e.id} entry={e} />)}
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      <ProjectPicker
        open={showPicker}
        projects={projects}
        onSelect={(p) => { setShowPicker(false); clockInMutation.mutate(p.id); }}
        onClose={() => setShowPicker(false)}
      />

      <RetroModal
        open={showRetro}
        type={retroType}
        projects={projects}
        onClose={() => setShowRetro(false)}
        onDone={() => { setShowRetro(false); qc.invalidateQueries({ queryKey: ['today'] }); }}
      />

    </div>
  );
}

function EntryRow({ entry: e }: { entry: TimeEntry }) {
  return (
    <div className={`flex justify-between items-center px-4 py-3 ${e.isRetroactive ? 'bg-amber-50' : ''}`}>
      <div className="text-left">
        <p className="text-sm text-gray-500">
          {format(new Date(e.startTime), 'HH:mm')}
          {e.endTime ? ` – ${format(new Date(e.endTime), 'HH:mm')}` : ' (פתוח)'}
        </p>
        {e.totalMinutes && <p className="text-xs text-gray-400">{fmtMin(e.totalMinutes)}</p>}
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-800">{e.project.name}</p>
        {e.isRetroactive && <span className="text-xs text-amber-600">רטרואקטיבי</span>}
      </div>
    </div>
  );
}

function fmtMin(m: number) {
  return `${Math.floor(m/60)}:${String(m%60).padStart(2,'0')}`;
}
