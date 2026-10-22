'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Pineco Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4 border border-rose-200">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <span className="text-xs font-mono text-rose-600 uppercase tracking-widest font-semibold">
        Application Exception
      </span>
      <h1 className="text-2xl font-bold text-slate-900 mt-1 mb-2">Something went wrong</h1>
      <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed font-mono bg-slate-100 p-3 rounded-lg border border-slate-200/80">
        {error.message || 'An unexpected client error occurred while rendering the interface.'}
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
