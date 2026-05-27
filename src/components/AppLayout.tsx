import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import BottomNav from './BottomNav';

export function AppLayout() {
  const { employee } = useAuthStore();
  if (!employee) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen">
      <Outlet />
      <BottomNav />
    </div>
  );
}
