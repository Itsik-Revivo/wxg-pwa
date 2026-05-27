import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { msalInstance } from '../auth/msalConfig';

export default function Login() {
  const { login, loadMe, isLoading, error, employee } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    msalInstance.initialize().then(() => loadMe());
  }, []);

  useEffect(() => {
    if (employee) navigate('/home', { replace: true });
  }, [employee]);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-between p-8 safe-top safe-bottom">

      {/* Logo block */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-28 h-28 rounded-full bg-white/15 border-2 border-white/30
                        flex items-center justify-center">
          <span className="text-white text-3xl font-black tracking-widest">WXG</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">מערכת נוכחות</h1>
          <p className="text-white/60 mt-2">וקסמן גרופ</p>
        </div>
      </div>

      {/* Login block */}
      <div className="w-full max-w-sm space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3
                          text-white text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={login}
          disabled={isLoading}
          className="btn-primary bg-white text-primary hover:bg-white/90 disabled:opacity-60 shadow-lg"
          style={{ color: '#1B3A6B' }}
        >
          {isLoading ? (
            <span className="animate-spin text-xl">⏳</span>
          ) : (
            <>
              <span className="text-xl">🔐</span>
              <span>כניסה עם חשבון WXG</span>
            </>
          )}
        </button>

        <p className="text-white/40 text-xs text-center">
          כניסה דרך חשבון Microsoft הארגוני שלך
        </p>
      </div>

    </div>
  );
}
