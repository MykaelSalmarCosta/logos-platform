package com.Mysco.Logos.dto.post;

import com.Mysco.Logos.model.Curso;
import jakarta.validation.constraints.NotBlank;

public record PostUpdateDTO(

        @NotBlank
        String title,

        @NotBlank
        String content,

        Curso curso
) {}
