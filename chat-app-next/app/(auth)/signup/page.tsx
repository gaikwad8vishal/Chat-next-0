'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

// Define interface for API response
interface SignupResponse {
  message: string;
}

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate terms and conditions
    if (!agreeTerms) {
      setError('You must agree to the Terms and Conditions');
      setIsLoading(false);
      return;
    }

    try {
      let profilePictureBase64: string | null = null;

      // Convert profile picture to base64 if provided
      if (profilePicture) {
        const arrayBuffer = await profilePicture.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileType = profilePicture.type;
        const base64String = buffer.toString('base64');

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(fileType)) {
          setError('Only JPEG, PNG, and GIF images are allowed');
          setIsLoading(false);
          return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (profilePicture.size > maxSize) {
          setError('Profile picture must be less than 5MB');
          setIsLoading(false);
          return;
        }

        profilePictureBase64 = `data:${fileType};base64,${base64String}`;
      }

      // Send signup request
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, profilePicture: profilePictureBase64 }),
      });

      const data: SignupResponse = await response.json();

      if (response.ok) {
        router.push('/signin');
      } else {
        switch (data.message) {
          case 'Username already exists':
            setError('This username is already taken');
            break;
          case 'Invalid profile picture format. Must be a base64-encoded image':
            setError('Invalid profile picture format');
            break;
          case 'Profile picture must be less than 5MB':
            setError('Profile picture is too large (max 5MB)');
            break;
          case 'Database connection error. Please try again later.':
            setError('Unable to connect to the server. Please try again later.');
            break;
          default:
            setError(data.message || 'Signup failed. Please try again.');
        }
      }
    } catch (err: unknown) {
      console.error('Signup error:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError('Failed to signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground text-center">Sign Up to ZapLink</h1>
      {error && (
        <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</p>
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