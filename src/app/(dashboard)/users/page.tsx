'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import {
  Users,
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Lock
} from 'lucide-react';

interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SALES' | 'LEAD_GENERATOR';
  isActive: boolean;
  phone: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New User Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'SALES' | 'LEAD_GENERATOR'>('SALES');
  const [phone, setPhone] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      loadUsers();
    }
  }, [currentUser]);

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentActive } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    setSubmitting(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          role,
          phone: phone || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setFormSuccess(true);
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole('SALES');
      setPhone('');
      loadUsers();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-6 text-center space-y-4 max-w-md mx-auto">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Access Denied</h2>
        <p className="text-sm text-slate-400">Only administrators are authorized to access the User Management panel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">User Management</h1>
        <p className="text-sm text-slate-400 mt-1">Create accounts and toggle access status for CRM users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3 width): User list */}
        <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-800/60 bg-slate-900/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-400" />
              CRM Accounts Directory
            </h3>
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6 text-center">Role</th>
                  <th className="py-3 px-6 text-center">Active Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-white">
                      {u.firstName} {u.lastName}
                      {u.id === currentUser.id && <span className="ml-1.5 text-[9px] text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded font-bold uppercase tracking-wider">You</span>}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px]">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      {u.id === currentUser.id ? (
                        <span className="text-[10px] text-slate-500 font-bold bg-slate-800 px-2.5 py-0.5 rounded-full">Active</span>
                      ) : (
                        <button
                          onClick={() => handleToggleActive(u.id, u.isActive)}
                          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {u.isActive ? (
                            <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold">
                              <ToggleRight className="h-5 w-5" />
                              <span>Enabled</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5 text-slate-500 font-bold">
                              <ToggleLeft className="h-5 w-5" />
                              <span>Disabled</span>
                            </div>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1/3 width): Create User */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mb-2">
            <UserPlus className="h-4 w-4 text-purple-400" />
            Provision New Account
          </h3>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              Account created successfully!
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                placeholder="john.doe@crm.com"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                placeholder="••••••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                placeholder="+91 878 989 8706"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Access Level / Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white cursor-pointer"
              >
                <option value="SALES">Sales Agent</option>
                <option value="LEAD_GENERATOR">Lead Generator</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-white shadow-lg text-xs rounded-xl cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
