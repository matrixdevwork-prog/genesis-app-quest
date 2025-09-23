import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BarChart3, 
  Settings, 
  Shield,
  FileText,
  Bell 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Content',
    href: '/admin/content',
    icon: FileText,
  },
  {
    name: 'Moderation',
    href: '/admin/moderation',
    icon: Shield,
  },
  {
    name: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 min-h-screen bg-card border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Admin Panel</h2>
        
        <nav className="space-y-2">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;