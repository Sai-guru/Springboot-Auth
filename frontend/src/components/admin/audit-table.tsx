'use client';

import { useMemo } from 'react';
import type { UserEntity, AdminAuditEntity, ActionType } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ScrollText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AuditTableProps {
  logs: AdminAuditEntity[];
  users: UserEntity[];
  loading: boolean;
}

function getActionBadgeVariant(action: ActionType) {
  switch (action) {
    case 'ROLE_CHANGE':
      return 'secondary' as const;
    case 'BAN':
      return 'destructive' as const;
    case 'UNBAN':
      return 'default' as const;
    case 'PROFILE_EDIT':
      return 'outline' as const;
    default:
      return 'outline' as const;
  }
}

function getActionLabel(action: ActionType): string {
  switch (action) {
    case 'ROLE_CHANGE':
      return 'Role Change';
    case 'BAN':
      return 'Ban';
    case 'UNBAN':
      return 'Unban';
    case 'PROFILE_EDIT':
      return 'Profile Edit';
    default:
      return action;
  }
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

function resolveUsername(userId: string, users: UserEntity[]): string {
  const user = users.find((u) => u.id === userId);
  return user?.username ?? user?.email ?? userId;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </div>
  );
}

export function AuditTable({ logs, users, loading }: AuditTableProps) {
  const actorRoles = useMemo(() => {
    const map: Record<string, string> = {};
    for (const log of logs) {
      map[log.actorId] = log.actorRole;
    }
    return map;
  }, [logs]);

  function getUsername(userId: string): string {
    return resolveUsername(userId, users);
  }

  function getActorRole(actorId: string): string {
    return actorRoles[actorId] ?? 'ROLE_USER';
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="sticky top-0 z-10 bg-background">
            <TableHead className="min-w-[120px]">Timestamp</TableHead>
            <TableHead className="min-w-[160px]">Actor</TableHead>
            <TableHead className="min-w-[110px]">Action</TableHead>
            <TableHead className="min-w-[140px]">Target</TableHead>
            <TableHead className="min-w-[100px]">Previous Role</TableHead>
            <TableHead className="min-w-[100px]">New Role</TableHead>
            <TableHead className="min-w-[180px]">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center">
                <div className="flex flex-col items-center gap-2">
                  <ScrollText className="size-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No audit logs found.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                {/* Timestamp */}
                <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(log.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>

                {/* Actor */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm">
                      {getUsername(log.actorId)}
                    </span>
                    <Badge
                      variant={getRoleBadgeVariant(getActorRole(log.actorId))}
                      className="shrink-0"
                    >
                      {getRoleLabel(getActorRole(log.actorId))}
                    </Badge>
                  </div>
                </TableCell>

                {/* Action */}
                <TableCell>
                  <Badge variant={getActionBadgeVariant(log.actionType)}>
                    {getActionLabel(log.actionType)}
                  </Badge>
                </TableCell>

                {/* Target */}
                <TableCell className="truncate text-sm">
                  {getUsername(log.targetUserId)}
                </TableCell>

                {/* Previous Role */}
                <TableCell className="text-sm text-muted-foreground">
                  {log.targetPreviousRole
                    ? getRoleLabel(log.targetPreviousRole)
                    : '—'}
                </TableCell>

                {/* New Role */}
                <TableCell className="text-sm text-muted-foreground">
                  {log.targetNewRole
                    ? getRoleLabel(log.targetNewRole)
                    : '—'}
                </TableCell>

                {/* Notes */}
                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                  {log.notes ?? '—'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
