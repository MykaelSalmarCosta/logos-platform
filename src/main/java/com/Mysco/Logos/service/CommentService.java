package com.Mysco.Logos.service;

import com.Mysco.Logos.dto.comment.CommentCreateDTO;
import com.Mysco.Logos.dto.comment.CommentResponseDTO;
import com.Mysco.Logos.exception.ResourceNotFoundException;
import com.Mysco.Logos.model.Comment;
import com.Mysco.Logos.model.Post;
import com.Mysco.Logos.model.User;
import com.Mysco.Logos.repository.CommentRepository;
import com.Mysco.Logos.repository.PostRepository;
import com.Mysco.Logos.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentService(
            CommentRepository commentRepository,
            PostRepository postRepository,
            UserRepository userRepository
    ) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CommentResponseDTO> listByPost(Long postId) {
        getPostOrThrow(postId);

        return commentRepository.findByPostIdWithAuthorOrderByCreatedAtAsc(postId)
                .stream()
                .map(CommentResponseDTO::new)
                .toList();
    }

    @Transactional
    public CommentResponseDTO create(Long postId, CommentCreateDTO dto, Authentication authentication) {
        User author = getLoggedUser(authentication);
        Post post = getPostOrThrow(postId);
        Comment comment = new Comment(dto.content(), post, author);

        commentRepository.save(comment);
        return new CommentResponseDTO(comment);
    }

    private Post getPostOrThrow(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post nao encontrado"));
    }

    private User getLoggedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationCredentialsNotFoundException("Usuario nao autenticado");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado"));
    }
}
