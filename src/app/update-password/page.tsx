'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    // Check if we have the necessary parameters in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const type = urlParams.get('type');
    
    if (!token || type !== 'recovery') {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid reset link. Please request a new password reset email.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('Attempting to update password...');
      const apiUrl = new URL('/api/auth/forgot-password', window.location.origin).toString();
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setMessage('Your password has been updated successfully!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error('Password update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || type !== 'recovery') {
    return null;
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Update your password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>
        <div className={cn('grid gap-6')}>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-500">{error}</div>
              )}
              {message && (
                <div className="text-sm text-green-600">{message}</div>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/login')}
            disabled={isLoading}
          >
            Back to login
          </Button>
        </div>
      </div>
    </div>
  );
}
