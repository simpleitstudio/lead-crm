'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/use-auth';
import { useDebounce } from '../../../../hooks/use-debounce';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface DuplicateMatch {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string | null;
}

export default function NewLeadPage() {
  const { user } = useAuth();
  const router = useRouter();

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
  const [source, setSource] = useState('MANUAL_RESEARCH');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignedToId, setAssignedToId] = useState('');

  // Dropdown list for Sales reps
  const [salesReps, setSalesReps] = useState<any[]>([]);

  // Duplicate checks state
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const debouncedEmail = useDebounce(email, 500);
  const debouncedPhone = useDebounce(phone, 500);
  const debouncedWebsite = useDebounce(website, 500);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sales reps for assigning
  useEffect(() => {
    async function loadSalesReps() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          // Filter to show active sales/admin accounts
          const items = data.items || [];
          setSalesReps(items.filter((u: any) => u.isActive && (u.role === 'SALES' || u.role === 'ADMIN')));
        }
      } catch (err) {
        console.error('Error loading users:', err);
      }
    }
    if (user?.role === 'ADMIN') {
      loadSalesReps();
    }
  }, [user]);

  // Run duplicate check on input change
  useEffect(() => {
    async function checkDuplicates() {
      if (!debouncedEmail && !debouncedPhone && !debouncedWebsite) {
        setDuplicates([]);
        return;
      }
      try {
        const queryParams = new URLSearchParams();
        if (debouncedEmail) queryParams.append('email', debouncedEmail);
        if (debouncedPhone) queryParams.append('phone', debouncedPhone);
        if (debouncedWebsite) queryParams.append('website', debouncedWebsite);

        const res = await fetch(`/api/leads/duplicate-check?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setDuplicates(data.matches || []);
        }
      } catch (err) {
        console.error('Error checking duplicates:', err);
      }
    }
    checkDuplicates();
  }, [debouncedEmail, debouncedPhone, debouncedWebsite]);

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
        designation: designation || undefined,
        email: email || undefined,
        phone: phone || undefined,
        alternatePhone: alternatePhone || undefined,
        website: website || undefined,
        linkedinUrl: linkedinUrl || undefined,
        instagramUrl: instagramUrl || undefined,
        industry: industry || undefined,
        businessCategory: businessCategory || undefined,
        existingSoftwareStack: existingSoftwareStack || undefined,
        servicesInterestedIn: servicesInterestedIn || undefined,
        currentBusinessProblem: currentBusinessProblem || undefined,
        estimatedBudget: estimatedBudget || undefined,
        internalNotes: user?.role !== 'LEAD_GENERATOR' ? (internalNotes || undefined) : undefined,
        preferredContactPlatform: preferredContactPlatform || undefined,
        customContactPlatform: preferredContactPlatform === 'Other' ? (customContactPlatform || undefined) : undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        source,
        priority,
      };

      if (user?.role === 'ADMIN' && assignedToId) {
        payload.assignedToId = assignedToId;
      }

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create lead');
      }

      router.push(`/leads/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] w-full mx-auto px-4">
      {/* Back button */}
      <div>
        <Link href="/leads" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Leads List</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Lead</h1>
        <p className="text-sm text-slate-400">Add a manually researched lead to the CRM database.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Duplicate warning box */}
      {duplicates.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium flex gap-3 items-start animate-pulse">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <span className="font-bold">Duplicate Warning:</span> Leads already exist in the database with matching parameters:
            <ul className="list-disc pl-4 mt-2 space-y-1">
              {duplicates.map(d => (
                <li key={d.id}>
                  <Link href={`/leads/${d.id}`} className="underline hover:text-white" target="_blank">
                    {d.companyName} ({d.contactPerson}) - {d.email || 'No Email'}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Contact Details */}
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
                placeholder="Simple-it Studio"
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
                placeholder="Shakil Ahmad"
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
                placeholder="CEO"
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
                placeholder="learnershakil@gmail.com"
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
                placeholder="+91 97093 58602"
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
                placeholder="+91 878 989 8706"
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

        {/* Section 2: Online Presence */}
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
                placeholder="https://simpleitstudio.com"
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
                placeholder="https://linkedin.com/company/simpleitstudio"
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
                placeholder="https://instagram.com/simpleitstudio"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Business Details & Pain Points */}
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
                placeholder="Technology"
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
                placeholder="SaaS / Search Engine"
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
                placeholder="React, Next.js, GCP, Salesforce..."
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
                placeholder="Website Development, Mobile App, AI Automation, AI Chatbot, CRM Development..."
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
                placeholder="Still taking orders manually. No customer management. No online presence. No automation..."
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
                  placeholder="Owner prefers WhatsApp. Call after 7 PM. Seems interested in SaaS..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Location */}
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
                placeholder="New Delhi"
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
                placeholder="Delhi"
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
                placeholder="India"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Meta & Lead settings */}
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

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/leads"
            className="px-6 py-3 rounded-xl border border-slate-800 hover:bg-slate-900 font-semibold text-slate-300 text-xs transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-white shadow-lg shadow-indigo-600/20 text-xs transition-all duration-300 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? 'Creating...' : 'Create Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}

