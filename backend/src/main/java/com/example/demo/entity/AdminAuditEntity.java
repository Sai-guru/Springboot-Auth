package com.example.demo.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


//  Audit log for every admin/owner action that changes a user's record.
//  to edit the users table — this IS that separate table. Every role change, ban, unban, or profile edit by an admin is recorded here.
//  Owners can query this to see who did what and when.

@Entity
@Table(name = "admin_audit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAuditEntity {

    @Id
    private String id; // UUID — generate in service layer, so no need for @GeneratedValue and etc.here

//    The admin/owner who performed the action 
    @Column(nullable = false)
    private String actorId;

    @Column(nullable = false)
    private String actorRole;

//    The target user who was damaged 
    @Column(nullable = false)
    private String targetUserId;

    @Column(nullable = false)
    private String targetPreviousRole;

    @Column(nullable = false)
    private String targetNewRole;

    @Column(nullable = false)
    private String actionType; // ROLE_CHANGE, BAN, UNBAN, PROFILE_EDIT

    @Column(nullable = true, length = 500)
    private String notes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}