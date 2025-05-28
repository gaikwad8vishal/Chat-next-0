import Link from 'next/link';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="bg-background shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-foreground">
              ZapLink
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-50 to-background">
        <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background px-4 py-6 text-center text-sm text-muted-foreground border-t">
        <p>© {new Date().getFullYear()} ZapLink. All rights reserved.</p>
      </footer>
    </div>
  );
}