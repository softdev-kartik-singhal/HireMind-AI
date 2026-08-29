'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { BrainCircuit, ArrowRight, UserCheck, Briefcase, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'
    ),
  role: z.enum(['CANDIDATE', 'RECRUITER', 'ADMIN'] as const),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: signup } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'CANDIDATE',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError(null);
      setIsLoading(true);
      await signup(data);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-600/30 mb-3">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create your HireMind account</h2>
          <p className="text-sm text-slate-400 mt-1">Select your role and start your interview journey</p>
        </div>

        <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Fill in your details below to get started</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {serverError && (
                <Alert variant="destructive" title="Registration Error">
                  {serverError}
                </Alert>
              )}

              {/* Role Selection Tabs */}
              <div className="space-y-1.5">
                <Label>Select Account Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('role', 'CANDIDATE')}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all text-center gap-1.5',
                      selectedRole === 'CANDIDATE'
                        ? 'border-indigo-500 bg-indigo-600/20 text-indigo-200'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    )}
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Candidate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue('role', 'RECRUITER')}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all text-center gap-1.5',
                      selectedRole === 'RECRUITER'
                        ? 'border-purple-500 bg-purple-600/20 text-purple-200'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    )}
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>Recruiter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue('role', 'ADMIN')}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all text-center gap-1.5',
                      selectedRole === 'ADMIN'
                        ? 'border-rose-500 bg-rose-600/20 text-rose-200'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    )}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Sarah Connor"
                  error={errors.name?.message}
                  {...register('name')}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="sarah@example.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 chars (1 uppercase, 1 number)"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Create Account
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>

              <div className="text-center text-xs text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
