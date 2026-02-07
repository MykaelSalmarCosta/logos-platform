package com.Mysco.Logos.dto.post;

import com.Mysco.Logos.model.Curso;
import com.Mysco.Logos.model.Post;
import com.Mysco.Logos.model.StatusTopico;

import java.time.LocalDateTime;

public record PostListDTO(
        Long id,
        String title,
        String content,
        LocalDateTime createdAt,
        StatusTopico status,
        String author,
        Curso curso
) {

    public PostListDTO(Post post) {
        this(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCreatedAt(),
                post.getStatus(),
                post.getAuthor().getUsername(),
                post.getCurso()
        );
    }
}
