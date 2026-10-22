import './globals.css';
import type { Metadata } from 'next';
import { RoleProvider } from '@/components/RoleContext';
import { ToastProvider } from '@/components/Toast';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Pineco — Intelligent Brand Governance Platform',
  description: 'Evidence-based brand governance platform combining deterministic rule checks and AI claim verification.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-slate-50/60 text-slate-900 antialiased min-h-screen flex flex-col font-sans selection:bg-slate-900 selection:text-white">
        <RoleProvider>
          <ToastProvider>
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all">
              {children}
            </main>
            <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-sm py-6 mt-16 text-center text-xs text-slate-400">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-slate-600">Pineco Governance Core active</span>
                  <span>•</span>
                  <span>CodeAxis Hackathon Round 2</span>
                </div>
                <p className="font-mono text-[11px] text-slate-400">
                  Strict Rule Isolation • Fact Traceability • Human Oversight
                </p>
              </div>
            </footer>
          </ToastProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
