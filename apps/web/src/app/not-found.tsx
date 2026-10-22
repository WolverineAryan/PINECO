import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 mb-4 border border-slate-200">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">404 — Not Found</span>
      <h1 className="text-2xl font-bold text-slate-900 mt-1 mb-2">Record or Page Does Not Exist</h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
        The requested brand governance resource, submission, or rule could not be located in the current workspace.
      </p>
      <Link
        href="/"
        className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
