import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Navbar Component
function Navbar() {
  return (
    <nav className="bg-background shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-foreground">
              ZapLink
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/signin">
              <Button className="bg-green-600 hover:bg-green-700 transition-colors duration-200">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 transition-colors duration-200"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center bg-gradient-to-b from-green-50 to-background sm:py-16">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          Welcome to ZapLink
        </h1>
        <p className="mb-8 max-w-lg text-base text-muted-foreground sm:text-lg md:text-xl">
          Connect securely with friends and family through end-to-end encrypted messaging, group chats, and video calls.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/signin">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-6 sm:w-40 transition-transform duration-200 hover:scale-105">
              Get Started
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-50 text-lg py-6 sm:w-40 transition-transform duration-200 hover:scale-105"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-3xl font-semibold text-foreground sm:text-4xl text-center">
            Why Choose ZapLink?
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg bg-card p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200">
              <h3 className="mb-2 text-xl font-medium text-foreground">End-to-End Encryption</h3>
              <p className="text-sm text-muted-foreground">
                Your messages are secure with industry-standard encryption.
              </p>
            </div>
            <div className="rounded-lg bg-card p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200">
              <h3 className="mb-2 text-xl font-medium text-foreground">Group Chats</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage groups with admin controls.
              </p>
            </div>
            <div className="rounded-lg bg-card p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200">
              <h3 className="mb-2 text-xl font-medium text-foreground">Video & Voice Calls</h3>
              <p className="text-sm text-muted-foreground">
                Stay connected with high-quality calls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background px-4 py-6 text-center text-sm text-muted-foreground border-t">
        <p>© {new Date().getFullYear()} ZapLink. All rights reserved.</p>
      </footer>
    </div>
  );
}