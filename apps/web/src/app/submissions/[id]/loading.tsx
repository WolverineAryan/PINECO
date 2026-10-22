import React from 'react';

export default function SubmissionDetailLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <div className="w-28 h-4 rounded bg-slate-200/80 skeleton-shimmer" />
        <div className="flex space-x-2">
          <div className="w-28 h-8 rounded-lg bg-slate-200/60 skeleton-shimmer" />
          <div className="w-36 h-8 rounded-lg bg-slate-200/80 skeleton-shimmer" />
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-16 h-5 rounded bg-slate-100 skeleton-shimmer" />
          <div className="w-20 h-5 rounded bg-slate-100 skeleton-shimmer" />
          <div className="w-28 h-5 rounded bg-slate-100 skeleton-shimmer" />
        </div>
        <div className="w-2/3 h-7 rounded-lg bg-slate-100 skeleton-shimmer" />
        <div className="w-1/3 h-3 rounded bg-slate-100/70 skeleton-shimmer" />
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-3">
        <div className="w-36 h-8 rounded-lg bg-slate-100 skeleton-shimmer" />
        <div className="w-48 h-8 rounded-lg bg-slate-100 skeleton-shimmer" />
        <div className="w-32 h-8 rounded-lg bg-slate-100 skeleton-shimmer" />
      </div>

      {/* Findings Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex justify-between">
        <div className="flex space-x-3">
          <div className="w-28 h-6 rounded bg-slate-50 skeleton-shimmer" />
          <div className="w-28 h-6 rounded bg-slate-50 skeleton-shimmer" />
          <div className="w-28 h-6 rounded bg-slate-50 skeleton-shimmer" />
        </div>
        <div className="w-32 h-6 rounded bg-slate-50 skeleton-shimmer" />
      </div>

      {/* Finding Card Skeletons */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-3">
            <div className="flex justify-between">
              <div className="flex space-x-2">
                <div className="w-20 h-4 rounded bg-slate-100 skeleton-shimmer" />
                <div className="w-24 h-4 rounded bg-slate-100 skeleton-shimmer" />
              </div>
              <div className="w-32 h-5 rounded-full bg-slate-100 skeleton-shimmer" />
            </div>
            <div className="w-full h-14 rounded-lg bg-slate-50 skeleton-shimmer" />
            <div className="w-5/6 h-4 rounded bg-slate-100 skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
