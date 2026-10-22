'use client';

import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Shield, User, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { AuditEvent } from '@/lib/types';
import { useRole } from '@/components/RoleContext';
import { useToast } from '@/components/Toast';

export default function AuditPage() {
  const { workspaceId } = useRole();
  const { success, error: toastError } = useToast();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('all');

  const loadAudit = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.getWorkspaceAudit(workspaceId);
      setEvents(res);
      if (silent) success('Audit Log Refreshed', 'Latest timeline events loaded.');
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
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="h-14 bg-white rounded-xl border border-slate-200/80 skeleton-shimmer" />
        <div className="h-96 bg-white rounded-2xl border border-slate-200/80 skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#191919]">Compliance Audit Log</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable, append-only chronological log of all revisions, automated scans, reviewer sign-offs, and policy overrides.
          </p>
        </div>
        <button
          onClick={() => loadAudit(true)}
          className="flex items-center space-x-1.5 bg-white hover:bg-[#FFFFF0] border border-[#E8E8DC] text-[#191919] text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">Filter Entity:</span>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Entities</option>
            <option value="submission">Submissions</option>
            <option value="version">Versions</option>
            <option value="review">Reviews</option>
            <option value="decision">Review Decisions</option>
            <option value="finding">Finding Overrides</option>
            <option value="rule">Brand Rules</option>
            <option value="fact">Approved Facts</option>
          </select>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          {filteredEvents.length} recorded events
        </span>
      </div>

      {/* Audit List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/60 text-slate-400 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Entity</th>
                <th className="py-3 px-6">Action / Event</th>
                <th className="py-3 px-6">Actor ID</th>
                <th className="py-3 px-6">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition duration-150">
                    <td className="py-3.5 px-6 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(evt.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold">
                        {evt.entity_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {evt.event_type}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-700 text-[11px] font-medium">
                      {evt.actor_id}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-[11px] text-slate-500 max-w-md truncate">
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
