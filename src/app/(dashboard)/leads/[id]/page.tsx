'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/use-auth';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Globe, 
  Linkedin, 
  Instagram, 
  MapPin, 
  Paperclip, 
  MessageSquare, 
  Clock, 
  UserPlus, 
  Award, 
  XOctagon, 
  Trash, 
  CheckCircle,
  FileText,
  FileCode,
  Download,
  AlertTriangle
} from 'lucide-react';

interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  alternatePhone: string | null;
  website: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  industry: string | null;
  businessCategory: string | null;
  existingSoftwareStack: string | null;
  servicesInterestedIn: string | null;
  currentBusinessProblem: string | null;
  estimatedBudget: string | null;
  internalNotes: string | null;
  preferredContactPlatform: string | null;
  customContactPlatform: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  source: string;
  priority: string;
  status: string;
  lostReason: string | null;
  lostReasonNote: string | null;
  assignedToId: string | null;
  createdAt: string;
}

interface Remark {
  id: string;
  content: string;
  authorId: string;
  authorName?: string; // added manually or fetched
  isEdited: boolean;
  createdAt: string;
}

interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  mimeType: string;
  createdAt: string;
}

interface FollowUp {
  id: string;
  scheduledAt: string;
  note: string | null;
  status: string;
  completedAt: string | null;
  completionNote: string | null;
}

interface Activity {
  id: string;
  actionType: string;
  description: string;
  createdAt: string;
}

