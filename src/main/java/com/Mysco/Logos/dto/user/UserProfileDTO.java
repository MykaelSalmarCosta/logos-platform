package com.Mysco.Logos.dto.user;

import com.Mysco.Logos.model.User;

import java.time.LocalDateTime;

public record UserProfileDTO(
        String username,
        String email,
        LocalDateTime createdAt
) {
    public UserProfileDTO(User user) {
        this(
                user.getDisplayName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }
}
