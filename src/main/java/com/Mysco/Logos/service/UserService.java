package com.Mysco.Logos.service;

import com.Mysco.Logos.dto.user.UserCreateDTO;
import com.Mysco.Logos.model.User;
import com.Mysco.Logos.repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
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
                .ifPresent(u -> {
                            throw new IllegalStateException("Email já cadastrado");
                        });

        User user = new User(dto);
        user.setPassword(passwordEncoder.encode(dto.password()));

        return repository.save(user).getId();
    }
}
