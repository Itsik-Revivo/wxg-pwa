import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function Login() {
  const { loginWithEmail, isLoading, error, employee } = useAuthStore();
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (employee) navigate('/home', { replace: true });
  }, [employee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) loginWithEmail(email.trim());
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-between p-8 safe-top safe-bottom">

      {/* Logo */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3
                          text-white text-sm text-center">
            {error}
          </div>
        )}

        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="מייל ארגוני שלך"
          required
          dir="ltr"
          className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4
                     text-white placeholder-white/40 text-base text-left
                     focus:outline-none focus:ring-2 focus:ring-white/30"
        />

        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full bg-white text-primary rounded-2xl py-4 text-base font-bold
                     disabled:opacity-50 active:opacity-80 transition-opacity"
        >
          {isLoading ? '...' : 'כניסה'}
        </button>

        <p className="text-white/40 text-xs text-center pt-1">
          הכנס את המייל הארגוני שלך להתחברות
        </p>
      </form>

    </div>
  );
}
