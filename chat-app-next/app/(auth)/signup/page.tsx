'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      // Store username in sessionStorage when authenticated
      const storedUsername = sessionStorage.getItem('username') || username;
      if (storedUsername) {
        sessionStorage.setItem('username', storedUsername);
      }
      router.push('/chat');
    }
  }, [status, router, username]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    } else {
      setProfilePicture(null);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms and Conditions');
      setIsLoading(false);
      return;
    }

    try {
      let profilePictureBase64: string | null = null;

      if (profilePicture) {
        const fileType = profilePicture.type;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(fileType)) {
          setError('Only JPEG, PNG, and GIF images are allowed');
          setIsLoading(false);
          return;
        }

        if (profilePicture.size > maxSize) {
          setError('Profile picture must be less than 5MB');
          setIsLoading(false);
          return;
        }

        try {
          const arrayBuffer = await profilePicture.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          profilePictureBase64 = `data:${fileType};base64,${buffer.toString('base64')}`;
        } catch (err) {
          setError('Failed to process profile picture. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      console.log('Sending signup request:', { username, profilePicture: !!profilePictureBase64 });
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.toLowerCase(), password, profilePicture: profilePictureBase64 }),
      });

      let data;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text.slice(0, 100)); // Log first 100 chars
          throw new Error('Server returned non-JSON response');
        }
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error('Invalid server response. Please try again.');
      }

      console.log('Signup response:', { status: response.status, data });

      if (response.ok) {
        // Automatically sign in after successful signup
        const signInResult = await signIn('credentials', {
          redirect: false,
          username: username.toLowerCase(),
          password,
        });

        if (signInResult?.error) {
          setError('Signup succeeded, but auto sign-in failed. Please sign in manually.');
          router.push('/signin');
        } else if (signInResult?.ok) {
          // Store username in sessionStorage
          sessionStorage.setItem('username', username.toLowerCase());
          // useEffect will handle redirect to /chat after session updates
        } else {
          setError('Unexpected sign-in response after signup. Please sign in manually.');
          router.push('/signin');
        }
      } else {
        setError(data.message || 'Signup failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error('Signup error:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        response: err instanceof Response ? { status: err.status, text: await err.text().catch(() => 'Unable to read response') } : undefined,
      });
      setError(err instanceof Error ? err.message : 'Network or server error. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground text-center">Sign Up to ZapLink</h1>
      {error && (
        <p id="error-message" className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md" aria-live="assertive">
          {error}
        </p>
      )}
      <form onSubmit={handleSignup} className="space-y-4">
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
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={isLoading}
            className="mt-1 w-full rounded-md border border-input bg-background p-2 text-foreground focus:border-blue-600 focus:outline-none"
            aria-describedby={error ? 'error-message' : undefined}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            disabled={isLoading}
            className="mt-1 w-full rounded-md border border-input bg-background p-2 text-foreground focus:border-blue-600 focus:outline-none"
            aria-describedby={error ? 'error-message' : undefined}
          />
        </div>
        <div>
          <label htmlFor="profilePicture" className="block text-sm font-medium text-foreground">
            Profile Picture (Optional)
          </label>
          <Input
            id="profilePicture"
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleProfilePictureChange}
            disabled={isLoading}
            className="mt-1 w-full text-foreground"
            aria-describedby={error ? 'error-message' : undefined}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            disabled={isLoading}
          />
          <label htmlFor="terms" className="text-sm text-foreground">
            I agree to the{' '}
            <Link href="/terms-conditions" className="text-blue-600 hover:underline">
              Terms and Conditions
            </Link>
          </label>
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          disabled={isLoading}
        >
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/signin" className="text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}