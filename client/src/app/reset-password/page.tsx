'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { BrainCircuit, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Must contain uppercase, lowercase, and numbers'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromUrl,
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await apiClient.post('/auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword,
      });

      setStatusSuccess(res.data?.message || 'Password reset successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Create New Password</CardTitle>
        <CardDescription>Choose a strong password to protect your account</CardDescription>
      </CardHeader>

      {statusSuccess ? (
        <CardContent className="space-y-4">
          <Alert variant="success" title="Success!">
            {statusSuccess} Redirecting to login...
          </Alert>
          <Link href="/login" className="block">
            <Button className="w-full">Go to Sign In</Button>
          </Link>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive" title="Error">
                {errorMessage}
              </Alert>
            )}

            {!tokenFromUrl && (
              <div className="space-y-1">
                <Label htmlFor="token">Reset Token</Label>
                <Input
                  id="token"
                  placeholder="Paste token from email"
                  error={errors.token?.message}
                  {...register('token')}
                />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="At least 8 chars (upper, lower, num)"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-type new password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Update Password
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-600/30 mb-3">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Set New Password</h2>
          <p className="text-sm text-slate-400 mt-1">HireMind AI Account Recovery</p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
