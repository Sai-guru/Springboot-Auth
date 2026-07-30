package com.example.demo.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.example.demo.entity.UserEntity;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;

    // Fetches the dashboard info for the currently logged in user
    public UserEntity getMyDashboardMetrics() {

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findById(currentUserId).orElseThrow(()->new RuntimeException("User profile out of sync."));
    }

    // Admins and Owners can fetch any user profile metrics
    public UserEntity getUserMetricsById(String userId) {
         
        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found."));
    }

    // Owners can look at across-the-board user summaries
    public List<UserEntity> getAllUserMetrics() {
        
        return userRepository.findAll();
    }
}