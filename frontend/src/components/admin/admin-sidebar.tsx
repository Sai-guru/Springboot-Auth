'use client';

import { useAdminStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { DashboardView } from '@/types';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  ScrollText,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useClerk } from '@clerk/nextjs';

interface NavItem {
  view: DashboardView;
  label: string;
  icon: React.ReactNode;
  adminOnly: boolean;
}

const navItems: NavItem[] = [
  {
    view: 'overview',
    label: 'Overview',
    icon: <LayoutDashboard className="size-4" />,
    adminOnly: false,
  },
  {
    view: 'users',
    label: 'Users',
    icon: <Users className="size-4" />,
    adminOnly: true,
  },
  {
    view: 'audit',
    label: 'Audit Log',
    icon: <ScrollText className="size-4" />,
    adminOnly: true,
  },
];

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

function getInitials(username: string | null): string {
  if (!username) return '?';
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
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

export function AdminSidebar() {
  const { currentView, setCurrentView, currentUser } = useAdminStore();
  const { signOut } = useClerk();

  const isAdminOrOwner =
    currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_OWNER';

  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdminOrOwner
  );

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">
              RBAC Admin
            </span>
            <span className="text-xs text-muted-foreground">
              Management Panel
            </span>
          </div>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-3 py-4">
          {visibleNavItems.map((item) => (
            <Tooltip key={item.view}>
              {/* 
                FIX: Removed native button child and asChild prop entirely.
                We apply click handers and styling directly to TooltipTrigger 
                so it builds exactly one clean button DOM node under Base UI.
              */}
              <TooltipTrigger
                onClick={() => setCurrentView(item.view)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer text-left w-full border border-transparent outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
                  currentView === item.view
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {item.icon}
                {item.label}
              </TooltipTrigger>
              <TooltipContent side="right">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* Spacer */}
        <div className="mt-auto" />

        {/* Current User Section */}
        <Separator />
        <div className="flex items-center gap-3 px-4 py-4">
          <Avatar size="default">
            <AvatarFallback>
              {getInitials(currentUser?.username ?? null)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">
              {currentUser?.username ?? 'Unknown User'}
            </span>
            <Badge
              variant={getRoleBadgeVariant(currentUser?.role ?? 'ROLE_USER')}
              className="mt-0.5 w-fit"
            >
              {getRoleLabel(currentUser?.role ?? 'ROLE_USER')}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => signOut()}
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>
  );
}
