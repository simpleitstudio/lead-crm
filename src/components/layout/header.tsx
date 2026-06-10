'use client';

import React from 'react';
import Link from 'next/link';
import { useNotifications } from '../../hooks/use-notifications';
import { Bell, Menu } from 'lucide-react';

export default function Header() {
  const { unreadCount, notifications, markAsRead } = useNotifications();

  return (
    <header className="h-16 border-b border-slate-800/60 flex items-center justify-between px-6 bg-slate-950/20 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Toggle Menu Placeholder (mobile) */}
        <button className="md:hidden p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white">
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-slate-400">Simple-IT Studio CRM Workspace</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative group">
          <Link href="/notifications" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 block relative transition-colors duration-300">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-indigo-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </Link>
          
          {/* Quick Notification Dropdown (Hover reveal) */}
          {notifications.length > 0 && (
            <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl overflow-hidden opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 origin-top-right z-50">
              <div className="p-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/40">
                <span className="text-xs font-bold text-white">Recent Notifications</span>
                <Link href="/notifications" className="text-[10px] text-indigo-400 hover:underline">View all</Link>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/40">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-slate-800/20 transition-colors duration-200">
                    <h5 className="text-xs font-semibold text-white mb-0.5">{n.title}</h5>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-2">{n.message}</p>
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-[9px] text-indigo-400 font-semibold hover:underline"
                    >
                      Mark as read
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
