package com.Mysco.Logos.controller;

import com.Mysco.Logos.dto.post.PostUpdateDTO;
import com.Mysco.Logos.dto.post.PostCreateDTO;
import com.Mysco.Logos.dto.post.PostResponseDTO;
import com.Mysco.Logos.dto.post.PostListDTO;
import com.Mysco.Logos.model.Post;
import com.Mysco.Logos.repository.PostRepository;
import com.Mysco.Logos.repository.UserRepository;
import com.Mysco.Logos.service.PostService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostService postService;

    @PostMapping
    @Transactional
    public ResponseEntity<PostResponseDTO> create(
            @RequestBody @Valid PostCreateDTO dto
    ) {
        PostResponseDTO response = postService.create(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public Page<PostListDTO> list(
            @PageableDefault(size = 10, sort = "createdAt")Pageable pageable
            ) {
        return postRepository
                .findAll(pageable)
                .map(PostListDTO::new);
    }

    @GetMapping("/{id}")
    public PostResponseDTO getById(@PathVariable Long id) {
        Post post = postRepository.getReferenceById(id);
        return new PostResponseDTO(post);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<PostResponseDTO> update(
            @PathVariable Long id,
            @RequestBody@Valid PostUpdateDTO dto,
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
