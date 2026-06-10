'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../hooks/use-auth';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditLeadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [industry, setIndustry] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [existingSoftwareStack, setExistingSoftwareStack] = useState('');
  const [servicesInterestedIn, setServicesInterestedIn] = useState('');
  const [currentBusinessProblem, setCurrentBusinessProblem] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [preferredContactPlatform, setPreferredContactPlatform] = useState('');
  const [customContactPlatform, setCustomContactPlatform] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  
  const [source, setSource] = useState('OTHER');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('NEW');
  const [assignedToId, setAssignedToId] = useState('');

  // Dropdown list for Sales reps
  const [salesReps, setSalesReps] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Lead details
  useEffect(() => {
    async function loadLead() {
      try {
        const res = await fetch(`/api/leads/${id}`);
        if (!res.ok) {
          throw new Error('Failed to load lead details');
        }
        const data = await res.json();
        
        setCompanyName(data.companyName || '');
        setContactPerson(data.contactPerson || '');
        setDesignation(data.designation || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAlternatePhone(data.alternatePhone || '');
        setWebsite(data.website || '');
        setLinkedinUrl(data.linkedinUrl || '');
        setInstagramUrl(data.instagramUrl || '');
        setIndustry(data.industry || '');
        setBusinessCategory(data.businessCategory || '');
        setExistingSoftwareStack(data.existingSoftwareStack || '');
        setServicesInterestedIn(data.servicesInterestedIn || '');
        setCurrentBusinessProblem(data.currentBusinessProblem || '');
        setEstimatedBudget(data.estimatedBudget || '');
        setInternalNotes(data.internalNotes || '');
        setPreferredContactPlatform(data.preferredContactPlatform || '');
        setCustomContactPlatform(data.customContactPlatform || '');
        setCity(data.city || '');
        setState(data.state || '');
        setCountry(data.country || '');
        setSource(data.source || 'OTHER');
        setPriority(data.priority || 'MEDIUM');
        setStatus(data.status || 'NEW');
        setAssignedToId(data.assignedToId || '');
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    }

    async function loadSalesReps() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          setSalesReps(items.filter((u: any) => u.isActive && (u.role === 'SALES' || u.role === 'ADMIN')));
        }
      } catch (err) {
        console.error('Error loading users:', err);
      }
    }

    loadLead();
    loadSalesReps();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson) {
      setError('Company Name and Contact Person are required.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const payload: any = {
        companyName,
        contactPerson,
        designation: designation || null,
        email: email || null,
        phone: phone || null,
        alternatePhone: alternatePhone || null,
        website: website || null,
        linkedinUrl: linkedinUrl || null,
        instagramUrl: instagramUrl || null,
        industry: industry || null,
        businessCategory: businessCategory || null,
        existingSoftwareStack: existingSoftwareStack || null,
        servicesInterestedIn: servicesInterestedIn || null,
        currentBusinessProblem: currentBusinessProblem || null,
        estimatedBudget: estimatedBudget || null,
        internalNotes: user?.role !== 'LEAD_GENERATOR' ? (internalNotes || null) : null,
        preferredContactPlatform: preferredContactPlatform || null,
        customContactPlatform: preferredContactPlatform === 'Other' ? (customContactPlatform || null) : null,
        city: city || null,
        state: state || null,
        country: country || null,
        source,
        priority,
        status,
      };

      if (user?.role === 'ADMIN') {
        payload.assignedToId = assignedToId || null;
      }

      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update lead');
      }

      router.push(`/leads/${id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1400px] w-full mx-auto px-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded-lg"></div>
        <div className="h-10 w-48 bg-slate-800 rounded-lg"></div>
        <div className="h-96 bg-slate-900/60 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] w-full mx-auto px-4">
      <div>
        <Link href={`/leads/${id}`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Lead Detail</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Edit Lead</h1>
        <p className="text-sm text-slate-400">Modify properties of outreach lead: {companyName}</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Info */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Contact Person *
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Alternate Phone
              </label>
              <input
                type="text"
                value={alternatePhone}
                onChange={(e) => setAlternatePhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Preferred Communication Platform
              </label>
              <select
                value={preferredContactPlatform}
                onChange={(e) => setPreferredContactPlatform(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Select Platform</option>
                <option value="Phone">Phone</option>
                <option value="Email">Email</option>
                <option value="Instagram">Instagram</option>
                <option value="Twitter">Twitter</option>
                <option value="Telegram">Telegram</option>
                <option value="Discord">Discord</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {preferredContactPlatform === 'Other' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Custom Platform
                </label>
                <input
                  type="text"
                  value={customContactPlatform}
                  onChange={(e) => setCustomContactPlatform(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="e.g. Facebook, Slack, Signal"
                />
              </div>
            )}
          </div>
        </div>

        {/* Online Presence */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">Web & Social Presences</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Instagram URL
              </label>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Business details */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Industry
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Business Category
              </label>
              <input
                type="text"
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Existing Software Stack
              </label>
              <textarea
                value={existingSoftwareStack}
                onChange={(e) => setExistingSoftwareStack(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all h-20 resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Services Interested In
              </label>
              <textarea
                value={servicesInterestedIn}
                onChange={(e) => setServicesInterestedIn(e.target.value)}
                maxLength={500}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all h-20 resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Current Business Problem
              </label>
              <textarea
                value={currentBusinessProblem}
                onChange={(e) => setCurrentBusinessProblem(e.target.value)}
                maxLength={2000}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Estimated Budget
              </label>
              <input
                type="text"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="50k, 1L, 2L-5L, Unknown"
              />
            </div>
            {user?.role !== 'LEAD_GENERATOR' && (
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Internal Notes
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all h-24 resize-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Outreach Info */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">Outreach Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Lead Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
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

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
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

            {user?.role === 'ADMIN' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Assign to User (Sales/Admin)
                </label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="">Keep Unassigned</option>
                  {salesReps.map(rep => (
                    <option key={rep.id} value={rep.id}>
                      {rep.firstName} {rep.lastName} ({rep.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            href={`/leads/${id}`}
            className="px-6 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 font-semibold text-slate-300 text-xs transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-white shadow-lg shadow-indigo-600/20 text-xs transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

