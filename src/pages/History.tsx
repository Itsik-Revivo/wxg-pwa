import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, isWeekend } from 'date-fns';
import { he } from 'date-fns/locale';
import { attendanceApi, reportApi, TimeEntry } from '../api/client';

const STATUS_HE: Record<string, string> = {
  OPEN:'פתוח', PENDING:'ממתין לאישור', APPROVED:'אושר', LOCKED:'נעול',
};
const STATUS_CLS: Record<string, string> = {
  OPEN:'bg-blue-100 text-blue-700', PENDING:'bg-yellow-100 text-yellow-700',
  APPROVED:'bg-green-100 text-green-700', LOCKED:'bg-gray-100 text-gray-600',
};

export default function History() {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const goBack    = () => month === 1  ? (setMonth(12), setYear(y=>y-1)) : setMonth(m=>m-1);
  const goForward = () => {
    if (year === now.getFullYear() && month === now.getMonth() + 1) return;
    month === 12 ? (setMonth(1), setYear(y=>y+1)) : setMonth(m=>m+1);
  };

  const { data: entries = [] } = useQuery({
    queryKey: ['history', year, month],
    queryFn:  () => attendanceApi.getMonth(year, month).then(r => r.data),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['reports', year, month],
    queryFn:  () => reportApi.getReports(year, month).then(r => r.data),
  });

  const report = reports[0];

  // Group by date
  const byDate = entries.reduce((acc, e) => {
    const d = e.date.substring(0,10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {} as Record<string, TimeEntry[]>);

  const monthLabel = format(new Date(year, month-1), 'MMMM yyyy', { locale: he });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-primary px-5 pt-14 pb-5 safe-top">
        <h1 className="text-white text-xl font-bold mb-3">היסטוריה</h1>

        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={goForward} className="text-white/70 text-2xl px-2 active:opacity-50">‹</button>
          <span className="text-white font-semibold">{monthLabel}</span>
          <button onClick={goBack}    className="text-white/70 text-2xl px-2 active:opacity-50">›</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">

        {/* Summary card */}
        {report && (
          <div className="card p-4">
            <div className="flex justify-between items-center mb-3">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_CLS[report.status]}`}>
                {STATUS_HE[report.status]}
              </span>
              <span className="text-sm font-semibold text-gray-700">סיכום חודשי</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SumItem label="שעות בפועל"  value={fmtH(report.totalWorkedMinutes)} big />
              <SumItem label="תקן"          value={fmtH(report.expectedMinutes)} />
              <SumItem label="שעות נוספות" value={fmtH(report.overtimeMinutes)} accent />
              <SumItem label="היעדרויות"   value={fmtH(report.absenceMinutes)} />
            </div>
          </div>
        )}

        {/* Daily entries */}
        {Object.entries(byDate)
          .sort(([a],[b]) => b.localeCompare(a))
          .map(([dateStr, dayEntries]) => {
            const d        = new Date(dateStr);
            const dayTotal = dayEntries.filter(e=>e.endTime).reduce((s,e)=>s+(e.totalMinutes??0),0);
            const hasOpen  = dayEntries.some(e=>!e.endTime);

            return (
              <div key={dateStr} className="card overflow-hidden">
                {/* Day header */}
                <div className="flex justify-between items-center px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500">
                    {hasOpen ? '⏳' : fmtH(dayTotal)}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {format(d, 'EEEE, d/M', { locale: he })}
                  </span>
                </div>

                {/* Entries */}
                {dayEntries.map(e => (
                  <div key={e.id}
                    className={`flex justify-between items-center px-4 py-3
                      border-b border-gray-50 last:border-0
                      ${e.isRetroactive ? 'bg-amber-50' : ''}`}
                  >
                    <div className="text-left">
                      <p className="text-sm text-gray-600">
                        {format(new Date(e.startTime),'HH:mm')}
                        {e.endTime ? ` – ${format(new Date(e.endTime),'HH:mm')}` : ' (פתוח)'}
                      </p>
                      {e.totalMinutes && (
                        <p className="text-xs text-gray-400">{fmtH(e.totalMinutes)}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">{e.project.name}</p>
                      {e.isRetroactive && (
                        <p className="text-xs text-amber-600">רטרואקטיבי</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

        {Object.keys(byDate).length === 0 && (
          <p className="text-center text-gray-400 py-16">אין נתונים לחודש זה</p>
        )}
      </div>
    </div>
  );
}

function SumItem({ label, value, big, accent }: {
  label: string; value: string; big?: boolean; accent?: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className={`font-bold ${big ? 'text-2xl text-primary' : accent ? 'text-lg text-amber-600' : 'text-lg text-gray-700'}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function fmtH(m: number) {
  return `${Math.floor(m/60)}:${String(m%60).padStart(2,'0')}`;
}
