# 🛡️ RBAC Backend — Spring Boot + Clerk JWT

A role-based access control REST API built with **Spring Boot**, **Spring Security OAuth2**, and **Clerk** as the identity provider.

---

## 🎯 What It Does

- Authenticates every request via **Clerk JWT** tokens
- Auto-creates users on first login (synced from Clerk → local DB)
- Enforces 3-tier role hierarchy: **User → Admin → Owner**
- Provides full user management API for admins
- Soft-bans users at the filter level (blocked before reaching any controller)
- Records every admin action in an immutable audit log

---

## 👥 Roles

| Role | Access Level |
|---|---|
| `ROLE_USER` | View own dashboard only |
| `ROLE_ADMIN` | Manage users, change roles (USER↔ADMIN), ban/unban, view audit logs |
| `ROLE_OWNER` | Full system control — promote/demote anyone, view all audit trails |

> 📌 New signups always get `ROLE_USER` by default. Admins/Owners are assigned directly in the DB.

---

## 🔑 How Auth Works

```
Clerk (JWT) → Spring Security → ClerkSyncJwtConverter → DB Sync → Controller
```

1. User signs in via Clerk and gets a JWT
2. Every API request includes `Authorization: Bearer <jwt>`
3. `ClerkSyncJwtConverter` extracts user info from the JWT
4. User is looked up (or created) in the local `users` table
5. **Authorities are built from the DB role** — not from JWT scope claims
6. Admin/Owner roles in DB are **protected from JWT override** (prevents privilege escalation)
7. Request flows to the controller with correct `@PreAuthorize` enforcement

### 🚫 Banned Users

A `BannedUserFilter` runs after JWT auth but **before** any controller. If `isActive = false`, the user gets `403 Forbidden` immediately — even with a valid Clerk session.

---

## 📡 API Endpoints

All endpoints (except `/actuator/**`) require a valid Clerk JWT in the `Authorization` header.

### Dashboard

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/me` | Any | Current user's stats |
| `GET` | `/api/dashboard/user/{id}` | Admin+ | Another user's stats |
| `GET` | `/api/dashboard/all` | Owner | All users' stats |

### 👑 User Management

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/admin/users` | Admin+ | List all users |
| `GET` | `/api/admin/users/role?role=X` | Admin+ | Filter users by role |
| `GET` | `/api/admin/users/banned` | Admin+ | List banned users |
| `PATCH` | `/api/admin/users/{id}/role` | Admin+ | Change a user's role |
| `PATCH` | `/api/admin/users/{id}/ban` | Admin+ | Ban a user |
| `PATCH` | `/api/admin/users/{id}/unban` | Admin+ | Unban a user |
| `PATCH` | `/api/admin/users/{id}/profile` | Admin+ | Edit profile fields & counters |

### 📋 Audit Log

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/admin/audit/user/{id}` | Admin+ | One user's action history |
| `GET` | `/api/admin/audit` | Owner | Full system audit trail |

### ⚙️ Health

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/actuator/**` | Public | Health checks |

---

## 📦 Request / Response Examples

### Change a user's role

```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{"role": "ROLE_ADMIN", "notes": "Promoted for moderation"}' \
  http://localhost:5000/api/admin/users/user_2abcDEF456/role
```

**Response `200`:** The updated user object

**Error `400`:**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Admins cannot modify OWNER accounts. Only an Owner can do that.",
  "path": "/api/admin/users/user_xxx/role",
  "timestamp": "2025-07-31T01:30:00Z"
}
```

---

## 🗄️ Database Tables

### `users` — Local user mirror + app data

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | String (PK) | — | Clerk user ID |
| `username` | String | — | Display name |
| `email` | String | — | Email address |
| `role` | String | `ROLE_USER` | RBAC role |
| `isActive` | Boolean | `true` | Soft-ban flag |
| `postCount` | Long | `0` | Post counter |
| `likeCount` | Long | `0` | Like counter |
| `commentCount` | Long | `0` | Comment counter |
| `projectCount` | Long | `0` | Project counter |
| `createdAt` | Instant | — | First login |
| `editedAt` | Instant | — | Last sync |

### `admin_audit` — Immutable action log

| Column | Type | Description |
|---|---|---|
| `id` | String (PK) | UUID |
| `actorId` | String | Who performed the action |
| `actorRole` | String | Actor's role at the time |
| `targetUserId` | String | Who was affected |
| `targetPreviousRole` | String | Role before the action |
| `targetNewRole` | String | Role after the action |
| `actionType` | String | `ROLE_CHANGE`, `BAN`, `UNBAN`, or `PROFILE_EDIT` |
| `notes` | String | Optional reason (max 500 chars) |
| `createdAt` | Instant | When it happened |

---

## 🏗️ Project Structure

```
com.example.demo
├── config/
│   ├── SecurityConfig.java           # CORS, CSRF, OAuth2 resource server
│   ├── ClerkSyncJwtConverter.java    # JWT → AuthenticationToken + DB sync
│   └── BannedUserFilter.java         # Blocks banned users at filter level
├── controller/
│   ├── DashboardController.java      # /api/dashboard/* (3 endpoints)
│   └── RoleManagementController.java # /api/admin/* (10 endpoints)
├── service/
│   ├── DashboardService.java         # Dashboard business logic
│   └── RoleManagementService.java    # Admin operations + business rules
├── repository/
│   ├── UserRepository.java           # User CRUD + custom queries
│   └── AdminAuditRepository.java     # Audit log queries
├── entity/
│   ├── UserEntity.java               # Users table mapping
│   └── AdminAuditEntity.java         # Admin audit table mapping
└── common/
    ├── Roles.java                    # Role constants + validator
    ├── AppExceptions.java             # Structured exception hierarchy
    ├── ErrorResponseDto.java          # Standard error JSON body
    └── GlobalExceptionHandler.java    # Catches all exceptions → clean JSON
```

---

## 🛡️ Security Rules

| Rule | Detail |
|---|---|
| You cannot change your own role | Prevents accidental lockout |
| Admins cannot modify Owner accounts | Only Owners can touch Owners |
| Admins can only change USER↔ADMIN | Cannot grant OWNER role |
| DB role overrides JWT claim | For ADMIN/OWNER, DB is the source of truth |
| Banned users blocked at filter | Never reaches any controller, even with valid JWT |
| All admin actions are audited | Every role change, ban, and profile edit is logged |

---

## ⚙️ Configuration

Required in `application.yml`:

```yaml
Just look into the application.example.yaml
```

---

## 🚀 Quick Start

```bash
# 1. Set up your .env / application.yml with Clerk issuer URI

# 2. Run the app
./mvnw spring-boot:run

# 3. Create a Clerk account and get your JWT

# 4. Make yourself OWNER directly in the DB
# UPDATE users SET role = 'ROLE_OWNER' WHERE id = 'your_clerk_user_id';

# 5. Test with curl
curl -H "Authorization: Bearer YOUR_JWT" http://localhost:5000/api/dashboard/me
```

## 👤 Author

[**Prigeesh**](https://github.com/Sai-guru)

Arch Linux | SpringBoot | PostgreSQL | Clerk JWT-OAuth | Lombok | Maven

Always fell free to discuss...
