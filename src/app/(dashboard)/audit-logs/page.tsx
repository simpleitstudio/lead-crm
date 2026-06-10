'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { 
  FileText, 
  ShieldAlert, 
  Search, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string | null;
  userName: string;
  userRole: string;
  ipAddress: string | null;
  userAgent: string | null;
  actionType: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  previousValue: any;
  newValue: any;
}

export default function AuditLogsPage() {
  const { user } = useAuth();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [actionType, setActionType] = useState('');
  const [entityType, setEntityType] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal details
  const [activeLog, setActiveLog] = useState<AuditLog | null>(null);

  const loadLogs = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (actionType) queryParams.append('actionType', actionType);
      if (entityType) queryParams.append('entityType', entityType);

      const res = await fetch(`/api/audit-logs?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.items || []);
        setTotal(data.totalCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadLogs();
    }
  }, [user, page, actionType, entityType]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [actionType, entityType]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-6 text-center space-y-4 max-w-md mx-auto">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Access Denied</h2>
        <p className="text-sm text-slate-400">Only administrators are authorized to access the Audit Logging interface.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">System Audit Logs</h1>
        <p className="text-sm text-slate-400 mt-1">Monitor administrator and user database changes for security compliance.</p>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-3xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Action Type
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none"
            >
              <option value="">All Actions</option>
              <option value="LOGIN_SUCCESS">Login Success</option>
              <option value="LOGIN_FAILED">Login Failed</option>
              <option value="LOGOUT">Logout</option>
              <option value="LEAD_CREATED">Lead Created</option>
              <option value="LEAD_UPDATED">Lead Updated</option>
              <option value="LEAD_DELETED">Lead Deleted</option>
              <option value="IMPORT_COMPLETED">Import Completed</option>
              <option value="EXPORT_GENERATED">Export Generated</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Entity Type
            </label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none"
            >
              <option value="">All Entities</option>
              <option value="User">User</option>
              <option value="Lead">Lead</option>
              <option value="Remark">Remark</option>
              <option value="Attachment">Attachment</option>
              <option value="FollowUp">FollowUp</option>
              <option value="ImportHistory">ImportHistory</option>
              <option value="ExportHistory">ExportHistory</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/10">
                <th className="py-3 px-6">User</th>
                <th className="py-3 px-6">Action</th>
                <th className="py-3 px-6">Target</th>
                <th className="py-3 px-6">IP Address</th>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/10 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="font-semibold text-slate-200">{log.userName}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{log.userRole}</div>
                  </td>
                  <td className="py-3.5 px-6 font-mono text-[10px] text-indigo-400 font-bold">
                    {log.actionType.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-6 text-slate-400 font-medium">
                    {log.entityType} {log.entityId ? `(${log.entityId.slice(0, 8)})` : ''}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-[10px] text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                  <td className="py-3.5 px-6 text-slate-500 font-medium">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => setActiveLog(log)}
                      className="text-[10px] font-bold text-indigo-400 hover:underline cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 font-semibold">
                    No audit logs matching selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-800/60 flex items-center justify-between bg-slate-900/10">
          <span className="text-[10px] font-semibold text-slate-400">
            Page {page} of {totalPages} ({total} entries total)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Modal Inspector */}
      {activeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass-card rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-400" />
                Change Inspector
              </h3>
              <button
                onClick={() => setActiveLog(null)}
                className="text-[10px] font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <span className="text-slate-500 block uppercase text-[9px] tracking-wider mb-0.5">Executor</span>
                <span className="text-slate-200">{activeLog.userName} ({activeLog.userRole})</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[9px] tracking-wider mb-0.5">Timestamp</span>
                <span className="text-slate-200">{new Date(activeLog.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[9px] tracking-wider mb-0.5">Action Code</span>
                <span className="text-indigo-400 font-mono">{activeLog.actionType}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[9px] tracking-wider mb-0.5">User Agent</span>
                <span className="text-slate-300 font-medium truncate block max-w-xs" title={activeLog.userAgent || 'N/A'}>
                  {activeLog.userAgent || 'N/A'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold mb-1">Previous Values</span>
                <pre className="p-3 bg-slate-950 border border-slate-850 rounded-xl font-mono text-[9px] text-slate-400 overflow-auto h-60 leading-normal">
                  {activeLog.previousValue 
                    ? JSON.stringify(activeLog.previousValue, null, 2) 
                    : '// No prior values recorded'}
                </pre>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold mb-1">New Values</span>
                <pre className="p-3 bg-slate-950 border border-slate-850 rounded-xl font-mono text-[9px] text-slate-200 overflow-auto h-60 leading-normal">
                  {activeLog.newValue 
                    ? JSON.stringify(activeLog.newValue, null, 2) 
                    : '// No modified values recorded'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
