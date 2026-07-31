'use client';

import { useState } from 'react';
import type { UserEntity } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserEntity | null;
  onConfirm: (
    userId: string,
    data: {
      username?: string;
      email?: string;
      postCount?: number;
      likeCount?: number;
      commentCount?: number;
      projectCount?: number;
    }
  ) => void;
}

function EditProfileForm({
  user,
  onConfirm,
  onOpenChange,
}: {
  user: UserEntity;
  onConfirm: (
    userId: string,
    data: {
      username?: string;
      email?: string;
      postCount?: number;
      likeCount?: number;
      commentCount?: number;
      projectCount?: number;
    }
  ) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [username, setUsername] = useState(user.username ?? '');
  const [email, setEmail] = useState(user.email ?? '');
  const [postCount, setPostCount] = useState(user.postCount);
  const [likeCount, setLikeCount] = useState(user.likeCount);
  const [commentCount, setCommentCount] = useState(user.commentCount);
  const [projectCount, setProjectCount] = useState(user.projectCount);

  const hasChanges =
    username !== (user.username ?? '') ||
    email !== (user.email ?? '') ||
    postCount !== user.postCount ||
    likeCount !== user.likeCount ||
    commentCount !== user.commentCount ||
    projectCount !== user.projectCount;

  function handleConfirm() {
    const data: {
      username?: string;
      email?: string;
      postCount?: number;
      likeCount?: number;
      commentCount?: number;
      projectCount?: number;
    } = {};

    if (username !== (user.username ?? '')) data.username = username;
    if (email !== (user.email ?? '')) data.email = email;
    if (postCount !== user.postCount) data.postCount = postCount;
    if (likeCount !== user.likeCount) data.likeCount = likeCount;
    if (commentCount !== user.commentCount) data.commentCount = commentCount;
    if (projectCount !== user.projectCount) data.projectCount = projectCount;

    onConfirm(user.id, data);
    onOpenChange(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit User Profile</DialogTitle>
        <DialogDescription>
          Modify the profile information and statistics for this user.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Text Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-username">Username</Label>
            <Input
              id="edit-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
            />
          </div>
        </div>

        {/* Counter Fields */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="edit-posts">Posts</Label>
            <Input
              id="edit-posts"
              type="number"
              min={0}
              value={postCount}
              onChange={(e) => setPostCount(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-likes">Likes</Label>
            <Input
              id="edit-likes"
              type="number"
              min={0}
              value={likeCount}
              onChange={(e) => setLikeCount(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-comments">Comments</Label>
            <Input
              id="edit-comments"
              type="number"
              min={0}
              value={commentCount}
              onChange={(e) => setCommentCount(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-projects">Projects</Label>
            <Input
              id="edit-projects"
              type="number"
              min={0}
              value={projectCount}
              onChange={(e) => setProjectCount(Number(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={!hasChanges}>
          Save Changes
        </Button>
      </DialogFooter>
    </>
  );
}

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: EditProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {user && (
          <EditProfileForm
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
