import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'HireMind AI - AI-Powered Technical Recruitment Platform',
  description: 'Streamline technical hiring with AI interview intelligence, role-based workflows, and automated evaluations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen antialiased bg-slate-950 text-slate-100">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <Navbar />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
