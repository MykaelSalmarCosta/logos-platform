package com.Mysco.Logos.model;

import com.Mysco.Logos.dto.post.PostUpdateDTO;
import com.Mysco.Logos.dto.post.PostCreateDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private Curso curso;

    @Enumerated(EnumType.STRING)
    private StatusTopico status;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User author;

    public Post(PostCreateDTO dados, User author) {
        this.title = dados.title();
        this.content = dados.content();
        this.curso = dados.curso();
        this.author = author;
        this.status = StatusTopico.ABERTO;
        this.createdAt = LocalDateTime.now();
    }

    public void atualizarInformacoes(PostUpdateDTO dados) {

        validarAtualizacao();

        if (dados.title() != null) {
            this.title = dados.title();
        }
        if (dados.content() != null) {
            this.content = dados.content();
        }
        if (dados.curso() != null)  {
            this.curso = dados.curso();
        }
    }

    public void validarAtualizacao() {
        if(this.status == StatusTopico.FECHADO) {
            throw new IllegalStateException("Post fechado não pode ser editado");
        }
    }

    public void fechar() {
        this.status = StatusTopico.FECHADO;
    }
}
