'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import Link from 'next/link';
import { 
  Users, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  ChevronRight,
  Shield
} from 'lucide-react';

interface Stats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  overdueFollowUps: number;
  statusDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  monthlyTrends: Array<{ month: string; created: number; won: number; lost: number }>;
}

interface SalesRepPerformance {
  userId: string;
  userName: string;
  role: string;
  leadsAssigned: number;
  leadsWon: number;
  leadsLost: number;
  conversionRate: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [leaderboard, setLeaderboard] = useState<SalesRepPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const statsRes = await fetch('/api/analytics?type=dashboard');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (user?.role === 'ADMIN') {
          const leaderboardRes = await fetch('/api/analytics?type=sales');
          if (leaderboardRes.ok) {
            const leaderboardData = await leaderboardRes.json();
            setLeaderboard(leaderboardData);
          }
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 bg-slate-900/60 rounded-3xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-900/60 rounded-3xl animate-pulse"></div>
          <div className="h-96 bg-slate-900/60 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Hi {user?.firstName}, here is a summary of your workspace activities today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/leads/new"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-white shadow-lg shadow-indigo-600/20 text-xs transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            + Create Lead
          </Link>
          {user?.role !== 'SALES' && (
            <Link
              href="/leads/import"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 font-semibold text-slate-200 text-xs transition-all duration-300"
            >
              Import CSV
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Leads */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leads</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats?.totalLeads ?? 0}</span>
          </div>
        </div>

        {/* Won Leads */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Closed Won</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats?.wonLeads ?? 0}</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              Conversion
            </span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Win Rate</span>
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats?.conversionRate ?? 0}%</span>
          </div>
        </div>

        {/* Overdue Follow-ups */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue Tasks</span>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats?.overdueFollowUps ?? 0}</span>
            {stats?.overdueFollowUps && stats.overdueFollowUps > 0 ? (
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded animate-pulse">
                Action Req
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Charts & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Conversion Trends & Status Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trends Card */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              Monthly Outreach Trends (Last 6 Months)
            </h3>
            
            {/* Visual HTML Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-4 pt-4 px-2">
              {stats?.monthlyTrends.map((t, idx) => {
                const maxVal = Math.max(...(stats?.monthlyTrends.map(m => m.created + m.won) || [10]));
                const createdHeight = maxVal > 0 ? (t.created / maxVal) * 80 : 0;
                const wonHeight = maxVal > 0 ? (t.won / maxVal) * 80 : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full flex justify-center items-end gap-1.5 h-full">
                      {/* Created Bar */}
                      <div 
                        style={{ height: `${Math.max(4, createdHeight)}%` }} 
                        className="w-3 sm:w-5 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm relative group cursor-help"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 font-bold border border-slate-800">
                          {t.created} Created
                        </div>
                      </div>
                      {/* Won Bar */}
                      <div 
                        style={{ height: `${Math.max(4, wonHeight)}%` }} 
                        className="w-3 sm:w-5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm relative group cursor-help"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 font-bold border border-slate-800">
                          {t.won} Won
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{t.month}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-4 mt-6 justify-center text-[10px] font-bold text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded bg-indigo-500"></div>
                <span>Leads Generated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded bg-emerald-500"></div>
                <span>Leads Won</span>
              </div>
            </div>
          </div>

          {/* Leaderboard for admins */}
          {user?.role === 'ADMIN' && (
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-400" />
                Sales Agent Performance Leaderboard
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">Sales Agent</th>
                      <th className="py-3 px-4 text-center">Assigned</th>
                      <th className="py-3 px-4 text-center">Won</th>
                      <th className="py-3 px-4 text-center">Lost</th>
                      <th className="py-3 px-4 text-right">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs">
                    {leaderboard.map((rep) => (
                      <tr key={rep.userId} className="hover:bg-slate-800/10">
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{rep.userName}</td>
                        <td className="py-3.5 px-4 text-center font-medium">{rep.leadsAssigned}</td>
                        <td className="py-3.5 px-4 text-center font-medium text-emerald-400">{rep.leadsWon}</td>
                        <td className="py-3.5 px-4 text-center font-medium text-rose-400">{rep.leadsLost}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-indigo-400">{rep.conversionRate}%</td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500 font-medium">No sales agent metrics recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Status Distribution & Quick Links */}
        <div className="space-y-6">
          {/* Status distribution */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              Lead Status Distribution
            </h3>
            
            <div className="space-y-4">
              {Object.entries(stats?.statusDistribution || {}).slice(0, 6).map(([status, count]) => {
                const total = stats?.totalLeads || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span className="capitalize">{status.replace('_', ' ').toLowerCase()}</span>
                      <span className="text-slate-400">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${percentage}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      ></div>
                    </div>
                  </div>
                );
              })}
              {Object.keys(stats?.statusDistribution || {}).length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6 font-medium">No leads currently in workspace.</p>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-6">Quick Links</h3>
            <div className="space-y-2">
              <Link 
                href="/leads"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/40 border border-slate-800/60 hover:border-slate-700/60 transition-all duration-300 group"
              >
                <span className="text-xs font-semibold text-slate-300">View Active Leads</span>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
              <Link 
                href="/follow-ups"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/40 border border-slate-800/60 hover:border-slate-700/60 transition-all duration-300 group"
              >
                <span className="text-xs font-semibold text-slate-300">View Calendar Tasks</span>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
