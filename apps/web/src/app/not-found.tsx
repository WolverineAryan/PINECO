import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4 border border-purple-200 shadow-xs">
        <ShieldAlert className="w-7 h-7 text-purple-600" />
      </div>
      <span className="text-xs font-mono text-purple-600 uppercase tracking-widest font-bold">404 — Not Found</span>
      <h1 className="text-2xl font-black text-black mt-1 mb-2 tracking-tight">Record or Page Does Not Exist</h1>
      <p className="text-xs text-neutral-500 max-w-sm mb-6 leading-relaxed">
        The requested brand governance resource, submission, or rule could not be located in the current workspace.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center space-x-2 bg-black hover:bg-neutral-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] border border-purple-500/20"
      >
        <ArrowLeft className="w-4 h-4 text-purple-400" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
