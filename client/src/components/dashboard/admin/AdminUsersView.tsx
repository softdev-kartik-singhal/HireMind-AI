'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Users, Search, Trash2, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';

export function AdminUsersView() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { success, error } = useToast();

  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/users?limit=50');
      setUsers(res.data?.data || []);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/users/${userToDelete.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      success(`User ${userToDelete.name} deleted successfully`);
      setUserToDelete(null);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Platform User Directory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Admin access to all registered platform users, roles, and privileges
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'CANDIDATE', 'RECRUITER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === r
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* User Table Card */}
      <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description="No user accounts match the selected role or search query."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/40 uppercase text-slate-400">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <span>{u.name}</span>
                      </td>
                      <td className="p-4 text-slate-300 font-mono">{u.email}</td>
                      <td className="p-4">
                        <Badge variant="role" roleType={u.role} />
                      </td>
                      <td className="p-4 text-slate-400">{formatDate(u.createdAt)}</td>
                      <td className="p-4 text-right">
                        {u.id !== currentUser?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUserToDelete(u)}
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 px-2"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {userToDelete && (
        <Dialog
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          title="Confirm User Account Deletion"
          description="This action will permanently delete the user account and revoke all authentication tokens."
        >
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-rose-200 space-y-1">
            <span className="font-bold block">Target: {userToDelete.name} ({userToDelete.email})</span>
            <p className="text-slate-400">
              Role: {userToDelete.role}. This operation cannot be undone.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setUserToDelete(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              isLoading={isDeleting}
              onClick={handleDeleteUser}
            >
              Confirm Deletion
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
