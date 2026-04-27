package com.Mysco.Logos.model;

import com.Mysco.Logos.dto.post.PostCreateDTO;
import com.Mysco.Logos.dto.user.UserCreateDTO;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;

class CommentTest {

    @Test
    void shouldCreateCommentWithAuthorAndPost() {
        User author = new User(new UserCreateDTO("mykael", "mykael@email.com", "senha1234"));
        Post post = new Post(
                new PostCreateDTO(
                        "Uma conversa boa",
                        "Conteudo inicial com tamanho valido para criar o post.",
                        Tema.IDEIAS
                ),
                author
        );

        Comment comment = new Comment("  Concordo com esse ponto.  ", post, author);

        assertEquals("Concordo com esse ponto.", comment.getContent());
        assertSame(post, comment.getPost());
        assertSame(author, comment.getAuthor());
        assertNotNull(comment.getCreatedAt());
    }
}
