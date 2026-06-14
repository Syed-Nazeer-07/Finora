import { Link, useLocation } from 'react-router-dom';
import { Home, List, PieChart, Target, TrendingUp, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Transactions', path: '/transactions', icon: List },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Investments', path: '/investments', icon: TrendingUp },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-card border-r flex flex-col h-screen hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Finora</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
