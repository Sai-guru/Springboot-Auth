package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.AdminAuditEntity;
import com.example.demo.entity.UserEntity;
import com.example.demo.service.RoleManagementService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

// Admin/Owner endpoints for managing users, roles, and bans.This is the controller that gives the our "separate table" power to edit the users table.
 
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class RoleManagementController {

    private final RoleManagementService roleManagementService;

    // GET /api/admin/users — List all users (admin+ only)
    @GetMapping("/users")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_OWNER')")
    public ResponseEntity<List<UserEntity>> getAllUsers() {

        
        return ResponseEntity.ok(roleManagementService.getAllUsers());
    }

    //GET /api/admin/users?role=ROLE_USER — Filter users by role 
    @GetMapping("/users/role")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_OWNER')")
    public ResponseEntity<List<UserEntity>> getUsersByRole(@RequestParam String role) {

        return ResponseEntity.ok(roleManagementService.getUsersByRole(role));
    }

    //GET /api/admin/users/banned — List all banned users 
    @GetMapping("/users/banned")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_OWNER')")
    public ResponseEntity<List<UserEntity>> getBannedUsers() {

        return ResponseEntity.ok(roleManagementService.getBannedUsers());
    }

    //GET /api/admin/audit/user/{id} — Audit log for one user...
    @GetMapping("/audit/user/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_OWNER')")
    public ResponseEntity<List<AdminAuditEntity>> getUserAuditLog(@PathVariable String id) {

        return ResponseEntity.ok(roleManagementService.getUserAuditLog(id));
    }

    //GET /api/admin/audit — Full audit log (only OWNER here)
    @GetMapping("/audit")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<List<AdminAuditEntity>> getFullAuditLog() {

        return ResponseEntity.ok(roleManagementService.getFullAuditLog());
    }

    //  WRITE endpoints 

    //PATCH /api/admin/users/{id}/role — Change a user's role
    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_OWNER')")
    public ResponseEntity<UserEntity> changeRole(@PathVariable String id, @RequestBody RoleChangeRequest req) {

        return ResponseEntity.ok(roleManagementService.changeRole(id, req.getRole(), req.getNotes()));
    }

    //PATCH /api/admin/users/{id}/ban — Ban a user
    @PatchMapping("/users/{id}/ban")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_OWNER')")
    public ResponseEntity<UserEntity> banUser(@PathVariable String id, @RequestBody ActionRequest req) {

        return ResponseEntity.ok(roleManagementService.banUser(id, req.getNotes()));
    }

    //PATCH /api/admin/users/{id}/unban — Unban a user
    @PatchMapping("/users/{id}/unban")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_OWNER')")
    public ResponseEntity<UserEntity> unbanUser(@PathVariable String id,@RequestBody ActionRequest req) {

        return ResponseEntity.ok(roleManagementService.unbanUser(id, req.getNotes()));
    }

    //PATCH /api/admin/users/{id}/profile — Admin edits a user's profile
    @PatchMapping("/users/{id}/profile")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_OWNER')")
    public ResponseEntity<UserEntity> editUserProfile( @PathVariable String id, @RequestBody ProfileEditRequest req) {

        return ResponseEntity.ok(roleManagementService.editUserProfile(
                id, req.getUsername(), req.getEmail(),  req.getPostCount(), req.getLikeCount(),
                req.getCommentCount(), req.getProjectCount()));
    }

    // Request DTOs -inner classes to keep it simple and easy to manage btw

    @Data
    public static class RoleChangeRequest {
        private String role;  // new role
        private String notes; // optional reason
    }

    @Data
    public static class ActionRequest {
        private String notes; // optional reason
    }

    @Data
    public static class ProfileEditRequest {
        private String username;
        private String email;
        private Long postCount;
        private Long likeCount;
        private Long commentCount;
        private Long projectCount;
    }
}
