import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:py-16">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Welcome to ChatApp
        </h1>
        <p className="mb-8 max-w-md text-sm text-muted-foreground sm:text-base">
          Connect securely with friends and family through end-to-end encrypted messaging, group chats, and video calls.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/signin">
            <Button className="w-full bg-green-600 hover:bg-green-700 sm:w-auto">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-50 sm:w-auto"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-2xl font-semibold text-foreground sm:text-3xl">
            Why Choose ChatApp?
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg bg-card p-6 text-center shadow-sm">
              <h3 className="mb-2 text-lg font-medium">End-to-End Encryption</h3>
              <p className="text-sm text-muted-foreground">
                Your messages are secure with industry-standard encryption.
              </p>
            </div>
            <div className="rounded-lg bg-card p-6 text-center shadow-sm">
              <h3 className="mb-2 text-lg font-medium">Group Chats</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage groups with admin controls.
              </p>
            </div>
            <div className="rounded-lg bg-card p-6 text-center shadow-sm">
              <h3 className="mb-2 text-lg font-medium">Video & Voice Calls</h3>
              <p className="text-sm text-muted-foreground">
                Stay connected with high-quality calls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background px-4 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ChatApp. All rights reserved.</p>
      </footer>
    </div>
  );
}