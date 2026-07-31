'use client';

import { cn } from '@/lib/utils';
import type { UserEntity } from '@/types';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  BarChart3,
  Heart,
  MessageSquare,
  FolderKanban,
  type LucideIcon,
} from 'lucide-react';

interface StatCard {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

function computeStats(users: UserEntity[]): StatCard[] {
  const total = users.length;
  const admins = users.filter(
    (u) => u.role === 'ROLE_ADMIN' || u.role === 'ROLE_OWNER'
  ).length;
  const active = users.filter((u) => u.isActive).length;
  const banned = users.filter((u) => !u.isActive).length;
  const totalPosts = users.reduce((sum, u) => sum + u.postCount, 0);
  const totalLikes = users.reduce((sum, u) => sum + u.likeCount, 0);
  const totalComments = users.reduce((sum, u) => sum + u.commentCount, 0);
  const totalProjects = users.reduce((sum, u) => sum + u.projectCount, 0);

  return [
    {
      title: 'Total Users',
      value: total,
      subtitle: `${active} active this period`,
      icon: Users,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: 'Admins',
      value: admins,
      subtitle: `${((admins / Math.max(total, 1)) * 100).toFixed(1)}% of total`,
      icon: Shield,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Active Users',
      value: active,
      subtitle: `${((active / Math.max(total, 1)) * 100).toFixed(1)}% of total`,
      icon: UserCheck,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Banned Users',
      value: banned,
      subtitle: banned > 0 ? 'Requires attention' : 'All clear',
      icon: UserX,
      iconBg: banned > 0 ? 'bg-destructive/10' : 'bg-muted',
      iconColor: banned > 0 ? 'text-destructive' : 'text-muted-foreground',
    },
    {
      title: 'Total Posts',
      value: totalPosts,
      subtitle: `Avg ${(totalPosts / Math.max(total, 1)).toFixed(1)} per user`,
      icon: BarChart3,
      iconBg: 'bg-chart-1/10',
      iconColor: 'text-chart-1',
    },
    {
      title: 'Total Likes',
      value: totalLikes,
      subtitle: `Avg ${(totalLikes / Math.max(total, 1)).toFixed(1)} per user`,
      icon: Heart,
      iconBg: 'bg-chart-2/10',
      iconColor: 'text-chart-2',
    },
    {
      title: 'Total Comments',
      value: totalComments,
      subtitle: `Avg ${(totalComments / Math.max(total, 1)).toFixed(1)} per user`,
      icon: MessageSquare,
      iconBg: 'bg-chart-3/10',
      iconColor: 'text-chart-3',
    },
    {
      title: 'Total Projects',
      value: totalProjects,
      subtitle: `Avg ${(totalProjects / Math.max(total, 1)).toFixed(1)} per user`,
      icon: FolderKanban,
      iconBg: 'bg-chart-4/10',
      iconColor: 'text-chart-4',
    },
  ];
}

interface StatsCardsProps {
  users: UserEntity[];
}

export function StatsCards({ users }: StatsCardsProps) {
  const stats = computeStats(users);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-lg',
                  stat.iconBg
                )}
              >
                <Icon className={cn('size-5', stat.iconColor)} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </span>
                <span className="text-2xl font-bold leading-tight">
                  {stat.value.toLocaleString()}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {stat.subtitle}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
