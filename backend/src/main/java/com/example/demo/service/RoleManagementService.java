package com.example.demo.service;

import static com.example.demo.common.Roles.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.common.AppExceptions.*;
import com.example.demo.entity.AdminAuditEntity;
import com.example.demo.entity.UserEntity;
import com.example.demo.repository.AdminAuditRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Handles all admin/owner operations on the users table.
 * This is the "separate table having the power to edit the users table" you asked about.
 *
 * Business rules:
 * - ADMIN can: view all users, change roles (USER <-> ADMIN only), ban/unban users
 * - OWNER can: everything ADMIN can + change any role including OWNER, view audit logs
 * - No one can change their own role (prevents privilege lockout)
 * - Banned users are soft-banned (isActive=false), not deleted
 */
@Service
@RequiredArgsConstructor
public class RoleManagementService {

    private final UserRepository userRepository;
    private final AdminAuditRepository auditRepository;

    // ── Helpers ──────────────────────────────────────────────

    private String currentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private String currentUserRole() {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().iterator().next().getAuthority();
    }

    private void audit(String targetId, String previousRole, String newRole,
                       String actionType, String notes) {
        AdminAuditEntity audit = AdminAuditEntity.builder()
                .id(UUID.randomUUID().toString())
                .actorId(currentUserId())
                .actorRole(currentUserRole())
                .targetUserId(targetId)
                .targetPreviousRole(previousRole)
                .targetNewRole(newRole)
                .actionType(actionType)
                .notes(notes)
                .createdAt(Instant.now())
                .build();
        auditRepository.save(audit);
    }

    // ── Read operations ──────────────────────────────────────

    /** All users (admin+ only) */
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    /** Users filtered by role */
    public List<UserEntity> getUsersByRole(String role) {
        if (!isValid(role)) throw new InvalidRoleException(role);
        return userRepository.findByRole(role);
    }

    /** Banned users */
    public List<UserEntity> getBannedUsers() {
        return userRepository.findByIsActiveFalse();
    }

    /** Audit log for a specific user */
    public List<AdminAuditEntity> getUserAuditLog(String targetUserId) {
        return auditRepository.findByTargetUserIdOrderByCreatedAtDesc(targetUserId);
    }

    /** Full audit log (owner only — enforced at controller level) */
    public List<AdminAuditEntity> getFullAuditLog() {
        return auditRepository.findAll();
    }

    // ── Write operations ─────────────────────────────────────

    /**
     * Change a user's role.
     *
     * ADMIN can change: USER -> ADMIN, ADMIN -> USER
     * OWNER can change: anything -> anything
     */
    @Transactional
    public UserEntity changeRole(String targetUserId, String newRole, String notes) {
        if (!isValid(newRole)) throw new InvalidRoleException(newRole);

        String actorId   = currentUserId();
        String actorRole = currentUserRole();

        // Can't change your own role
        if (actorId.equals(targetUserId)) {
            throw new SelfActionNotAllowedException("You cannot change your own role.");
        }

        UserEntity target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new UserNotFoundException(targetUserId));

        String previousRole = target.getRole();

        // ADMIN cannot grant or modify OWNER role
        if (ADMIN.equals(actorRole) && (OWNER.equals(newRole) || OWNER.equals(previousRole))) {
            throw new RoleChangeNotAllowedException(
                    "Admins cannot modify OWNER accounts. Only an Owner can do that.");
        }

        // No-op check
        if (previousRole.equals(newRole)) {
            return target; // already has this role, skip
        }

        target.setRole(newRole);
        target.setEditedAt(Instant.now());
        userRepository.save(target);

        audit(targetUserId, previousRole, newRole, "ROLE_CHANGE", notes);

        return target;
    }

    /** Soft-ban a user */
    @Transactional
    public UserEntity banUser(String targetUserId, String notes) {
        String actorId = currentUserId();
        if (actorId.equals(targetUserId)) {
            throw new SelfActionNotAllowedException("You cannot ban yourself.");
        }

        UserEntity target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new UserNotFoundException(targetUserId));

        // Owners can't be banned by admins
        if (OWNER.equals(target.getRole()) && !OWNER.equals(currentUserRole())) {
            throw new RoleChangeNotAllowedException("Only an Owner can ban another Owner.");
        }

        if (!target.isActive()) {
            return target; // already banned
        }

        target.setActive(false);
        target.setEditedAt(Instant.now());
        userRepository.save(target);

        audit(targetUserId, target.getRole(), target.getRole(), "BAN", notes);

        return target;
    }

    /** Unban a user */
    @Transactional
    public UserEntity unbanUser(String targetUserId, String notes) {
        UserEntity target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new UserNotFoundException(targetUserId));

        if (target.isActive()) {
            return target; // already active
        }

        target.setActive(true);
        target.setEditedAt(Instant.now());
        userRepository.save(target);

        audit(targetUserId, target.getRole(), target.getRole(), "UNBAN", notes);

        return target;
    }

    /** Admin edits a user's profile fields (username, email, counters) */
    @Transactional
    public UserEntity editUserProfile(String targetUserId,
                                       String newUsername, String newEmail,
                                       Long postCount, Long likeCount, Long commentCount, Long projectCount) {
        UserEntity target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new UserNotFoundException(targetUserId));

        if (newUsername != null) target.setUsername(newUsername);
        if (newEmail != null)    target.setEmail(newEmail);
        if (postCount != null)    target.setPostCount(postCount);
        if (likeCount != null)    target.setLikeCount(likeCount);
        if (commentCount != null) target.setCommentCount(commentCount);
        if (projectCount != null) target.setProjectCount(projectCount);

        target.setEditedAt(Instant.now());
        userRepository.save(target);

        audit(targetUserId, target.getRole(), target.getRole(), "PROFILE_EDIT",
                "Admin edited profile fields");

        return target;
    }
}