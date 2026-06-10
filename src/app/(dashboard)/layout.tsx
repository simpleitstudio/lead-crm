'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/sidebar';
import Header from '../../components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-indigo-500/25 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-400">Loading your CRM session...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#070913]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
