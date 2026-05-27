import { useState } from 'react';
import { format } from 'date-fns';
import { attendanceApi, Project } from '../api/client';
import ProjectPicker from './ProjectPicker';

interface Props {
  open: boolean; type: 'in' | 'out';
  projects: Project[]; onClose: () => void; onDone: () => void;
}

export default function RetroModal({ open, type, projects, onClose, onDone }: Props) {
  const [project,  setProject]  = useState<Project | null>(null);
  const [datetime, setDatetime] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [note,     setNote]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  if (!open) return null;

  const isIn = type === 'in';

  const handleSubmit = async () => {
    if (isIn && !project) { alert('יש לבחור פרויקט'); return; }
    if (!note.trim())     { alert('יש להוסיף הסבר'); return; }

    setLoading(true);
    try {
      if (isIn) {
        await attendanceApi.clockIn({
          projectId: project!.id,
          isRetroactive: true, retroactiveNote: note,
          retroactiveTime: new Date(datetime).toISOString(),
        });
      } else {
        await attendanceApi.clockOut({
          isRetroactive: true, retroactiveNote: note,
          retroactiveTime: new Date(datetime).toISOString(),
        });
      }
      setNote(''); setProject(null);
      onDone();
    } catch (e: any) {
      alert(e.response?.data?.error ?? 'שגיאה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl safe-bottom
                      flex flex-col max-h-[90vh]">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <button onClick={onClose} className="text-sm text-danger font-medium">ביטול</button>
          <h2 className="font-bold text-gray-800">
            {isIn ? 'כניסה רטרואקטיבית' : 'יציאה רטרואקטיבית'}
          </h2>
          <div className="w-12" />
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Datetime */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">תאריך ושעה</label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={e => setDatetime(e.target.value)}
              max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              className="input"
            />
          </div>

          {/* Project (clock-in only) */}
          {isIn && (
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">פרויקט</label>
              <button
                onClick={() => setShowPicker(true)}
                className="input text-right flex justify-between items-center"
              >
                <span>▼</span>
                <span className={project ? 'text-gray-800' : 'text-gray-400'}>
                  {project?.name ?? 'בחר פרויקט...'}
                </span>
              </button>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              סיבה לדיווח רטרואקטיבי *
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="הסבר מדוע הדיווח מתבצע בדיעבד..."
              className="input min-h-[90px] resize-none"
            />
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700 leading-relaxed">
              ⚠️ דיווחים רטרואקטיביים מסומנים בצהוב ויוצגו לחשבת השכר בסגירת חודש
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary disabled:opacity-60"
          >
            {loading ? 'שומר...' : 'שמור דיווח'}
          </button>

        </div>
      </div>

      {/* Nested project picker */}
      <ProjectPicker
        open={showPicker}
        projects={projects}
        onSelect={p => { setProject(p); setShowPicker(false); }}
        onClose={() => setShowPicker(false)}
      />
    </>
  );
}
