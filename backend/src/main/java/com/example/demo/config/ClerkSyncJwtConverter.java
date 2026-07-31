package com.example.demo.config;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import com.example.demo.entity.UserEntity;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Converts a Clerk JWT into a Spring Security Authentication token.
 * 
 * CRITICAL FIX: Previously this used JwtGrantedAuthoritiesConverter which reads
 * from the JWT's scope/scp claims — NOT from the database role. This meant
 * @PreAuthorize("hasAuthority('ROLE_ADMIN')") would NEVER match.
 * 
 * Now we build authorities directly from the user's role stored in DB.
 */
@Component
@RequiredArgsConstructor
public class ClerkSyncJwtConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserRepository userRepository;

    // Valid roles in the system
    public static final String ROLE_USER  = "ROLE_USER";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_OWNER = "ROLE_OWNER";

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String userId   = jwt.getSubject();
        String email    = jwt.getClaimAsString("email");
        String rawUsername = jwt.getClaimAsString("username");
        final String username;

        // Derive username from email if not provided by Clerk
        if (rawUsername == null || rawUsername.isBlank()) {
            username = (email != null && email.contains("@"))
                    ? email.split("@")[0]
                    : "user_" + userId.substring(0, 8); // fallback
        } else {
            username = rawUsername;
        }

        // Read role from Clerk's custom claim (you set this in Clerk dashboard)
        String assignedRole = jwt.getClaimAsString("role");
        if (assignedRole == null || assignedRole.isBlank()) {
            assignedRole = ROLE_USER; // default entry role for all new signups
        }

        // Validate against known roles — reject unknown values to prevent privilege escalation
        String normalizedRole = switch (assignedRole.toUpperCase()) {
            case "ROLE_ADMIN" -> ROLE_ADMIN;
            case "ROLE_OWNER" -> ROLE_OWNER;
            default           -> ROLE_USER;
        };

        // Sync user into local DB (create if first login, update on every request)
        UserEntity user = userRepository.findById(userId)
                .orElseGet(() -> UserEntity.builder()
                        .id(userId)
                        .username(username)
                        .email(email != null ? email : "")
                        .role(normalizedRole)
                        .isActive(true)
                        .postCount(0)
                        .likeCount(0)
                        .commentCount(0)
                        .projectCount(0)
                        .createdAt(Instant.now())
                        .editedAt(Instant.now())
                        .build());

        // Update mutable fields on every request (keeps DB in sync with Clerk)
        user.setUsername(username);
        user.setEmail(email != null ? email : user.getEmail());
        user.setEditedAt(Instant.now());

        // Only let JWT claim OVERRIDE the DB role for non-admin entries.
        // This prevents a compromised Clerk claim from demoting an admin.
        // Owners set via direct DB insert are never overridden.
        if (!user.getRole().equals(ROLE_ADMIN) && !user.getRole().equals(ROLE_OWNER)) {
            user.setRole(normalizedRole);
        }

        userRepository.save(user);

        // ★★★ THE FIX: Build authorities from the DB role, not JWT scope claims ★★★
        Collection<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority(user.getRole())
        );

        return new JwtAuthenticationToken(jwt, authorities);
    }
}