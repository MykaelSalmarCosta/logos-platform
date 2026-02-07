package com.Mysco.Logos.service;

import com.Mysco.Logos.dto.post.PostCreateDTO;
import com.Mysco.Logos.dto.post.PostResponseDTO;
import com.Mysco.Logos.dto.post.PostUpdateDTO;
import com.Mysco.Logos.model.Post;
import com.Mysco.Logos.model.User;
import com.Mysco.Logos.repository.PostRepository;
import com.Mysco.Logos.repository.UserRepository;
import jakarta.validation.Valid;
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

    public PostResponseDTO create(PostCreateDTO dto) {
        User author = userRepository.findById(dto.authorId())
                .orElseThrow(() -> new RuntimeException("Autor não encontrado"));

        Post post = new Post(dto, author);

        postRepository.save(post);
        return new PostResponseDTO(post);
    }

    @PreAuthorize("isAuthenticated()")
    public PostResponseDTO updatePost(
            Long postId,
            PostUpdateDTO dto,
            Authentication authentication
    ) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post não encontrado"));

        String email = authentication.getName();

        User loggedUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!post.getAuthor().getId().equals(loggedUser.getId())) {
            throw new RuntimeException("Você não pode editar este post");
        }

        post.atualizarInformacoes(dto);

        return new PostResponseDTO(post);
    }



    private User getLoggedUser(Authentication authentication) {

        if (authentication == null) {
            throw new RuntimeException(("Usuário não autenticado"));
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

    }



    public void closePost(Long postId, Authentication authentication) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post não encontrado"));

        User user = getLoggedUser(authentication);

        if (!post.getAuthor().getId().equals(user.getId())) {
            throw  new RuntimeException(("Você não pode fechar este post"));
        }

        post.fechar();
    }
}
