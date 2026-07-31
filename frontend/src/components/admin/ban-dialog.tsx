'use client';

import { useState, useCallback } from 'react';
import type { UserEntity } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TriangleAlert, ShieldCheck } from 'lucide-react';

interface BanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserEntity | null;
  onConfirm: (userId: string, notes: string) => void;
}

function BanForm({
  user,
  onConfirm,
  onOpenChange,
}: {
  user: UserEntity;
  onConfirm: (userId: string, notes: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [notes, setNotes] = useState('');

  const isBanning = user.isActive !== false;

  const handleConfirm = useCallback(() => {
    if (isBanning && !notes.trim()) return;
    onConfirm(user.id, notes.trim());
    onOpenChange(false);
  }, [isBanning, notes, user.id, onConfirm, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isBanning ? 'Ban User' : 'Unban User'}
        </DialogTitle>
        <DialogDescription>
          {isBanning
            ? 'This action will immediately revoke the user\'s access to the platform.'
            : 'This action will restore the user\'s access to the platform.'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* User Info */}
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
            variant={user.isActive ? 'outline' : 'destructive'}
            className="ml-auto"
          >
            {user.isActive ? 'Active' : 'Banned'}
          </Badge>
        </div>

        {/* Ban Warning */}
        {isBanning && (
          <Card className="border-destructive/30">
            <CardContent className="flex items-start gap-3 p-4">
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-destructive">
                  Warning: Banning Consequences
                </span>
                <ul className="list-inside list-disc text-xs text-muted-foreground">
                  <li>The user will be immediately signed out</li>
                  <li>All future requests will be blocked</li>
                  <li>The user cannot sign in until unbanned</li>
                  <li>This action is logged in the audit trail</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unban Info */}
        {!isBanning && (
          <Card className="border-emerald-500/30">
            <CardContent className="flex items-start gap-3 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Restoring Access
                </span>
                <p className="text-xs text-muted-foreground">
                  The user will be able to sign in and access the platform
                  again immediately after unbanning.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="ban-notes">
            {isBanning ? 'Reason for banning (required)' : 'Notes (optional)'}
          </Label>
          <Textarea
            id="ban-notes"
            placeholder={
              isBanning
                ? 'Explain why this user is being banned...'
                : 'Optional notes for unbanning...'
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          variant={isBanning ? 'destructive' : 'default'}
          onClick={handleConfirm}
          disabled={isBanning && !notes.trim()}
        >
          {isBanning ? 'Ban User' : 'Unban User'}
        </Button>
      </DialogFooter>
    </>
  );
}

export function BanDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: BanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {user && (
          <BanForm
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
