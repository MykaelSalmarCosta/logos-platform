package com.Mysco.Logos.service;

import com.Mysco.Logos.dto.user.UserCreateDTO;
import com.Mysco.Logos.dto.user.UserProfileDTO;
import com.Mysco.Logos.exception.BusinessRuleException;
import com.Mysco.Logos.exception.ResourceNotFoundException;
import com.Mysco.Logos.model.User;
import com.Mysco.Logos.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository repository,
            PasswordEncoder passwordEncoder
    ) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Long create(UserCreateDTO dto) {
        repository.findByEmail(dto.email())
                .ifPresent(user -> {
                    throw new BusinessRuleException("Email ja cadastrado");
                });

        User user = new User(dto);
        user.setPassword(passwordEncoder.encode(dto.password()));

        return repository.save(user).getId();
    }

    public UserProfileDTO getProfile(Authentication authentication) {
        return new UserProfileDTO(getAuthenticatedUser(authentication));
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationCredentialsNotFoundException("Usuario nao autenticado");
        }

        String email = authentication.getName();

        return repository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado"));
    }
}
