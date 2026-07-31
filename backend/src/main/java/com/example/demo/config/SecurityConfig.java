package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableMethodSecurity // Enforces RBAC method level security via @PreAuthorize
@RequiredArgsConstructor
public class SecurityConfig {

    private final ClerkSyncJwtConverter clerkSyncJwtConverter;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
        .cors(cors -> cors.configurationSource(request -> {
            var config = new org.springframework.web.cors.CorsConfiguration();
            config.setAllowedOrigins(java.util.List.of("http://localhost:3000")); 
            config.setAllowedMethods(java.util.List.of("GET","POST","PUT","DELETE"));

            config.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type"));
            config.setAllowCredentials(true);
            config.setMaxAge(3600L);
            return config;
        }))
        .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll() // Actuator monitoring endpoints
                .anyRequest().authenticated())

                
            .oauth2ResourceServer(oauth2-> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(clerkSyncJwtConverter)));
            
        return http.build();

    }


}
