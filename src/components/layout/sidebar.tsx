'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/use-auth';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  Layers, 
  Bell, 
  FileText, 
  Settings, 
  LogOut 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'LEAD_GENERATOR'] },
    { name: 'Leads', href: '/leads', icon: Layers, roles: ['ADMIN', 'SALES', 'LEAD_GENERATOR'] },
    { name: 'Follow-Ups', href: '/follow-ups', icon: PhoneCall, roles: ['ADMIN', 'SALES'] },
    { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['ADMIN', 'SALES', 'LEAD_GENERATOR'] },
    { name: 'Broadcast Center', href: '/admin/notifications', icon: Bell, roles: ['ADMIN'] },
    { name: 'User Management', href: '/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Audit Logs', href: '/audit-logs', icon: FileText, roles: ['ADMIN'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN', 'SALES', 'LEAD_GENERATOR'] },
  ];

  const allowedMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-64 glass-card min-h-screen flex flex-col justify-between p-4 border-r border-slate-800 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-8 px-2 py-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
            S
          </div>
          <div>
            <h1 className="text-md font-bold text-white tracking-wide">Simple-IT CRM</h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Leads Studio</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {allowedMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border-l-2 border-indigo-500 shadow-md shadow-indigo-600/5'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
