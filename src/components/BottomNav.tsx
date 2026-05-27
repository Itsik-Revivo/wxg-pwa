import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/home',    icon: '🕐', label: 'נוכחות'  },
  { to: '/history', icon: '📅', label: 'היסטוריה' },
  { to: '/profile', icon: '👤', label: 'פרופיל'  },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 safe-bottom z-30">
      <div className="flex">
        {TABS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors
               ${isActive ? 'text-primary' : 'text-gray-400'}`
            }
          >
            <span className="text-xl">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
