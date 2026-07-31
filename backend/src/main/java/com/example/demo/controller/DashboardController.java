package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.UserEntity;
import com.example.demo.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
// @CrossOrigin removed — SecurityConfig already handles CORS.
// Having both causes Spring to apply CORS twice which can cause issues.
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /** Available to ALL authenticated users (USER, ADMIN, OWNER) */
    @GetMapping("/me")
     @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_OWNER')")
    public ResponseEntity<UserEntity> getMyDashboard() {
        return ResponseEntity.ok(dashboardService.getMyDashboardMetrics());
    }

    /** Only Admins and Owners can view other specific user data */
    @GetMapping("/user/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_OWNER')")
    public ResponseEntity<UserEntity> getUserDashboardById(@PathVariable String id) {
        return ResponseEntity.ok(dashboardService.getUserMetricsById(id));
    }

    /** Only Owners can see the global overview */
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<List<UserEntity>> getAllDashboards() {
        return ResponseEntity.ok(dashboardService.getAllUserMetrics());
    }
}