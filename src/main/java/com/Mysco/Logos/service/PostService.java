package com.Mysco.Logos.service;

import com.Mysco.Logos.dto.post.PostCreateDTO;
import com.Mysco.Logos.dto.post.PostListDTO;
import com.Mysco.Logos.dto.post.PostResponseDTO;
import com.Mysco.Logos.dto.post.PostUpdateDTO;
import com.Mysco.Logos.exception.ForbiddenOperationException;
import com.Mysco.Logos.exception.ResourceNotFoundException;
import com.Mysco.Logos.model.Post;
import com.Mysco.Logos.model.User;
import com.Mysco.Logos.repository.PostRepository;
import com.Mysco.Logos.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(
            PostRepository postRepository,
            UserRepository userRepository
    ) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public PostResponseDTO create(PostCreateDTO dto, Authentication authentication) {
        User author = getLoggedUser(authentication);
        Post post = new Post(dto, author);

        postRepository.save(post);
        return new PostResponseDTO(post);
    }

    public Page<PostListDTO> list(Pageable pageable) {
        return postRepository.findAll(pageable).map(PostListDTO::new);
    }

    public PostResponseDTO getById(Long postId) {
        return new PostResponseDTO(getPostOrThrow(postId));
    }

    @PreAuthorize("isAuthenticated()")
    public PostResponseDTO updatePost(
            Long postId,
            PostUpdateDTO dto,
            Authentication authentication
    ) {
        Post post = getPostOrThrow(postId);
        User loggedUser = getLoggedUser(authentication);

        validateOwnership(post, loggedUser, "Voce nao pode editar este post");
        post.atualizarInformacoes(dto);

        return new PostResponseDTO(post);
    }

    public void closePost(Long postId, Authentication authentication) {
        Post post = getPostOrThrow(postId);
        User user = getLoggedUser(authentication);

        validateOwnership(post, user, "Voce nao pode fechar este post");
        post.fechar();
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

    private void validateOwnership(Post post, User user, String message) {
        if (!post.getAuthor().getId().equals(user.getId())) {
            throw new ForbiddenOperationException(message);
        }
    }
}
