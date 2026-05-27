import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const COMPANY_HE: Record<string, string> = {
  WAXMAN_GROUP:          'וקסמן גרופ',
  WAXMAN_CONSULTANTS:    'יועצים והנדסה',
  WAXMAN_MANAGEMENT:     'ניהול והשבחה',
  WAXMAN_INFRASTRUCTURE: 'תשתיות ואנרגיה',
};

export default function Profile() {
  const { employee, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm('להתנתק מהמערכת?')) return;
    await logout();
    navigate('/login', { replace: true });
  };

  if (!employee) return null;

  const initials = employee.fullName.split(' ').map(w => w[0]).slice(0, 2).join('');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-primary px-5 pt-14 pb-10 safe-top flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <span className="text-white text-2xl font-bold">{initials}</span>
        </div>
        <h1 className="text-white text-xl font-bold">{employee.fullName}</h1>
        <p className="text-white/60 text-sm mt-1">{employee.jobTitle ?? 'עובד'}</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 pb-28">

        {/* Info card */}
        <div className="card divide-y divide-gray-50">
          <InfoRow label="חברה"    value={COMPANY_HE[employee.company] ?? employee.company} />
          <InfoRow label="מייל"    value={employee.email ?? '—'} ltr />
          {employee.isPayrollAdmin && (
            <InfoRow label="תפקיד מערכת" value="חשב/ת שכר" highlight />
          )}
        </div>

        {/* Install PWA tip */}
        <div className="card p-4 bg-blue-50 border-blue-100">
          <p className="text-sm font-semibold text-blue-800 text-right">💡 טיפ</p>
          <p className="text-xs text-blue-700 mt-1 text-right leading-relaxed">
            ניתן להוסיף את האפליקציה למסך הבית של הטלפון לגישה מהירה.
            לחץ על "שתף" ואז "הוסף למסך הבית"
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 border-2 border-danger text-danger rounded-2xl
                     font-semibold active:opacity-70 transition-opacity"
        >
          🚪  התנתקות
        </button>

        <p className="text-center text-gray-400 text-xs">גרסה 1.0.0</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, ltr, highlight }: {
  label: string; value: string; ltr?: boolean; highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center px-4 py-3.5">
      <span className={`text-sm ${highlight ? 'text-amber-600 font-semibold' : 'text-gray-700'} ${ltr ? 'text-left' : ''}`} dir={ltr ? 'ltr' : undefined}>
        {value}
      </span>
      <span className="text-sm text-gray-400 font-medium">{label}</span>
    </div>
  );
}
