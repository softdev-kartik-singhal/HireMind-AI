'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { BrainCircuit, ArrowLeft, Mail, ExternalLink } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await apiClient.post('/auth/forgot-password', data);
      setStatusMessage(res.data?.message || 'Password reset link sent to your email.');

      if (res.data?.data?.resetToken) {
        setResetToken(res.data.data.resetToken);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-600/30 mb-3">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
          <p className="text-sm text-slate-400 mt-1">
            Enter your email to receive recovery instructions
          </p>
        </div>

        <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              We will send you a secure link to reset your account password.
            </CardDescription>
          </CardHeader>

          {statusMessage ? (
            <CardContent className="space-y-4">
              <Alert variant="success" title="Request Received">
                {statusMessage}
              </Alert>

              {resetToken && (
                <div className="p-4 rounded-lg bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                    <span>Developer Demo Mode:</span>
                  </div>
                  <p className="text-xs text-slate-300 break-all font-mono">
                    Token: {resetToken}
                  </p>
                  <Link href={`/reset-password?token=${resetToken}`}>
                    <Button size="sm" variant="default" className="mt-2 w-full gap-1.5 text-xs">
                      Open Reset Password Page
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              )}

              <Link href="/login" className="block pt-2">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back to Sign In
                </Button>
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

                <div className="space-y-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="alex@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Send Reset Link
                </Button>

                <Link href="/login" className="w-full">
                  <Button variant="ghost" size="sm" className="w-full text-slate-400">
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Back to Sign In
                  </Button>
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
