'use client';

import { useMemo } from 'react';
import { useAdminStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';
import { Search, MoreHorizontal, Eye, Shield, Ban, UserCog, UserPlus, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UsersTableProps {
  onAction: (action: { type: string; userId: string }) => void;
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'ROLE_OWNER':
      return 'default' as const;
    case 'ROLE_ADMIN':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'ROLE_OWNER':
      return 'Owner';
    case 'ROLE_ADMIN':
      return 'Admin';
    default:
      return 'User';
  }
}

function getInitials(username: string | null): string {
  if (!username) return '?';
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UsersTable({ onAction }: UsersTableProps) {
  const {
    users,
    usersLoading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    currentUser,
  } = useAdminStore();

  const canManageUsers =
    currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_OWNER';

  const filteredUsers = useMemo(() => {
    let result = users;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (statusFilter === 'active') {
      result = result.filter((u) => u.isActive);
    } else if (statusFilter === 'banned') {
      result = result.filter((u) => !u.isActive);
    }

    return result;
  }, [users, searchQuery, roleFilter, statusFilter]);

  if (usersLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ROLE_USER">User</SelectItem>
              <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
              <SelectItem value="ROLE_OWNER">Owner</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-[60vh] overflow-y-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="sticky top-0 z-10 bg-background">
              <TableHead className="min-w-[200px]">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-center">Posts</TableHead>
              <TableHead className="text-center">Likes</TableHead>
              <TableHead className="text-center">Comments</TableHead>
              <TableHead className="text-center">Projects</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="min-w-[100px]">Joined</TableHead>
              {canManageUsers && <TableHead className="w-[50px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canManageUsers ? 9 : 8}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <UsersRound className="size-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      No users found matching your filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  {/* User Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="default">
                        <AvatarFallback>
                          {getInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium">
                          {user.username ?? 'Unnamed'}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.email ?? '—'}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>

                  {/* Posts */}
                  <TableCell className="text-center tabular-nums">
                    {user.postCount}
                  </TableCell>

                  {/* Likes */}
                  <TableCell className="text-center tabular-nums">
                    {user.likeCount}
                  </TableCell>

                  {/* Comments */}
                  <TableCell className="text-center tabular-nums">
                    {user.commentCount}
                  </TableCell>

                  {/* Projects */}
                  <TableCell className="text-center tabular-nums">
                    {user.projectCount}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Banned</Badge>
                    )}
                  </TableCell>

                  {/* Joined */}
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>

                  {/* Actions */}
                  {canManageUsers && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-xs">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              onAction({ type: 'view', userId: user.id })
                            }
                          >
                            <Eye />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              onAction({ type: 'changeRole', userId: user.id })
                            }
                          >
                            <Shield />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant={user.isActive ? 'destructive' : 'default'}
                            onClick={() =>
                              onAction({
                                type: user.isActive ? 'ban' : 'unban',
                                userId: user.id,
                              })
                            }
                          >
                            {user.isActive ? <Ban /> : <UserPlus />}
                            {user.isActive ? 'Ban User' : 'Unban User'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              onAction({
                                type: 'editProfile',
                                userId: user.id,
                              })
                            }
                          >
                            <UserCog />
                            Edit Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
