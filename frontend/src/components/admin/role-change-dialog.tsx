'use client';

import { useState } from 'react';
import { useAdminStore } from '@/lib/store';
import type { UserEntity } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TriangleAlert } from 'lucide-react';

interface RoleChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserEntity | null;
  onConfirm: (userId: string, newRole: string, notes: string) => void;
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

function RoleChangeForm({
  user,
  onConfirm,
  onOpenChange,
}: {
  user: UserEntity;
  onConfirm: (userId: string, newRole: string, notes: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { currentUser } = useAdminStore();
  const [newRole, setNewRole] = useState(user.role);
  const [notes, setNotes] = useState('');

  const isOwnerTarget = user.role === 'ROLE_OWNER';
  const isCallerOwner = currentUser?.role === 'ROLE_OWNER';
  const isDisabled = isOwnerTarget && !isCallerOwner;

  function handleConfirm() {
    if (newRole === user.role) return;
    onConfirm(user.id, newRole, notes);
    onOpenChange(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogDescription>
          Update the role and permissions for this user.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Current User Info */}
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {user.username ?? 'Unnamed'}
            </span>
            <span className="text-xs text-muted-foreground">
              {user.email ?? '—'}
            </span>
          </div>
          <Badge
            variant={getRoleBadgeVariant(user.role)}
            className="ml-auto"
          >
            Current: {getRoleLabel(user.role)}
          </Badge>
        </div>

        {/* Owner Warning */}
        {isOwnerTarget && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              This user is an Owner. Only other Owners can modify Owner roles.
              {isDisabled &&
                ' You do not have permission to change this user&apos;s role.'}
            </p>
          </div>
        )}

        {/* Permission Denied */}
        {isDisabled && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">
              You do not have permission to change this Owner&apos;s role.
              Only Owners can modify other Owners.
            </p>
          </div>
        )}

        {/* New Role Select */}
        <div className="space-y-2">
          <Label htmlFor="new-role">New Role</Label>
          <Select
            value={newRole}
            onValueChange={setNewRole}
            disabled={isDisabled}
          >
            <SelectTrigger id="new-role" className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ROLE_USER">User</SelectItem>
              <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
              <SelectItem value="ROLE_OWNER">Owner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="role-notes">Notes / Reason (optional)</Label>
          <Textarea
            id="role-notes"
            placeholder="Enter the reason for this role change..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isDisabled}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={newRole === user.role || isDisabled}
        >
          Confirm Role Change
        </Button>
      </DialogFooter>
    </>
  );
}

export function RoleChangeDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: RoleChangeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {user && (
          <RoleChangeForm
            key={user.id}
            user={user}
            onConfirm={onConfirm}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
