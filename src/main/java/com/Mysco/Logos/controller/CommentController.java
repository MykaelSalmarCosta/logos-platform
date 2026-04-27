package com.Mysco.Logos.controller;

import com.Mysco.Logos.dto.comment.CommentCreateDTO;
import com.Mysco.Logos.dto.comment.CommentResponseDTO;
import com.Mysco.Logos.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/posts/{postId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public List<CommentResponseDTO> list(@PathVariable Long postId) {
        return commentService.listByPost(postId);
    }

    @PostMapping
    public ResponseEntity<CommentResponseDTO> create(
            @PathVariable Long postId,
            @RequestBody @Valid CommentCreateDTO dto,
            Authentication authentication
    ) {
        CommentResponseDTO response = commentService.create(postId, dto, authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
