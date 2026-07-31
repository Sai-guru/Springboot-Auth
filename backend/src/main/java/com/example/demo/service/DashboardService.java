package com.example.demo.service;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.demo.common.AppExceptions.UserBannedException;
import com.example.demo.common.AppExceptions.UserNotFoundException;
import com.example.demo.entity.UserEntity;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;

   
    //  Fetches dashboard info for the currently logged-in user.
    //  Also checks if the user is banned and throws if so.
     
    public UserEntity getMyDashboardMetrics() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = auth.getName();

        UserEntity user = userRepository.findById(currentUserId).orElseThrow(()->new UserNotFoundException(currentUserId));

        if (!user.isActive()) {
            throw new UserBannedException();
        }
        return user;
    }

    // Admins and Owners can fetch any user's profile metrics 
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_OWNER')") 
    public UserEntity getUserMetricsById(String userId) {

        return userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));

    }

    // Owners can see across-the-board user summaries 
    @PreAuthorize("hasAuthority('ROLE_OWNER')") 
    public List<UserEntity> getAllUserMetrics() {

        return userRepository.findAll();
    }
}