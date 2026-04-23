package com.Mysco.Logos.controller;

import com.Mysco.Logos.dto.post.PostCreateDTO;
import com.Mysco.Logos.dto.post.PostListDTO;
import com.Mysco.Logos.dto.post.PostResponseDTO;
import com.Mysco.Logos.dto.post.PostUpdateDTO;
import com.Mysco.Logos.service.PostService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<PostResponseDTO> create(
            @RequestBody @Valid PostCreateDTO dto,
            Authentication authentication
    ) {
        PostResponseDTO response = postService.create(dto, authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public Page<PostListDTO> list(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return postService.list(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getById(id));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<PostResponseDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid PostUpdateDTO dto,
            Authentication authentication
    ) {
        PostResponseDTO updated = postService.updatePost(id, dto, authentication);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/close")
    @Transactional
    public ResponseEntity<Void> closePost(
            @PathVariable Long id,
            Authentication authentication
    ) {
        postService.closePost(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
