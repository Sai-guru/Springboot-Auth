package com.example.demo.config;

import java.time.Instant;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import com.example.demo.entity.UserEntity;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ClerkSyncJwtConverter implements Converter<Jwt, AbstractAuthenticationToken>{

    private final UserRepository userRepository;
    private final JwtGrantedAuthoritiesConverter authoritiesConverter= new JwtGrantedAuthoritiesConverter();


    @Override
    public AbstractAuthenticationToken convert(Jwt jwt){
        String userId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String username = jwt.getClaimAsString("username");

        if(username == null && email!=null) username = email.split("@")[0];

        String assignedRole = jwt.getClaimAsString("role");

        if (assignedRole == null) assignedRole = "ROLE_USER"; //by default...

        UserEntity user = userRepository.findById(userId)
        .orElseGet(()-> UserEntity.builder()
        .id(userId)
        .createdAt(Instant.now())
        .build());

        user.setUsername(username);
        user.setEmail(email);
        user.setRole(assignedRole);
        user.setEditedAt(Instant.now());

        userRepository.save(user);
        return new JwtAuthenticationToken(jwt,authoritiesConverter.convert(jwt));
        
    }

}
