/**
 * API client for Spring Boot RBAC backend.
 * All requests proxy through Next.js API routes to avoid CORS.
 */

import type { UserEntity, AdminAuditEntity, ApiError } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Helpers ──

// ── Direct fetch (for non-authed or server-side use) ──

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      status: res.status,
      error: res.statusText,
      message: res.statusText,
      path,
      timestamp: new Date().toISOString(),
    }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Fetch with Clerk JWT attached.
 * Use this in Client Components where we can get the token from useAuth().
 */
export async function authedFetch<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      status: res.status,
      error: res.statusText,
      message: res.statusText,
      path,
      timestamp: new Date().toISOString(),
    }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Dashboard API (3 endpoints) ──

/** GET /api/dashboard/me — Any authenticated user */
export const fetchMyDashboard = (token: string) =>
  authedFetch<UserEntity>('/api/dashboard/me', token);

/** GET /api/dashboard/user/{id} — Admin+ */
export const fetchUserDashboard = (token: string, id: string) =>
  authedFetch<UserEntity>(`/api/dashboard/user/${id}`, token);

/** GET /api/dashboard/all — Owner only */
export const fetchAllDashboards = (token: string) =>
  authedFetch<UserEntity[]>('/api/dashboard/all', token);

// ── Admin User Management API (7 endpoints) ──

/** GET /api/admin/users — Admin+ */
export const fetchAllUsers = (token: string) =>
  authedFetch<UserEntity[]>('/api/admin/users', token);

/** GET /api/admin/users/role?role=X — Admin+ */
export const fetchUsersByRole = (token: string, role: string) =>
  authedFetch<UserEntity[]>(`/api/admin/users/role?role=${role}`, token);

/** GET /api/admin/users/banned — Admin+ */
export const fetchBannedUsers = (token: string) =>
  authedFetch<UserEntity[]>('/api/admin/users/banned', token);

/** PATCH /api/admin/users/{id}/role — Admin+ */
export const changeUserRole = (token: string, userId: string, role: string, notes?: string) =>
  authedFetch<UserEntity>(`/api/admin/users/${userId}/role`, token, {
    method: 'PATCH',
    body: JSON.stringify({ role, notes }),
  });

/** PATCH /api/admin/users/{id}/ban — Admin+ */
export const banUser = (token: string, userId: string, notes?: string) =>
  authedFetch<UserEntity>(`/api/admin/users/${userId}/ban`, token, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });

/** PATCH /api/admin/users/{id}/unban — Admin+ */
export const unbanUser = (token: string, userId: string, notes?: string) =>
  authedFetch<UserEntity>(`/api/admin/users/${userId}/unban`, token, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });

/** PATCH /api/admin/users/{id}/profile — Admin+ */
export const editUserProfile = (
  token: string,
  userId: string,
  data: {
    username?: string;
    email?: string;
    postCount?: number;
    likeCount?: number;
    commentCount?: number;
    projectCount?: number;
  }
) =>
  authedFetch<UserEntity>(`/api/admin/users/${userId}/profile`, token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// ── Audit Log API (2 endpoints) ──

/** GET /api/admin/audit/user/{id} — Admin+ */
export const fetchUserAuditLog = (token: string, userId: string) =>
  authedFetch<AdminAuditEntity[]>(`/api/admin/audit/user/${userId}`, token);

/** GET /api/admin/audit — Owner only */
export const fetchFullAuditLog = (token: string) =>
  authedFetch<AdminAuditEntity[]>('/api/admin/audit', token);
