package com.example.demo.config;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.entity.UserEntity;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Runs AFTER JWT authentication (ordered after security filter chain).
 * Checks if the authenticated user is banned (isActive=false).
 * If banned, rejects the request with 403 BEFORE it reaches any controller.
 *
 * Without this, a banned admin could still hit admin endpoints if their
 * Clerk JWT session hasn't expired yet.
 */
@Component
@RequiredArgsConstructor
@Order(Ordered.LOWEST_PRECEDENCE - 1) // runs after security filters, before controllers
public class BannedUserFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain filterChain)throws ServletException,IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            UserEntity user = userRepository.findById(auth.getName()).orElse(null);

            if (user != null && !user.isActive()) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write(
                    "{\"status\":403,\"error\":\"Forbidden\","
                    + "\"message\":\"This account has been suspended.\","
                    + "\"timestamp\":\"" + java.time.Instant.now() + "\"}"
                );
                return; // stop the filter chain — req never reaches controller
            }
        }

        filterChain.doFilter(request, response);
    }
}