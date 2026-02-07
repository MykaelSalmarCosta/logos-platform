package com.Mysco.Logos.dto.post;

import com.Mysco.Logos.model.Curso;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PostCreateDTO(

        @NotBlank
        String title,

        @NotBlank
        String content,

        @NotNull
        Curso curso,

        @NotNull
        Long authorId
) {}
