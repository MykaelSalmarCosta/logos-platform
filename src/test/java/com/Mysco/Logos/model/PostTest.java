package com.Mysco.Logos.model;

import com.Mysco.Logos.dto.post.PostCreateDTO;
import com.Mysco.Logos.dto.post.PostUpdateDTO;
import com.Mysco.Logos.dto.user.UserCreateDTO;
import com.Mysco.Logos.exception.BusinessRuleException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PostTest {

    @Test
    void shouldCreatePostWithOpenStatus() {
        User author = new User(new UserCreateDTO("mykael", "mykael@email.com", "senha1234"));
        PostCreateDTO dto = new PostCreateDTO(
                "Como organizar uma API REST?",
                "Estou estruturando o projeto em camadas e validando o fluxo principal.",
                Curso.SPRING_BOOT
        );

        Post post = new Post(dto, author);

        assertEquals("Como organizar uma API REST?", post.getTitle());
        assertEquals(StatusTopico.ABERTO, post.getStatus());
        assertNotNull(post.getCreatedAt());
        assertSame(author, post.getAuthor());
    }

    @Test
    void shouldUpdateOpenPost() {
        User author = new User(new UserCreateDTO("mykael", "mykael@email.com", "senha1234"));
        Post post = new Post(
                new PostCreateDTO(
                        "Titulo inicial",
                        "Conteudo inicial com tamanho valido para o teste.",
                        Curso.JAVA
                ),
                author
        );

        post.atualizarInformacoes(new PostUpdateDTO(
                "Titulo atualizado",
                "Conteudo atualizado com mais contexto para representar a regra.",
                Curso.API_REST
        ));

        assertEquals("Titulo atualizado", post.getTitle());
        assertEquals("Conteudo atualizado com mais contexto para representar a regra.", post.getContent());
        assertEquals(Curso.API_REST, post.getCurso());
    }

    @Test
    void shouldNotUpdateClosedPost() {
        User author = new User(new UserCreateDTO("mykael", "mykael@email.com", "senha1234"));
        Post post = new Post(
                new PostCreateDTO(
                        "Titulo inicial",
                        "Conteudo inicial com tamanho valido para o teste.",
                        Curso.JAVA
                ),
                author
        );

        post.fechar();

        BusinessRuleException exception = assertThrows(
                BusinessRuleException.class,
                () -> post.atualizarInformacoes(new PostUpdateDTO(
                        "Novo titulo",
                        "Novo conteudo com tamanho valido para o teste.",
                        Curso.MYSQL
                ))
        );

        assertEquals("Post fechado nao pode ser editado", exception.getMessage());
    }
}
