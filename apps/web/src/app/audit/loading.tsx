import React from 'react';

export default function AuditLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="w-56 h-7 rounded-lg bg-slate-200/80 skeleton-shimmer" />
          <div className="w-96 h-3 rounded bg-slate-200/60 skeleton-shimmer" />
        </div>
        <div className="w-28 h-8 rounded-lg bg-slate-200/70 skeleton-shimmer" />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex justify-between">
        <div className="w-36 h-6 rounded bg-slate-50 skeleton-shimmer" />
        <div className="w-44 h-6 rounded bg-slate-50 skeleton-shimmer" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="w-full h-12 rounded-lg bg-slate-50/70 skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}
