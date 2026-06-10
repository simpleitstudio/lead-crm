'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../hooks/use-auth';
import { useDebounce } from '../../../hooks/use-debounce';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit2, 
  Trash2,
  Download,
  Upload
} from 'lucide-react';

interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  priority: string;
  status: string;
  assignedToId: string | null;
  createdAt: string;
}

export default function LeadsPage() {
  const { user } = useAuth();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [source, setSource] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    async function loadLeads() {
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (debouncedSearch) queryParams.append('search', debouncedSearch);
        if (status) queryParams.append('status', status);
        if (priority) queryParams.append('priority', priority);
        if (source) queryParams.append('source', source);

        const res = await fetch(`/api/leads?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setLeads(data.items || []);
          setTotal(data.totalCount || 0);
        }
      } catch (err) {
        console.error('Error loading leads:', err);
      }
    }
    loadLeads();
  }, [page, limit, debouncedSearch, status, priority, source]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, priority, source]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== id));
        setTotal(prev => Math.max(0, prev - 1));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete lead');
      }
    } catch (err) {
      alert('An error occurred');
    }
  };

  const getPriorityBadgeColor = (p: string) => {
    switch (p) {
      case 'URGENT': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'HIGH': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'MEDIUM': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getStatusBadgeColor = (s: string) => {
    switch (s) {
      case 'WON': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'LOST': return 'bg-slate-600/10 text-slate-400 border border-slate-600/20';
      case 'NEW': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'ASSIGNED': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'CONTACTED': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'INTERESTED': return 'bg-pink-500/10 text-pink-400 border border-pink-500/20';
      case 'FOLLOW_UP_REQUIRED': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      default: return 'bg-rose-600/10 text-rose-400 border border-rose-600/20'; // INVALID
    }
  };

  const handleExport = () => {
    const queryParams = new URLSearchParams();
    if (debouncedSearch) queryParams.append('search', debouncedSearch);
    if (status) queryParams.append('status', status);
    if (priority) queryParams.append('priority', priority);
    if (source) queryParams.append('source', source);

    window.open(`/api/leads/export?${queryParams.toString()}`, '_blank');
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Leads</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and track your agency leads pipelines.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {user?.role !== 'LEAD_GENERATOR' && (
            <button
              onClick={handleExport}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 font-semibold text-slate-200 text-xs transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          )}
          {user?.role !== 'SALES' && (
            <Link
              href="/leads/import"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 font-semibold text-slate-200 text-xs transition-all duration-300 flex items-center gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import Leads</span>
            </Link>
          )}
          <Link
            href="/leads/new"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-white shadow-lg shadow-indigo-600/20 text-xs transition-all duration-300 flex items-center gap-1.5"
          >
            <span>+ Create Lead</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-card rounded-3xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company, contact..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all duration-300 text-xs"
            />
          </div>

          {/* Status selector */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition-all duration-300 text-xs appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="CONTACTED">Contacted</option>
              <option value="INTERESTED">Interested</option>
              <option value="FOLLOW_UP_REQUIRED">Follow up Required</option>
              <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
              <option value="DEMO_SCHEDULED">Demo Scheduled</option>
              <option value="PROPOSAL_SENT">Proposal Sent</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="WON">Closed Won</option>
              <option value="LOST">Closed Lost</option>
              <option value="INVALID">Invalid</option>
            </select>
          </div>

          {/* Priority selector */}
          <div className="relative">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition-all duration-300 text-xs appearance-none cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Source selector */}
          <div className="relative">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition-all duration-300 text-xs appearance-none cursor-pointer"
            >
              <option value="">All Sources</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="GOOGLE_MAPS">Google Maps</option>
              <option value="AMAZON">Amazon</option>
              <option value="FLIPKART">Flipkart</option>
              <option value="REFERRAL">Referral</option>
              <option value="WEBSITE_FORM">Website Form</option>
              <option value="MANUAL_RESEARCH">Manual Research</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/10">
                <th className="py-4 px-6">Company</th>
                <th className="py-4 px-6">Contact Person</th>
                <th className="py-4 px-6 text-center">Source</th>
                <th className="py-4 px-6 text-center">Priority</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-800/10 transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">
                    <Link href={`/leads/${lead.id}`} className="hover:underline hover:text-indigo-400">
                      {lead.companyName}
                    </Link>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-semibold text-slate-200">{lead.contactPerson}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{lead.designation || 'No designation'}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center text-slate-400 font-medium">
                    {lead.source.replace('_', ' ')}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityBadgeColor(lead.priority)}`}>
                      {lead.priority}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeColor(lead.status)}`}>
                      {lead.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/leads/${lead.id}/edit`}
                        className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                        title="Edit Lead"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-rose-400 hover:text-rose-300 hover:border-rose-500/20 transition-colors cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 font-semibold">
                    No leads found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 border-t border-slate-800/60 flex items-center justify-between bg-slate-900/10">
          <span className="text-xs text-slate-400">
            Showing Page <span className="font-semibold text-slate-200">{page}</span> of{' '}
            <span className="font-semibold text-slate-200">{totalPages}</span> ({total} leads total)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
