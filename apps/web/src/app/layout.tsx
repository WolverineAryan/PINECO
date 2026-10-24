import './globals.css';
import type { Metadata } from 'next';
import { RoleProvider } from '@/components/RoleContext';
import { ToastProvider } from '@/components/Toast';
import { AppShell } from '@/components/AppShell';

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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-white text-black antialiased min-h-screen flex flex-col font-sans selection:bg-black selection:text-white"
        style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
      >
        <RoleProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
