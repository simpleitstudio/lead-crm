'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../hooks/use-auth';
import { 
  PhoneCall, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

interface FollowUp {
  id: string;
  leadId: string;
  leadCompanyName?: string; // mapped manually or via join
  scheduledAt: string;
  note: string | null;
  status: string;
  completedAt: string | null;
  completionNote: string | null;
}

export default function FollowUpsPage() {
  const { user } = useAuth();
  
  const [pendingTasks, setPendingTasks] = useState<FollowUp[]>([]);
  const [completedTasks, setCompletedTasks] = useState<FollowUp[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<FollowUp[]>([]);
  
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'overdue'>('pending');
  const [loading, setLoading] = useState(true);
  const [leadsMap, setLeadsMap] = useState<Record<string, string>>({});

  const loadFollowUps = async () => {
    try {
      // Fetch followups for current user
      const res = await fetch(`/api/follow-ups?userId=${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        const items: FollowUp[] = data.items || [];
        
        const now = new Date();
        const pending = items.filter(t => t.status === 'PENDING' && new Date(t.scheduledAt) >= now);
        const overdue = items.filter(t => t.status === 'PENDING' && new Date(t.scheduledAt) < now);
        const completed = items.filter(t => t.status !== 'PENDING');
        
        setPendingTasks(pending);
        setOverdueTasks(overdue);
        setCompletedTasks(completed);

        // Fetch lead names to display companyName in UI
        const leadsRes = await fetch('/api/leads?limit=100');
        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          const map: Record<string, string> = {};
          (leadsData.items || []).forEach((l: any) => {
            map[l.id] = l.companyName;
          });
          setLeadsMap(map);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadFollowUps();
    }
  }, [user]);

  const handleComplete = async (id: string) => {
    const note = prompt('Enter task completion details note:') || '';
    try {
      const res = await fetch(`/api/follow-ups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', completionNote: note }),
      });
      if (res.ok) {
        loadFollowUps();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled outreach?')) return;
    try {
      const res = await fetch(`/api/follow-ups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (res.ok) {
        loadFollowUps();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-lg"></div>
        <div className="h-12 bg-slate-900/60 rounded-xl"></div>
        <div className="h-64 bg-slate-900/60 rounded-3xl"></div>
      </div>
    );
  }

  const getActiveList = () => {
    if (activeTab === 'overdue') return overdueTasks;
    if (activeTab === 'completed') return completedTasks;
    return pendingTasks;
  };

  const activeList = getActiveList();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Outreach Schedule</h1>
        <p className="text-sm text-slate-400 mt-1">Track scheduled calls, follow-ups, and demo tasks.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Upcoming Tasks ({pendingTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'overdue'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Overdue Alerts ({overdueTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-slate-800 text-slate-200 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          History Log ({completedTasks.length})
        </button>
      </div>

      {/* Task List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeList.map((task) => (
          <div 
            key={task.id} 
            className={`glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[180px] border ${
              activeTab === 'overdue' ? 'border-rose-500/10 hover:border-rose-500/30' : ''
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {new Date(task.scheduledAt).toLocaleString()}
                  </span>
                </div>
                {activeTab === 'overdue' && (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase animate-pulse">
                    Overdue
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <PhoneCall className="h-4 w-4 text-indigo-400" />
                  {leadsMap[task.leadId] || 'Unnamed Lead'}
                </h4>
                <p className="text-xs text-slate-400 mt-2 min-h-[40px] leading-relaxed">
                  {task.note || 'No description note added for this follow-up task.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/40 flex items-center justify-between mt-4">
              <Link
                href={`/leads/${task.leadId}`}
                className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Open Lead Profile</span>
                <ExternalLink className="h-3 w-3" />
              </Link>

              {task.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleComplete(task.id)}
                    className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-500/10 cursor-pointer"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleCancel(task.id)}
                    className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-rose-500/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {task.status === 'COMPLETED' && (
                <span className="text-[9px] text-slate-500 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  Done
                </span>
              )}

              {task.status === 'CANCELLED' && (
                <span className="text-[9px] text-slate-500 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-slate-500" />
                  Cancelled
                </span>
              )}
            </div>
          </div>
        ))}

        {activeList.length === 0 && (
          <div className="col-span-full py-16 text-center glass-card rounded-3xl space-y-3">
            <AlertTriangle className="h-8 w-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-400">No scheduled tasks</h4>
            <p className="text-xs text-slate-500">There are no follow-up tasks in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
