import React from 'react';

export default function KnowledgeLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="w-56 h-7 rounded-lg bg-slate-200/80 skeleton-shimmer" />
          <div className="w-80 h-3 rounded bg-slate-200/60 skeleton-shimmer" />
        </div>
        <div className="w-32 h-8 rounded-lg bg-slate-200/70 skeleton-shimmer" />
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-36 h-9 rounded-lg bg-slate-100 skeleton-shimmer" />
          <div className="w-36 h-9 rounded-lg bg-slate-100 skeleton-shimmer" />
        </div>
        <div className="w-full sm:w-64 h-8 rounded-lg bg-slate-100 skeleton-shimmer" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-3">
        <div className="w-full h-8 rounded bg-slate-50 skeleton-shimmer" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-full h-14 rounded-lg bg-slate-50/70 skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}
