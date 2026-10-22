import './globals.css';
import type { Metadata } from 'next';
import { RoleProvider } from '@/components/RoleContext';
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
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <RoleProvider>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>Pineco Intelligent Brand Governance Platform — CodeAxis Hackathon Round 2</p>
              <p className="font-mono text-slate-400">Strict Rule Isolation • Fact Traceability • Human Oversight</p>
            </div>
          </footer>
        </RoleProvider>
      </body>
    </html>
  );
}
