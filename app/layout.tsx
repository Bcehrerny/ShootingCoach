import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Range Log — Shooting Coach',
  description: 'Upload your target sheet and reflection, get a professional coaching analysis, and track progress over time.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-black/10 bg-paper/95 backdrop-blur sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="target-dot" />
              Range Log
            </Link>
            <nav className="flex gap-5 text-sm">
              <Link href="/" className="hover:text-[var(--ring-red)] transition-colors">
                New session
              </Link>
              <Link href="/history" className="hover:text-[var(--ring-red)] transition-colors">
                History
              </Link>
            </nav>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-5 py-8">{children}</div>
      </body>
    </html>
  );
}
