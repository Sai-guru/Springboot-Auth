package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.AdminAuditEntity;

public interface AdminAuditRepository extends JpaRepository<AdminAuditEntity, String> {

    //  All actions performed on a specific user 
    List<AdminAuditEntity> findByTargetUserIdOrderByCreatedAtDesc(String targetUserId);

    //  All actions performed by a specific admin 
    List<AdminAuditEntity> findByActorIdOrderByCreatedAtDesc(String actorId);

    //  Filter by action type 
    List<AdminAuditEntity> findByActionTypeOrderByCreatedAtDesc(String actionType);
}