import React from 'react';

export default function NewSubmissionLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <div className="w-64 h-7 rounded-lg bg-slate-200/80 skeleton-shimmer" />
        <div className="w-96 h-3 rounded bg-slate-200/60 skeleton-shimmer" />
      </div>

      {/* Banner */}
      <div className="h-16 rounded-xl bg-slate-900/80 skeleton-shimmer" />

      {/* Form Card Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-5">
        <div className="space-y-2">
          <div className="w-24 h-3 rounded bg-slate-100 skeleton-shimmer" />
          <div className="w-full h-10 rounded-lg bg-slate-50 skeleton-shimmer" />
        </div>
        <div className="space-y-2">
          <div className="w-28 h-3 rounded bg-slate-100 skeleton-shimmer" />
          <div className="w-full h-10 rounded-lg bg-slate-50 skeleton-shimmer" />
        </div>
        <div className="space-y-2">
          <div className="w-32 h-3 rounded bg-slate-100 skeleton-shimmer" />
          <div className="w-full h-44 rounded-lg bg-slate-50 skeleton-shimmer" />
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <div className="w-32 h-3 rounded bg-slate-100 skeleton-shimmer" />
          <div className="w-40 h-9 rounded-lg bg-slate-200 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
