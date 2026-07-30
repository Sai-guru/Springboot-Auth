package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.UserEntity;
import com.example.demo.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*") // Adjust to your Frontend port later

@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

        // 1. avail to all authenticated users (User, Admin, Owner)
    @GetMapping("/me")
    public ResponseEntity<UserEntity> getMyDashboard() {

        return ResponseEntity.ok(dashboardService.getMyDashboardMetrics());
    }

    // 2. Only Admins and Owners can manipulate/view other specific user data
    @GetMapping("/user/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_OWNER')")
    public ResponseEntity<UserEntity> getUserDashboardById(@PathVariable String id) {

        return ResponseEntity.ok(dashboardService.getUserMetricsById(id));
    }

    // 3. Only Owners can see the global overview
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<List<UserEntity>> getAllDashboards() {
        
        return ResponseEntity.ok(dashboardService.getAllUserMetrics());
    }
}
