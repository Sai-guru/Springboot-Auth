// ── Role & Action types matching Spring Boot backend ──

export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_OWNER';
export type ActionType = 'ROLE_CHANGE' | 'BAN' | 'UNBAN' | 'PROFILE_EDIT';
export type DashboardView = 'overview' | 'users' | 'audit';

// ── UserEntity — mirrors com.example.demo.entity.UserEntity ──

export interface UserEntity {
  id: string;
  username: string | null;
  email: string | null;
  role: UserRole;
  isActive: boolean;
  postCount: number;
  likeCount: number;
  commentCount: number;
  projectCount: number;
  createdAt: string;
  editedAt: string;
}

// ── AdminAuditEntity — mirrors com.example.demo.entity.AdminAuditEntity ──

export interface AdminAuditEntity {
  id: string;
  actorId: string;
  actorRole: string;
  targetUserId: string;
  targetPreviousRole: string;
  targetNewRole: string;
  actionType: ActionType;
  notes: string | null;
  createdAt: string;
}

// ── API Error ──

export interface ApiError {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  details?: string[];
}
