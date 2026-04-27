package com.Mysco.Logos.dto.comment;

import com.Mysco.Logos.model.Comment;

import java.time.LocalDateTime;

public record CommentResponseDTO(
        Long id,
        String content,
        LocalDateTime createdAt,
        String author,
        Long postId
) {

    public CommentResponseDTO(Comment comment) {
        this(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getAuthor().getDisplayName(),
                comment.getPost().getId()
        );
    }
}
