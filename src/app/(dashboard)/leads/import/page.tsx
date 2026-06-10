'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../hooks/use-auth';
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText 
} from 'lucide-react';

interface ImportHistory {
  id: string;
  fileName: string;
  totalRows: number;
  successCount: number;
  failureCount: number;
  duplicateCount: number;
  status: string;
  errorReport: Array<{ row: number; companyName?: string; error: string }> | null;
  createdAt: string;
  successRate: number;
}

export default function ImportLeadsPage() {
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [historyList, setHistoryList] = useState<ImportHistory[]>([]);

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/leads/import'); // wait, do we have GET in `/api/leads/import` or `/api/import-history`? Let's check how import history is queried. Our ImportService has getImportHistory. In route handlers, we have `src/app/api/leads/import/route.ts` which has POST. Let's see if we support GET in `/api/leads/import/route.ts` or if we should add it!
      // Wait, let's view `src/app/api/leads/import/route.ts` to see what is there. It only has POST. Let's add GET to support listing history! Yes!
      const resHistory = await fetch('/api/leads/import');
      if (resHistory.ok) {
        const data = await resHistory.json();
        setHistoryList(data.items || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file.');
      return;
    }

    setImporting(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import CSV');
      }

      setResult(data);
      setFile(null);
      loadHistory();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href="/leads" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Leads List</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Import Leads</h1>
        <p className="text-sm text-slate-400">Bulk upload leads using a comma-separated CSV file.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Upload card */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center bg-slate-900/10 hover:bg-slate-900/20 hover:border-slate-700 transition-all">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-file-input"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer space-y-4 block">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {file ? file.name : 'Choose CSV file'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Limit 10MB per upload'}
                    </span>
                  </div>
                </label>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={importing || !file}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-white shadow-lg shadow-indigo-600/20 text-xs transition-all duration-300 disabled:opacity-40 flex items-center gap-2 cursor-pointer"
                >
                  {importing ? (
                    <>
                      <div className="h-3 w-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <span>Upload & Parse</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results card */}
          {result && (
            <div className="glass-card rounded-3xl p-6 space-y-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Import Execution Result: {result.status}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Total Rows</span>
                  <span className="text-2xl font-bold text-white mt-1 block">{result.totalRows}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide block">Success</span>
                  <span className="text-2xl font-bold text-emerald-400 mt-1 block">{result.successCount}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block">Duplicates</span>
                  <span className="text-2xl font-bold text-amber-400 mt-1 block">{result.duplicateCount}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide block">Failed</span>
                  <span className="text-2xl font-bold text-rose-400 mt-1 block">{result.failureCount}</span>
                </div>
              </div>

              {result.errorReport && result.errorReport.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" />
                    Row Processing Anomalies ({result.errorReport.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto border border-slate-800/80 rounded-xl divide-y divide-slate-850 bg-slate-950 p-2 text-[10px]">
                    {result.errorReport.map((rep, idx) => (
                      <div key={idx} className="p-2 flex gap-3 text-slate-400 leading-relaxed font-semibold">
                        <span className="text-rose-400">Row {rep.row}</span>
                        <span>{rep.companyName ? `[${rep.companyName}]` : ''} {rep.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Schema/Format specs */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 space-y-4 text-xs leading-relaxed">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-400" />
              CSV Format Specifications
            </h3>
            <p className="text-slate-400">Your CSV file must include a header row with the following column fields:</p>
            <ul className="space-y-2 text-slate-300 font-medium">
              <li>• <span className="font-bold text-white">companyName</span>: Company name (Required)</li>
              <li>• <span className="font-bold text-white">contactPerson</span>: Contact person (Required)</li>
              <li>• <span className="font-bold text-white">email</span>: Contact email (Unique)</li>
              <li>• <span className="font-bold text-white">phone</span>: Contact phone (Unique)</li>
              <li>• <span className="font-bold text-white">website</span>: Website URL (Unique)</li>
              <li>• <span className="font-bold text-white">designation</span>: Contact title</li>
              <li>• <span className="font-bold text-white">industry</span>: Business industry</li>
              <li>• <span className="font-bold text-white">priority</span>: LOW, MEDIUM, HIGH, URGENT</li>
              <li>• <span className="font-bold text-white">source</span>: LINKEDIN, INSTAGRAM, REFERRAL, etc.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Seeding History Table */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="text-sm font-bold text-white mb-6">Historical Import Logs</h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4 text-center">Total Rows</th>
                <th className="py-3 px-4 text-center">Success</th>
                <th className="py-3 px-4 text-center">Duplicates</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {historyList.map(h => (
                <tr key={h.id} className="hover:bg-slate-800/10">
                  <td className="py-3 px-4 font-semibold text-slate-200">{h.fileName}</td>
                  <td className="py-3 px-4 text-center">{h.totalRows}</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-semibold">{h.successCount}</td>
                  <td className="py-3 px-4 text-center text-amber-400">{h.duplicateCount}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                      h.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">{new Date(h.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {historyList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">No import records recorded in workspace.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
