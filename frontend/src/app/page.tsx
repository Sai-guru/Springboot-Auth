'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Menu, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { AuthGate } from '@/components/auth/auth-gate';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { StatsCards } from '@/components/admin/stats-cards';
import { UsersTable } from '@/components/admin/users-table';
import { RoleChangeDialog } from '@/components/admin/role-change-dialog';
import { BanDialog } from '@/components/admin/ban-dialog';
import { EditProfileDialog } from '@/components/admin/edit-profile-dialog';
import { AuditTable } from '@/components/admin/audit-table';

import { useAdminStore } from '@/lib/store';
import * as api from '@/lib/api';
import type { UserEntity } from '@/types';

// ── Action Dialog State ──

type DialogType = 'role' | 'ban' | 'edit' | null;

export default function HomePage() {
  const { getToken } = useAuth();
  useUser();

  // Store
  const {
    currentView,
    currentUser,
    setCurrentUser,
    users,
    setUsers,
    updateUserInList,
    auditLogs,
    setAuditLogs,
    selectedUser,
    setSelectedUser,
    selectedUserAudit,
    setSelectedUserAudit,
    usersLoading,
    auditLoading,
    dashboardLoading,
    actionLoading,
    setUsersLoading,
    setAuditLoading,
    setDashboardLoading,
    setActionLoading,
  } = useAdminStore();


  // Dialog state
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [dialogUser, setDialogUser] = useState<UserEntity | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── Data Fetching ──

  const loadDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const token = await getToken();
      if (!token) return;
      const me = await api.fetchMyDashboard(token);
      setCurrentUser(me);
    } catch (err) {
      toast.error('Failed to load dashboard: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDashboardLoading(false);
    }
  }, [getToken, setCurrentUser, setDashboardLoading]);

  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await api.fetchAllUsers(token);
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUsersLoading(false);
    }
  }, [getToken, setUsers, setUsersLoading]);

  const loadAuditLog = useCallback(async () => {
    try {
      setAuditLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await api.fetchFullAuditLog(token);
      setAuditLogs(data);
    } catch (err) {
      toast.error('Failed to load audit log: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setAuditLoading(false);
    }
  }, [getToken, setAuditLogs, setAuditLoading]);

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Load users when switching to users view
  useEffect(() => {
    if (currentView === 'users' && users.length === 0) {
      loadUsers();
    }
  }, [currentView, users.length, loadUsers]);

  // Load audit log when switching to audit view
  useEffect(() => {
    if (currentView === 'audit' && auditLogs.length === 0) {
      loadAuditLog();
    }
  }, [currentView, auditLogs.length, loadAuditLog]);

  // Also load users on overview (for stats)
  useEffect(() => {
    if (currentView === 'overview' && users.length === 0) {
      loadUsers();
    }
  }, [currentView, users.length, loadUsers]);

  // ── Action Handlers (all 13 backend endpoints) ──

  const handleAction = useCallback(
    async (action: { type: string; userId: string }) => {
      const user = users.find((u) => u.id === action.userId);
      if (!user) return;

      switch (action.type) {
        case 'view': {
          setSelectedUser(user);
          // Also fetch audit log for this user
          try {
            const token = await getToken();
            if (token) {
              const logs = await api.fetchUserAuditLog(token, user.id);
              setSelectedUserAudit(logs);
            }
          } catch {
            setSelectedUserAudit([]);
          }
          break;
        }
        case 'changeRole': {
          setDialogUser(user);
          setDialogType('role');
          break;
        }
        case 'ban': {
          setDialogUser(user);
          setDialogType('ban');
          break;
        }
        case 'edit': {
          setDialogUser(user);
          setDialogType('edit');
          break;
        }
      }
    },
    [users, getToken, setSelectedUser, setSelectedUserAudit]
  );

  const handleRoleChange = useCallback(
    async (userId: string, newRole: string, notes: string) => {
      try {
        setActionLoading(true);
        const token = await getToken();
        if (!token) return;
        const updated = await api.changeUserRole(token, userId, newRole, notes || undefined);
        updateUserInList(updated);
        toast.success(`Role changed to ${newRole.replace('ROLE_', '')}`);
        setDialogType(null);
        setDialogUser(null);
      } catch (err) {
        toast.error('Failed to change role: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setActionLoading(false);
      }
    },
    [getToken, updateUserInList, setActionLoading]
  );

  const handleBan = useCallback(
    async (userId: string, notes: string) => {
      const user = users.find((u) => u.id === userId);
      if (!user) return;
      try {
        setActionLoading(true);
        const token = await getToken();
        if (!token) return;
        const updated = user.isActive
          ? await api.banUser(token, userId, notes || undefined)
          : await api.unbanUser(token, userId, notes || undefined);
        updateUserInList(updated);
        toast.success(user.isActive ? 'User banned' : 'User unbanned');
        setDialogType(null);
        setDialogUser(null);
      } catch (err) {
        toast.error((user.isActive ? 'Ban' : 'Unban') + ' failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setActionLoading(false);
      }
    },
    [users, getToken, updateUserInList, setActionLoading]
  );

  const handleEditProfile = useCallback(
    async (userId: string, data: { username?: string; email?: string; postCount?: number; likeCount?: number; commentCount?: number; projectCount?: number }) => {
      try {
        setActionLoading(true);
        const token = await getToken();
        if (!token) return;
        const updated = await api.editUserProfile(token, userId, data);
        updateUserInList(updated);
        toast.success('Profile updated');
        setDialogType(null);
        setDialogUser(null);
      } catch (err) {
        toast.error('Failed to update profile: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setActionLoading(false);
      }
    },
    [getToken, updateUserInList, setActionLoading]
  );

  const handleRefresh = useCallback(() => {
    loadDashboard();
    loadUsers();
    loadAuditLog();
    toast.success('Data refreshed');
  }, [loadDashboard, loadUsers, loadAuditLog]);

  // ── Loading State ──

  if (dashboardLoading) {
    return (
      <AuthGate>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </AuthGate>
    );
  }

  // ── Main Layout ──

  return (
    <AuthGate>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <AdminSidebar />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <div>
                <h1 className="text-base font-semibold capitalize">{currentView === 'audit' ? 'Audit Log' : currentView}</h1>
                {currentUser && (
                  <p className="text-xs text-muted-foreground">
                    Signed in as {currentUser.username || currentUser.email || currentUser.id}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={currentUser?.role === 'ROLE_OWNER' ? 'default' : 'secondary'} className="hidden sm:flex">
                {currentUser?.role.replace('ROLE_', '') || '...'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={usersLoading || auditLoading || actionLoading}
              >
                <RefreshCw className={`size-3.5 mr-1.5 ${usersLoading || auditLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {/* ── Overview View ── */}
            {currentView === 'overview' && (
              <div className="space-y-6">
                {/* My Quick Stats */}
                {currentUser && (
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Your Activity
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <MiniStat label="Posts" value={currentUser.postCount} />
                      <MiniStat label="Likes" value={currentUser.likeCount} />
                      <MiniStat label="Comments" value={currentUser.commentCount} />
                      <MiniStat label="Projects" value={currentUser.projectCount} />
                    </div>
                  </div>
                )}

                <Separator />

                {/* Global Stats (admin+ only) */}
                {(currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_OWNER') && (
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      System Overview
                    </h2>
                    {usersLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <Skeleton key={i} className="h-28 rounded-xl" />
                        ))}
                      </div>
                    ) : (
                      <StatsCards users={users} />
                    )}
                  </div>
                )}

                {/* Regular user view */}
                {currentUser?.role === 'ROLE_USER' && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Your dashboard shows your personal activity stats above.</p>
                    <p className="text-xs mt-1">Contact an admin for elevated access.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Users View (admin+ only) */}
            {currentView === 'users' && (
              <UsersTable onAction={handleAction} />
            )}

            {/* ── Audit Log View (admin+ only) */}
            {currentView === 'audit' && (
              <AuditTable logs={auditLogs} users={users} loading={auditLoading} />
            )}
          </main>

          {/* Footer */}
          <footer className="shrink-0 border-t px-4 py-3 text-center text-xs text-muted-foreground">
            RBAC Admin Panel &middot; {users.length} users &middot; {auditLogs.length} audit entries
          </footer>
        </div>

        {/* ── Dialogs ── */}
        <RoleChangeDialog
          open={dialogType === 'role'}
          onOpenChange={(open) => { if (!open) setDialogType(null); }}
          user={dialogUser}
          onConfirm={handleRoleChange}
        />

        <BanDialog
          open={dialogType === 'ban'}
          onOpenChange={(open) => { if (!open) setDialogType(null); }}
          user={dialogUser}
          onConfirm={handleBan}
        />

        <EditProfileDialog
          open={dialogType === 'edit'}
          onOpenChange={(open) => { if (!open) setDialogType(null); }}
          user={dialogUser}
          onConfirm={handleEditProfile}
        />

        {/* User Detail Sheet */}
        <Sheet open={!!selectedUser} onOpenChange={(open) => { if (!open) setSelectedUser(null); }}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>User Details</SheetTitle>
            </SheetHeader>
            {selectedUser && (
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
                    {(selectedUser.username || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{selectedUser.username || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email || 'No email'}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <DetailRow label="ID" value={selectedUser.id} mono />
                  <DetailRow label="Role" value={
                    <Badge variant={selectedUser.role === 'ROLE_OWNER' ? 'default' : selectedUser.role === 'ROLE_ADMIN' ? 'secondary' : 'outline'}>
                      {selectedUser.role}
                    </Badge>
                  } />
                  <DetailRow label="Status" value={
                    <Badge variant={selectedUser.isActive ? 'default' : 'destructive'}>
                      {selectedUser.isActive ? 'Active' : 'Banned'}
                    </Badge>
                  } />
                  <DetailRow label="Joined" value={new Date(selectedUser.createdAt).toLocaleDateString()} />
                  <DetailRow label="Last Updated" value={new Date(selectedUser.editedAt).toLocaleDateString()} />
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-3">Activity Metrics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <MiniStat label="Posts" value={selectedUser.postCount} />
                    <MiniStat label="Likes" value={selectedUser.likeCount} />
                    <MiniStat label="Comments" value={selectedUser.commentCount} />
                    <MiniStat label="Projects" value={selectedUser.projectCount} />
                  </div>
                </div>

                {/* Recent Audit for this user */}
                {selectedUserAudit.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium mb-3">Recent Actions ({selectedUserAudit.length})</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedUserAudit.map((log) => (
                          <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg border text-sm">
                            <Badge variant={log.actionType === 'BAN' ? 'destructive' : log.actionType === 'ROLE_CHANGE' ? 'secondary' : 'outline'} className="shrink-0 text-[10px]">
                              {log.actionType}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString()}
                              </p>
                              {log.notes && (
                                <p className="text-xs mt-0.5 truncate">{log.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => { setSelectedUser(null); setDialogUser(selectedUser); setDialogType('role'); }}
                  >
                    Change Role
                  </Button>
                  <Button
                    variant={selectedUser.isActive ? 'destructive' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => { setSelectedUser(null); setDialogUser(selectedUser); setDialogType('ban'); }}
                  >
                    {selectedUser.isActive ? 'Ban User' : 'Unban User'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => { setSelectedUser(null); setDialogUser(selectedUser); setDialogType('edit'); }}
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AuthGate>
  );
}

// ── Small Helper Components ──

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-3">
      <span className="text-xl font-bold">{value.toLocaleString()}</span>
      <span className="text-[11px] text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className={mono ? 'font-mono text-xs break-all' : ''}>{value}</div>
    </div>
  );
}
