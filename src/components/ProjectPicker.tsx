import { useState } from 'react';
import { Project } from '../api/client';

interface Props {
  open: boolean; projects: Project[];
  onSelect: (p: Project) => void; onClose: () => void;
}

export default function ProjectPicker({ open, projects, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');

  if (!open) return null;

  const filtered = projects.filter(p =>
    p.name.includes(search) || (p.projectCode?.includes(search) ?? false)
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl safe-bottom
                      max-h-[85vh] flex flex-col animate-slide-up">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <button onClick={onClose} className="text-sm text-danger font-medium">ביטול</button>
          <h2 className="font-bold text-gray-800">בחר פרויקט</h2>
          <div className="w-12" />
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <input
            className="input text-base"
            placeholder="חפש שם או מספר..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="w-full flex items-center justify-between px-5 py-4
                         active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {p.hasPolygon && <span className="text-xs text-green-600">📍</span>}
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-800">{p.name}</p>
                {p.projectCode && <p className="text-sm text-gray-400">מס' {p.projectCode}</p>}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-10">לא נמצאו פרויקטים</p>
          )}
        </div>
      </div>
    </>
  );
}
