'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  RefreshCw,
  Shield,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Layers,
  ArrowRight,
  Fingerprint,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AuditEvent } from '@/lib/types';
import { useRole } from '@/components/RoleContext';
import { useToast } from '@/components/Toast';
import { AuditSkeleton } from '@/components/Skeleton';

export default function AuditPage() {
  const { workspaceId } = useRole();
  const { success, error: toastError } = useToast();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAudit = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.getWorkspaceAudit(workspaceId);
      setEvents(res);
      if (silent) success('Audit Ledger Refreshed', 'Latest timeline events loaded.');
    } catch (err: any) {
      toastError('Audit Error', err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, [workspaceId]);

  const filteredEvents = events.filter((e) => {
    if (entityFilter !== 'all' && e.entity_type !== entityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchActor = e.actor_id?.toLowerCase().includes(q);
      const matchAction = e.event_type?.toLowerCase().includes(q);
      const matchEntity = e.entity_type?.toLowerCase().includes(q);
      const matchMeta = e.metadata_json?.toLowerCase().includes(q);
      if (!matchActor && !matchAction && !matchEntity && !matchMeta) return false;
    }
    return true;
  });

  if (loading) {
    return <AuditSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-xs">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-black">
              Compliance Audit Ledger
            </h1>
            <span className="text-[10px] font-mono bg-neutral-100 border border-neutral-300 text-black font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
              <Fingerprint className="w-3 h-3 text-neutral-600" />
              <span>Immutable Chain</span>
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
            Append-only cryptographic timeline recording every content revision, automated policy scan, reviewer decision, and policy override.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => loadAudit(true)}
            className="flex items-center space-x-1.5 text-xs text-neutral-700 hover:text-black border border-neutral-300 hover:border-black bg-white px-3.5 py-2 rounded-xl transition font-semibold shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 text-neutral-500 font-mono text-[11px] font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>Scope:</span>
          </div>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-1.5 text-black font-semibold focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
          >
            <option value="all">All Audit Entities</option>
            <option value="submission">Submissions</option>
            <option value="version">Content Versions</option>
            <option value="review">Automated Reviews</option>
            <option value="decision">Reviewer Decisions</option>
            <option value="finding">Finding Overrides</option>
            <option value="rule">Brand Rules</option>
            <option value="fact">Corporate Facts</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Filter actions or actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none bg-neutral-50/50 text-black font-mono"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          <span className="text-neutral-500 font-mono text-[11px] shrink-0 font-bold bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-lg">
            {filteredEvents.length} events
          </span>
        </div>
      </div>

      {/* Audit List Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5">Entity</th>
                <th className="py-3.5 px-5">Event Action</th>
                <th className="py-3.5 px-5">Actor</th>
                <th className="py-3.5 px-5">Metadata / Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-800">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-neutral-400">
                    <Clock className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <span className="font-semibold block text-neutral-600">No audit records match the current filter</span>
                    <span className="text-[11px] text-neutral-400">Actions taken in your workspace will automatically append to this ledger.</span>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-neutral-50/80 transition duration-150">
                    <td className="py-3.5 px-5 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                      {new Date(evt.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="bg-neutral-100 border border-neutral-300 text-black px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold">
                        {evt.entity_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-black">
                      {evt.event_type}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-neutral-700 text-[11px] font-medium">
                      {evt.actor_id}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-neutral-600 max-w-sm truncate">
                      {evt.metadata_json || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}