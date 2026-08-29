'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Alert } from '@/components/ui/alert';
import { formatDate } from '@/lib/utils';
import {
  User,
  Mail,
  Shield,
  KeyRound,
  Calendar,
  Phone,
  FileText,
  Save,
  CheckCircle2,
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  headline: z.string().max(120).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')).nullable(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Must contain uppercase, lowercase, and numbers'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      headline: user?.headline || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        headline: user.headline || '',
        bio: user.bio || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
  }, [user, resetProfile]);

  const onUpdateProfile = async (data: ProfileFormData) => {
    try {
      setIsUpdatingProfile(true);
      setProfileSuccess(null);
      setProfileError(null);

      const payload = {
        name: data.name,
        headline: data.headline || null,
        bio: data.bio || null,
        phone: data.phone || null,
        avatar: data.avatar || null,
      };

      const res = await apiClient.put('/users/profile', payload);
      updateUser(res.data?.data?.user || payload);
      setProfileSuccess('Profile updated successfully!');
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    try {
      setIsChangingPassword(true);
      setPasswordSuccess(null);
      setPasswordError(null);

      const res = await apiClient.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setPasswordSuccess(res.data?.message || 'Password changed successfully!');
      resetPasswordForm();
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Overview Header Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-indigo-950/30 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar name={user?.name} src={user?.avatar} size="xl" />

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user?.name}</h1>
              {user?.role && <Badge variant="role" roleType={user.role} />}
            </div>

            <p className="text-sm text-slate-300 font-medium">{user?.headline || 'No headline set'}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-indigo-400" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                Joined {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Edit Profile Form */}
          <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-indigo-400" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your public account information</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
                {profileSuccess && (
                  <Alert variant="success" title="Success">
                    {profileSuccess}
                  </Alert>
                )}
                {profileError && (
                  <Alert variant="destructive" title="Error">
                    {profileError}
                  </Alert>
                )}

                <div className="space-y-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    error={profileErrors.name?.message}
                    {...registerProfile('name')}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="headline">Headline / Role Title</Label>
                  <Input
                    id="headline"
                    placeholder="Senior Full Stack Engineer / Technical Recruiter"
                    error={profileErrors.headline?.message}
                    {...registerProfile('headline')}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="avatar">Avatar Image URL</Label>
                  <Input
                    id="avatar"
                    placeholder="https://example.com/avatar.png"
                    error={profileErrors.avatar?.message}
                    {...registerProfile('avatar')}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    error={profileErrors.phone?.message}
                    {...registerProfile('phone')}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    rows={3}
                    className="flex w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
                    placeholder="Brief background summary..."
                    {...registerProfile('bio')}
                  />
                  {profileErrors.bio?.message && (
                    <p className="text-xs text-rose-400">{profileErrors.bio?.message}</p>
                  )}
                </div>

                <Button type="submit" isLoading={isUpdatingProfile} className="w-full gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <KeyRound className="h-5 w-5 text-purple-400" />
                Security & Password
              </CardTitle>
              <CardDescription>Update your password to keep your account safe</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
                {passwordSuccess && (
                  <Alert variant="success" title="Updated">
                    {passwordSuccess}
                  </Alert>
                )}
                {passwordError && (
                  <Alert variant="destructive" title="Security Error">
                    {passwordError}
                  </Alert>
                )}

                <div className="space-y-1">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    error={passwordErrors.currentPassword?.message}
                    {...registerPassword('currentPassword')}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    error={passwordErrors.newPassword?.message}
                    {...registerPassword('newPassword')}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    error={passwordErrors.confirmPassword?.message}
                    {...registerPassword('confirmPassword')}
                  />
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  isLoading={isChangingPassword}
                  className="w-full gap-2"
                >
                  <KeyRound className="h-4 w-4" />
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
