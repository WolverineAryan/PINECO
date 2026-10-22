'use client';

import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl relative overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner Skeleton */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2.5 max-w-lg w-full">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-7 w-64 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-md" />
        </div>
        <div className="flex items-center space-x-2.5 shrink-0 w-full sm:w-auto">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* 4 Executive Metric Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16 rounded-lg" />
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
              <Skeleton className="h-2.5 w-24 rounded-full" />
              <Skeleton className="h-2 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Submissions & Findings Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Submissions List Skeleton (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
            <div className="space-y-1">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-3 w-56 rounded-md" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-24 rounded-xl" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>

          {/* Search bar skeleton */}
          <Skeleton className="h-9 w-full rounded-xl" />

          {/* Table rows skeleton */}
          <div className="space-y-2.5 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-3.5 bg-neutral-50/70 rounded-xl border border-neutral-200/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-3 w-20 rounded-full" />
                      <Skeleton className="h-3 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-7 w-16 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Governance Telemetry Skeleton (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24 rounded-md" />
                    <Skeleton className="h-3 w-8 rounded-md" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-5 space-y-3">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function KnowledgeSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner Skeleton */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-7 w-56 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Tabs & Search Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-64 rounded-xl" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-7 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-6 space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="p-3 bg-neutral-50/70 rounded-xl border border-neutral-200/60 flex items-center justify-between gap-4"
          >
            <div className="flex items-center space-x-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-44 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubmissionDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Header Skeleton */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
          <Skeleton className="h-7 w-72 rounded-lg" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Main Grid: Content on Left (7 cols), Findings on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-3 pt-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
            <Skeleton className="h-4 w-11/12 rounded-md" />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-3 w-3/4 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
