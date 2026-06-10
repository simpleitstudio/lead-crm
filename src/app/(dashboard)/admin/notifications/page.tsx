'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Bell, Send, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('INFO');
  const [isGlobal, setIsGlobal] = useState(true);
  const [recipientId, setRecipientId] = useState('');

  // UI States
  const [users, setUsers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Redirect if not ADMIN
    if (user && user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    async function loadUsers() {
      try {
        const res = await fetch('/api/users?limit=100');
        if (res.ok) {
          const data = await res.json();
          setUsers(data.items || []);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    }

    loadUsers();
  }, [user, router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setStatusMsg({ type: 'error', text: 'Title and message are required.' });
      return;
    }

    if (!isGlobal && !recipientId) {
      setStatusMsg({ type: 'error', text: 'Please select a recipient user.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          priority,
          isGlobal,
          recipientId: isGlobal ? null : recipientId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send broadcast');
      }

      setStatusMsg({ type: 'success', text: isGlobal ? 'Broadcast sent successfully to all users!' : 'Notification sent successfully to the selected user.' });
      
      // Reset form
      setTitle('');
      setMessage('');
      setPriority('INFO');
      setRecipientId('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'An error occurred while sending.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="space-y-6 max-w-[1400px] w-full mx-auto px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="h-8 w-8 text-indigo-400" />
          Broadcast Center
        </h1>
        <p className="text-sm text-slate-400">Broadcast updates, system announcements, or targeted alerts to specific salespeople and users.</p>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl border text-xs font-semibold ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Broadcaster form */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-8 space-y-6">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Send className="h-4 w-4 text-indigo-400" />
            Compose Broadcast Notification
          </h3>

          <form onSubmit={handleSend} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Notification Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="System Maintenance Scheduled"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all font-medium"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Notification Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="We will be performing scheduled database upgrades tonight from 10 PM to 11 PM GMT. The CRM will experience intermittent availability."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all h-32 resize-none leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Priority level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer font-medium"
                >
                  <option value="INFO">Info (Blue)</option>
                  <option value="SUCCESS">Success (Green)</option>
                  <option value="WARNING">Warning (Amber)</option>
                  <option value="URGENT">Urgent (Red)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Recipients
                </label>
                <select
                  value={isGlobal ? 'all' : 'specific'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setIsGlobal(val === 'all');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer font-medium"
                >
                  <option value="all">All Registered Users (Global)</option>
                  <option value="specific">Specific Individual User</option>
                </select>
              </div>

              {!isGlobal && (
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Select Recipient User *
                  </label>
                  <select
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer font-medium"
                    required
                  >
                    <option value="">-- Select Target User --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email}) - {u.role}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-white shadow-lg shadow-indigo-600/20 text-xs transition-all duration-300 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{submitting ? 'Broadcasting...' : 'Broadcast Notification'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Information / Guidelines */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-indigo-400" />
              Broadcasting Guidelines
            </h3>
            <ul className="space-y-3.5 text-xs text-slate-400 list-disc pl-4 leading-relaxed">
              <li><strong className="text-white">Global Broadcasts</strong> will propagate a copy of this notification to <strong className="text-white">every active user</strong>, adding to their unread notification counts.</li>
              <li>Priority level tags dictate visual styling (Info=Indigo, Success=Emerald, Warning=Amber, Urgent=Rose) to help users gauge immediate significance.</li>
              <li>Every broadcast action generates system-wide <strong className="text-white">Audit Logs</strong> (logs are saved containing creator ID, action, priority, and recipients).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
