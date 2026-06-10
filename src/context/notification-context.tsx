'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/use-auth';

interface NotificationAlert {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  referenceId: string | null;
  referenceType: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: NotificationAlert[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const intervalRef = useRef<any>(null);

  const fetchUnread = async () => {
    if (!user) return;
    try {
      const [listRes, countRes] = await Promise.all([
        fetch('/api/notifications?unreadOnly=true'),
        fetch('/api/notifications/count'),
      ]);

      if (listRes.ok && countRes.ok) {
        const listData = await listRes.json();
        const countData = await countRes.json();
        setNotifications(listData.items || []);
        setUnreadCount(countData.count || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const refresh = async () => {
    await fetchUnread();
  };

  useEffect(() => {
    if (user) {
      fetchUnread();
      intervalRef.current = setInterval(fetchUnread, 30000);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications?all=true', {
        method: 'PUT',
      });
      if (res.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
