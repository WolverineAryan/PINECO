import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Skeleton */}
      <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="w-48 h-6 rounded-full bg-slate-800 skeleton-shimmer" />
        <div className="w-3/4 h-8 rounded-lg bg-slate-800 skeleton-shimmer" />
        <div className="w-1/2 h-4 rounded bg-slate-800/80 skeleton-shimmer" />

        <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-slate-800/60 skeleton-shimmer" />
          ))}
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="w-16 h-3 rounded bg-slate-100 skeleton-shimmer" />
            <div className="w-10 h-7 rounded bg-slate-100 skeleton-shimmer" />
            <div className="w-20 h-2 rounded bg-slate-100/70 skeleton-shimmer" />
          </div>
        ))}
      </div>

      {/* Breakdown Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 space-y-4">
          <div className="w-36 h-4 rounded bg-slate-100 skeleton-shimmer" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="w-24 h-3 rounded bg-slate-100 skeleton-shimmer" />
                  <div className="w-6 h-3 rounded bg-slate-100 skeleton-shimmer" />
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 space-y-4">
          <div className="w-40 h-4 rounded bg-slate-100 skeleton-shimmer" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-slate-50 border border-slate-100 skeleton-shimmer" />
            ))}
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
        <div className="flex justify-between">
          <div className="w-48 h-5 rounded bg-slate-100 skeleton-shimmer" />
          <div className="w-24 h-4 rounded bg-slate-100 skeleton-shimmer" />
        </div>
        <div className="space-y-2.5 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 rounded-lg bg-slate-50 skeleton-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
