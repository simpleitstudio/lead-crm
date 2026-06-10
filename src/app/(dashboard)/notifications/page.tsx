'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '../../../hooks/use-notifications';
import { Bell, Check, Trash2, Calendar, MessageSquare, AlertCircle, AlertTriangle } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications: unreadList, unreadCount, markAsRead, markAllAsRead, refresh } = useNotifications();
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const loadAllNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?unreadOnly=${showUnreadOnly}`);
      if (res.ok) {
        const data = await res.json();
        setAllNotifications(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllNotifications();
  }, [showUnreadOnly, unreadCount]);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    loadAllNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    loadAllNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LEAD_ASSIGNED': return <Bell className="h-4 w-4 text-indigo-400" />;
      case 'FOLLOWUP_DUE': return <Calendar className="h-4 w-4 text-amber-400" />;
      case 'FOLLOWUP_OVERDUE': return <AlertTriangle className="h-4 w-4 text-rose-400 animate-bounce" />;
      default: return <MessageSquare className="h-4 w-4 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-lg"></div>
        <div className="h-48 bg-slate-900/60 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-400 mt-1">Stay informed of outreach assignments and follow-up deadlines.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 font-semibold text-slate-200 text-xs transition-colors cursor-pointer"
          >
            Mark All Read
          </button>
        )}
      </div>

      {/* Filter options */}
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
        <span>Filters:</span>
        <button
          onClick={() => setShowUnreadOnly(false)}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            !showUnreadOnly 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
              : 'border-slate-800 hover:text-white hover:bg-slate-900'
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => setShowUnreadOnly(true)}
          className={`px-3 py-1.5 rounded-lg border transition-all ${
            showUnreadOnly 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
              : 'border-slate-800 hover:text-white hover:bg-slate-900'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* List */}
      <div className="glass-card rounded-3xl divide-y divide-slate-800/40 overflow-hidden">
        {allNotifications.map((n) => (
          <div 
            key={n.id} 
            className={`p-4 flex gap-4 items-start hover:bg-slate-800/10 transition-colors ${
              !n.isRead ? 'bg-indigo-500/[0.02]' : ''
            }`}
          >
            {/* Icon status */}
            <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
              {getNotificationIcon(n.type)}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start gap-4">
                <h4 className={`text-sm font-semibold text-white ${!n.isRead ? 'text-indigo-300' : ''}`}>
                  {n.title}
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">{n.message}</p>
              
              <div className="flex gap-4 items-center pt-2">
                {n.referenceId && n.referenceType === 'Lead' && (
                  <Link 
                    href={`/leads/${n.referenceId}`}
                    className="text-[10px] font-bold text-indigo-400 hover:underline"
                  >
                    Open Associated Lead Profile
                  </Link>
                )}
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="h-3 w-3" />
                    <span>Dismiss Alert</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {allNotifications.length === 0 && (
          <div className="py-16 text-center text-slate-500 font-semibold space-y-2">
            <Bell className="h-8 w-8 text-slate-700 mx-auto" />
            <p className="text-sm">Inbox is clean</p>
            <p className="text-xs text-slate-600 font-medium">No alerts currently require your attention.</p>
          </div>
        )}
      </div>
    </div>
  );
}
