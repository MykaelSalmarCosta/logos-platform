package com.Mysco.Logos.dto.post;

import com.Mysco.Logos.model.Post;
import com.Mysco.Logos.model.StatusTopico;
import com.Mysco.Logos.model.Tema;

import java.time.LocalDateTime;

public record PostListDTO(
        Long id,
        String title,
        String content,
        LocalDateTime createdAt,
        StatusTopico status,
        String author,
        Tema tema
) {

    public PostListDTO(Post post) {
        this(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCreatedAt(),
                post.getStatus(),
                post.getAuthor().getDisplayName(),
                Tema.normalizar(post.getTema())
        );
    }
}
