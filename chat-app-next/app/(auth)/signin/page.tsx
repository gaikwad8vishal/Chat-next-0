'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

// Define interface for API response
interface SigninResponse {
  message: string;
  user?: { id: string; username: string };
}

export default function SignIn() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  // Redirect if already signed in
  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      router.push('/signin');
    }
  }, [router]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate input
    if (!username || !password) {
      setError('Username and password are required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data: SigninResponse = await response.json();

      if (response.ok) {
        // Store username in sessionStorage (temporary; consider NextAuth.js for production)
        sessionStorage.setItem('username', username);
        router.push('/chat'); // Redirect to dashboard
      } else {
        switch (data.message) {
          case 'Invalid username or password':
            setError('Invalid username or password');
            break;
          case 'Database connection error. Please try again later.':
            setError('Unable to connect to the server. Please try again later.');
            break;
          default:
            setError(data.message || 'Sign-in failed. Please try again.');
        }
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error('Sign-in error:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError('Network error. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground text-center">Sign In to ZapLink</h1>
      {error && (
        <p id="error-message" className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
          {error}
        </p>
      )}
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-foreground">
            Username
          </label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            disabled={isLoading}
            className="mt-1 w-full rounded-md border border-input bg-background p-2 text-foreground focus:border-blue-600 focus:outline-none"
            aria-describedby={error ? 'error-message' : undefined}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-foreground focus:border-blue-600 focus:outline-none"
              aria-describedby={error ? 'error-message' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              disabled={isLoading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <div className="text-center text-sm space-y-2">
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
        <p>
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </p>
      </div>
    </div>
  );
}