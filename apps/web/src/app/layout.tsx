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
    <html lang="en" className="h-full">
      <body className="bg-[#FFFFF0] text-[#191919] antialiased min-h-screen flex flex-col font-sans selection:bg-[#F6C324] selection:text-[#191919]">
        <RoleProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