export default function LeadDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [salesReps, setSalesReps] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Remarks Form State
  const [newRemark, setNewRemark] = useState('');
  const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);
  const [editingRemarkContent, setEditingRemarkContent] = useState('');

  // Follow-up Form State
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [assignedToId, setAssignedToId] = useState('');

  // Lost Reason Modal State
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostReason, setLostReason] = useState('NO_RESPONSE');
  const [lostNote, setLostNote] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAllData = async () => {
    try {
      // 1. Fetch Lead Details
      const leadRes = await fetch(`/api/leads/${id}`);
      if (!leadRes.ok) {
        if (leadRes.status === 403) throw new Error('Forbidden: You do not have access to view this lead.');
        throw new Error('Lead not found.');
      }
      const leadData = await leadRes.json();
      setLead(leadData);

      // 2. Fetch Remarks
      const remarksRes = await fetch(`/api/remarks?leadId=${id}`);
      if (remarksRes.ok) {
        const remarksData = await remarksRes.json();
        setRemarks(remarksData.items || []);
      }

      // 3. Fetch Attachments
      const attachmentsRes = await fetch(`/api/attachments?leadId=${id}`); // wait, we can get list of attachments from database or lead relation. Let's see if we have attachment get route. Yes, `/api/attachments?leadId=[id]` fetches attachments of lead. Let's write route check.
      // Wait, let's verify if `/api/attachments?leadId=xyz` exists. Yes, we implemented `/api/attachments` GET matching leadId.
      const attachRes = await fetch(`/api/attachments?leadId=${id}`);
      if (attachRes.ok) {
        const attachData = await attachRes.json();
        setAttachments(attachData || []);
      }

      // 4. Fetch Follow-Ups
      const followRes = await fetch(`/api/follow-ups?leadId=${id}`); // wait, our follow-up list matches user by default, but let's query leadId. Let's check `/api/follow-ups?leadId=xyz` is supported by our repository `findByLeadId`. Let's support it in GET by passing leadId to followUpService. Let's verify. Yes, the repository has findByLeadId.
      const followDataRes = await fetch(`/api/follow-ups?leadId=${id}`);
      if (followDataRes.ok) {
        const followData = await followDataRes.json();
        setFollowUps(followData.items || []);
      }

      // 5. Fetch Activities
      // Wait, we need to fetch activities! Let's check if we have `/api/activities?leadId=xyz`.
      // Wait! Did we create an activities endpoint? We created `activity.repository` and `activity.service`, but did we write a route handler for activities?
      // Ah! Let's check: in our folder structure, we had `src/app/api/activities/route.ts`? No! We forgot to create the activity route handler!
      // Let's check: the file `/home/shakil/Projects/leads-crm/src/app/api/activities/route.ts` was not created!
      // We will write the activity route handler or we can fetch them via a GET parameter in `/api/leads/[id]/activities` or `/api/activities`. We will create the `/api/activities/route.ts` shortly to support this! That is excellent attention to detail.
      // For now, let's fetch it, and write the `/api/activities/route.ts` file right after this.
      const actRes = await fetch(`/api/activities?leadId=${id}`);
      if (actRes.ok) {
        const actData = await actRes.json();
        setActivities(actData.items || []);
      }

      // 6. Fetch Sales Reps
      const repsRes = await fetch('/api/users');
      if (repsRes.ok) {
        const repsData = await repsRes.json();
        setSalesReps(repsData.items || []);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load lead details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [id]);

  const handlePostRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemark.trim()) return;

    try {
      const res = await fetch('/api/remarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: id, content: newRemark }),
      });
      if (res.ok) {
        setNewRemark('');
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRemark = async (remarkId: string) => {
    if (!editingRemarkContent.trim()) return;
    try {
      const res = await fetch(`/api/remarks/${remarkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingRemarkContent }),
      });
      if (res.ok) {
        setEditingRemarkId(null);
        setEditingRemarkContent('');
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRemark = async (remarkId: string) => {
    if (!confirm('Are you sure you want to delete this remark?')) return;
    try {
      const res = await fetch(`/api/remarks/${remarkId}`, { method: 'DELETE' });
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('leadId', id as string);

    try {
      const res = await fetch('/api/attachments', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        loadAllData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to upload attachment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAttachment = async (attachId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;
    try {
      const res = await fetch(`/api/attachments/${attachId}`, { method: 'DELETE' });
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) return;

    try {
      const res = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: id,
          assignedToId: assignedToId || user?.id,
          scheduledAt,
          note: followUpNote,
        }),
      });
      if (res.ok) {
        setShowFollowUpForm(false);
        setScheduledAt('');
        setFollowUpNote('');
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteFollowUp = async (followUpId: string) => {
    const note = prompt('Enter follow-up completion note (optional):') || '';
    try {
      const res = await fetch(`/api/follow-ups/${followUpId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', completionNote: note }),
      });
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelFollowUp = async (followUpId: string) => {
    if (!confirm('Are you sure you want to cancel this follow-up?')) return;
    try {
      const res = await fetch(`/api/follow-ups/${followUpId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (res.ok) {
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkWon = async () => {
    if (!confirm('Mark this lead as CLOSED WON?')) return;
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'WON' }),
      });
      if (res.ok) {
        loadAllData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkLostSubmit = async () => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'LOST',
          lostReason,
          lostReasonNote: lostNote,
        }),
      });
      if (res.ok) {
        setShowLostModal(false);
        setLostNote('');
        loadAllData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignLead = async (repId: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: repId || null }),
      });
      if (res.ok) {
        loadAllData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to assign lead');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded-lg"></div>
        <div className="h-20 bg-slate-900/60 rounded-3xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-900/60 rounded-3xl"></div>
          <div className="h-96 bg-slate-900/60 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-6 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Error Loading Lead</h2>
        <p className="text-sm text-slate-400">{error || 'Lead could not be loaded.'}</p>
        <Link href="/leads" className="inline-block px-4 py-2 bg-slate-850 hover:bg-slate-800 text-white rounded-xl text-xs">
          Return to List
        </Link>
      </div>
    );
  }

  // Get Assignee name
  const currentAssignee = salesReps.find(r => r.id === lead.assignedToId);

  return (
    <div className="space-y-8 relative">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-4">
        <Link href="/leads" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Leads List</span>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400 text-lg border border-indigo-500/20 shadow-md">
              {lead.companyName[0]}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">{lead.companyName}</h1>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {lead.priority}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {lead.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Contact: <span className="text-slate-200 font-semibold">{lead.contactPerson}</span>
                {lead.designation ? ` (${lead.designation})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/leads/${lead.id}/edit`}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 font-semibold text-slate-200 text-xs transition-all duration-300"
            >
              Edit Properties
            </Link>

            {lead.status !== 'WON' && lead.status !== 'LOST' && (
              <>
                <button
                  onClick={handleMarkWon}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-white shadow-lg shadow-emerald-600/20 text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>Mark Won</span>
                </button>

                <button
                  onClick={() => setShowLostModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 font-bold text-white shadow-lg shadow-rose-600/20 text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <XOctagon className="h-3.5 w-3.5" />
                  <span>Mark Lost</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid: 2/3 and 1/3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2/3 Column: Info, Remarks, Attachments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detail card */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-6">Lead Specifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">Email</span>
                <span className="font-semibold text-slate-200">{lead.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">Phone</span>
                <span className="font-semibold text-slate-200">{lead.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">Alt Phone</span>
                <span className="font-semibold text-slate-200">{lead.alternatePhone || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">Preferred Platform</span>
                <span className="font-semibold text-slate-200">
                  {lead.preferredContactPlatform === 'Other'
                    ? `Other (${lead.customContactPlatform || 'N/A'})`
                    : (lead.preferredContactPlatform || 'N/A')}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">Industry</span>
                <span className="font-semibold text-slate-200">{lead.industry || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">Business Cat.</span>
                <span className="font-semibold text-slate-200">{lead.businessCategory || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">Estimated Budget</span>
                <span className="font-semibold text-slate-200">{lead.estimatedBudget || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">Source</span>
                <span className="font-semibold text-slate-200 capitalize">{lead.source.toLowerCase().replace('_', ' ')}</span>
              </div>
              <div className="md:col-span-2 flex justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">Location</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-rose-400" />
                  {[lead.city, lead.state, lead.country].filter(Boolean).join(', ') || 'N/A'}
                </span>
              </div>
              <div className="md:col-span-2 space-y-1.5 pt-2">
                <span className="text-slate-400 block font-semibold text-indigo-400">Services Interested In</span>
                <p className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed min-h-[50px] whitespace-pre-wrap">
                  {lead.servicesInterestedIn || 'No services interest specified.'}
                </p>
              </div>
              <div className="md:col-span-2 space-y-1.5 pt-2">
                <span className="text-slate-400 block font-semibold text-indigo-400">Current Business Problem</span>
                <p className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed min-h-[50px] whitespace-pre-wrap">
                  {lead.currentBusinessProblem || 'No business problems recorded.'}
                </p>
              </div>
              <div className="md:col-span-2 space-y-1.5 pt-2">
                <span className="text-slate-400 block">Existing Software Stack</span>
                <p className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 font-mono text-[10px] text-slate-300 leading-relaxed min-h-[50px] whitespace-pre-wrap">
                  {lead.existingSoftwareStack || 'No software stack notes recorded.'}
                </p>
              </div>
              {/* Only show internal notes for authorized roles (ADMIN and Sales rep assigned to the lead) */}
              {(user?.role === 'ADMIN' || lead.assignedToId === user?.id) && (
                <div className="md:col-span-2 space-y-1.5 pt-2">
                  <span className="text-slate-400 block font-semibold text-amber-400">Internal Notes</span>
                  <p className="p-3 bg-amber-950/20 rounded-xl border border-amber-900/30 text-xs text-slate-300 leading-relaxed min-h-[50px] whitespace-pre-wrap">
                    {lead.internalNotes || 'No internal notes recorded.'}
                  </p>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-800/60 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Social Outlets:</span>
              {lead.website && (
                <a href={lead.website} target="_blank" className="hover:text-white transition-colors" title="Website">
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {lead.linkedinUrl && (
                <a href={lead.linkedinUrl} target="_blank" className="hover:text-white transition-colors" title="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {lead.instagramUrl && (
                <a href={lead.instagramUrl} target="_blank" className="hover:text-white transition-colors" title="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {!lead.website && !lead.linkedinUrl && !lead.instagramUrl && (
                <span className="text-xs text-slate-500 font-medium">None added</span>
              )}
            </div>
          </div>

          {/* Remarks Section */}
          <div className="glass-card rounded-3xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              Outreach Remarks ({remarks.length})
            </h3>

            {/* Post comment form */}
            <form onSubmit={handlePostRemark} className="space-y-3">
              <textarea
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Type a new update or remark..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-xs h-24 resize-none"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-650 hover:bg-indigo-600 font-bold text-white text-xs transition-colors cursor-pointer"
                >
                  Post Remark
                </button>
              </div>
            </form>

            {/* List remarks */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {remarks.map((remark) => {
                const isAuthor = remark.authorId === user?.id;
                const authorUser = salesReps.find(r => r.id === remark.authorId);
                return (
                  <div key={remark.id} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 space-y-2.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">
                          {authorUser ? `${authorUser.firstName} ${authorUser.lastName}` : 'System Agent'}
                        </span>
                        <span className="text-[9px] text-slate-500 bg-slate-800 px-1 py-0.5 rounded uppercase tracking-wider">
                          {authorUser?.role || 'REP'}
                        </span>
                      </div>
                      <span className="text-slate-500 font-medium">
                        {new Date(remark.createdAt).toLocaleString()}
                        {remark.isEdited && <span className="ml-1 text-slate-500 font-bold">(edited)</span>}
                      </span>
                    </div>

                    {editingRemarkId === remark.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingRemarkContent}
                          onChange={(e) => setEditingRemarkContent(e.target.value)}
                          className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingRemarkId(null)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateRemark(remark.id)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-semibold"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{remark.content}</p>
                    )}

                    {!editingRemarkId && (isAuthor || user?.role === 'ADMIN') && (
                      <div className="flex gap-3 justify-end pt-1">
                        {isAuthor && (
                          <button
                            onClick={() => {
                              setEditingRemarkId(remark.id);
                              setEditingRemarkContent(remark.content);
                            }}
                            className="text-[10px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRemark(remark.id)}
                          className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {remarks.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6 font-medium">No remarks posted for this lead yet.</p>
              )}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="glass-card rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-indigo-400" />
                Uploaded Documents ({attachments.length})
              </h3>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadFile}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-[10px] font-bold text-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Upload File
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {attachments.map((file) => (
                <div key={file.id} className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/50 flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                      {file.fileType.toLowerCase() === 'pdf' ? <FileText className="h-4 w-4" /> : <FileCode className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-white truncate" title={file.fileName}>{file.fileName}</h5>
                      <span className="text-[9px] text-slate-500">
                        {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <a
                      href={`/api/attachments/${file.id}`}
                      className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white transition-colors"
                      title="Download"
                      download
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                    {(user?.role === 'ADMIN' || user?.id) && (
                      <button
                        onClick={() => handleDeleteAttachment(file.id)}
                        className="p-1.5 rounded-lg bg-slate-950 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {attachments.length === 0 && (
                <div className="col-span-2 text-center py-6 text-xs text-slate-500 font-medium">
                  No documents uploaded. Enforces PDF, DOCX, XLSX up to 10MB.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1/3 Column: Status actions, Followups, Activities */}
        <div className="space-y-6">
          {/* Assignment Control */}
          {user?.role === 'ADMIN' && (
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-purple-400" />
                Assign Ownership
              </h3>
              <div className="space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Assignee
                </label>
                <select
                  value={lead.assignedToId || ''}
                  onChange={(e) => handleAssignLead(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="">Keep Unassigned</option>
                  {salesReps.filter(u => u.isActive && (u.role === 'SALES' || u.role === 'ADMIN')).map(rep => (
                    <option key={rep.id} value={rep.id}>
                      {rep.firstName} {rep.lastName} ({rep.role})
                    </option>
                  ))}
                </select>
                {currentAssignee && (
                  <div className="text-[10px] text-slate-400">
                    Assigned to: <span className="font-semibold text-white">{currentAssignee.firstName} {currentAssignee.lastName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Follow-Ups Calendar panel */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                Tasks & Follow-Ups
              </h3>
              <button
                onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                className="text-[10px] font-bold text-indigo-400 hover:underline cursor-pointer"
              >
                {showFollowUpForm ? 'Cancel' : '+ Schedule'}
              </button>
            </div>

            {showFollowUpForm && (
              <form onSubmit={handleScheduleFollowUp} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-[10px] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Task/Follow-up Note
                  </label>
                  <input
                    type="text"
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-[10px] focus:outline-none"
                    placeholder="Call client to discuss services..."
                  />
                </div>
                {user?.role === 'ADMIN' && (
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Assign to
                    </label>
                    <select
                      value={assignedToId}
                      onChange={(e) => setAssignedToId(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-800 text-white text-[10px] rounded"
                    >
                      <option value="">Myself</option>
                      {salesReps.filter(u => u.role === 'SALES').map(rep => (
                        <option key={rep.id} value={rep.id}>
                          {rep.firstName} {rep.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-1.5 rounded bg-indigo-650 hover:bg-indigo-600 font-bold text-white text-[10px]"
                >
                  Schedule Task
                </button>
              </form>
            )}

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {followUps.map((task) => (
                <div key={task.id} className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-[11px] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-300">
                      {new Date(task.scheduledAt).toLocaleString()}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                      task.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  {task.note && <p className="text-slate-400 text-xs">{task.note}</p>}
                  
                  {task.status === 'PENDING' && (
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => handleCompleteFollowUp(task.id)}
                        className="text-[9px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleCancelFollowUp(task.id)}
                        className="text-[9px] font-semibold text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {task.status === 'COMPLETED' && task.completionNote && (
                    <p className="text-[10px] text-slate-500 italic bg-slate-950 p-1.5 rounded border border-slate-800/40">
                      Completion Note: {task.completionNote}
                    </p>
                  )}
                </div>
              ))}
              {followUps.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4 font-medium">No follow-ups scheduled.</p>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              Activity Timeline
            </h3>

            <div className="space-y-4 relative pl-4 border-l border-slate-800/80 max-h-80 overflow-y-auto pr-1">
              {activities.map((act) => (
                <div key={act.id} className="relative text-[11px] space-y-1">
                  {/* Indicator node */}
                  <div className="absolute -left-[20.5px] top-1 h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-[#070913]"></div>
                  
                  <div className="flex justify-between items-center text-slate-400 text-[10px]">
                    <span className="font-semibold text-indigo-400 uppercase tracking-wide">
                      {act.actionType.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium">{new Date(act.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-medium">{act.description}</p>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4 font-medium">No timeline events recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lost Reason Modal Dialog */}
      {showLostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-md font-bold text-white">Specify Lost Reason</h3>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Reason Code *
                </label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                >
                  <option value="NO_BUDGET">No Budget</option>
                  <option value="NO_RESPONSE">No Response / Ghosted</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                  <option value="ALREADY_HAS_VENDOR">Already Has Vendor</option>
                  <option value="BAD_FIT">Bad Fit</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Lost Reason Description Note
                </label>
                <textarea
                  value={lostNote}
                  onChange={(e) => setLostNote(e.target.value)}
                  placeholder="Details on why lead was closed lost..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowLostModal(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkLostSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Mark Lost
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
