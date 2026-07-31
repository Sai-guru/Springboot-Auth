import { create } from 'zustand';
import type { UserEntity, AdminAuditEntity, DashboardView } from '@/types';

interface AdminState {
  // Navigation
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;

  // Current user (from /api/dashboard/me)
  currentUser: UserEntity | null;
  setCurrentUser: (user: UserEntity | null) => void;

  // All users list
  users: UserEntity[];
  setUsers: (users: UserEntity[]) => void;
  updateUserInList: (updated: UserEntity) => void;

  // Audit logs
  auditLogs: AdminAuditEntity[];
  setAuditLogs: (logs: AdminAuditEntity[]) => void;

  // Filters (for Users view)
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  setSearchQuery: (q: string) => void;
  setRoleFilter: (r: string) => void;
  setStatusFilter: (s: string) => void;
  resetFilters: () => void;

  // Selected user (for detail sheet)
  selectedUser: UserEntity | null;
  selectedUserAudit: AdminAuditEntity[];
  setSelectedUser: (user: UserEntity | null) => void;
  setSelectedUserAudit: (logs: AdminAuditEntity[]) => void;

  // Loading states
  usersLoading: boolean;
  auditLoading: boolean;
  dashboardLoading: boolean;
  actionLoading: boolean;
  setUsersLoading: (l: boolean) => void;
  setAuditLoading: (l: boolean) => void;
  setDashboardLoading: (l: boolean) => void;
  setActionLoading: (l: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  currentView: 'overview',
  setCurrentView: (view) => set({ currentView: view }),

  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  users: [],
  setUsers: (users) => set({ users }),
  updateUserInList: (updated) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === updated.id ? updated : u)),
      selectedUser:
        state.selectedUser?.id === updated.id ? updated : state.selectedUser,
    })),

  auditLogs: [],
  setAuditLogs: (logs) => set({ auditLogs: logs }),

  searchQuery: '',
  roleFilter: 'all',
  statusFilter: 'all',
  setSearchQuery: (q) => set({ searchQuery: q }),
  setRoleFilter: (r) => set({ roleFilter: r }),
  setStatusFilter: (s) => set({ statusFilter: s }),
  resetFilters: () => set({ searchQuery: '', roleFilter: 'all', statusFilter: 'all' }),

  selectedUser: null,
  selectedUserAudit: [],
  setSelectedUser: (user) => set({ selectedUser: user, selectedUserAudit: [] }),
  setSelectedUserAudit: (logs) => set({ selectedUserAudit: logs }),

  usersLoading: false,
  auditLoading: false,
  dashboardLoading: false,
  actionLoading: false,
  setUsersLoading: (l) => set({ usersLoading: l }),
  setAuditLoading: (l) => set({ auditLoading: l }),
  setDashboardLoading: (l) => set({ dashboardLoading: l }),
  setActionLoading: (l) => set({ actionLoading: l }),
}));
