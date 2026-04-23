package com.Mysco.Logos.dto.post;

import com.Mysco.Logos.model.Curso;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostUpdateDTO(

        @NotBlank
        @Size(max = 120)
        String title,

        @NotBlank
        @Size(min = 10, max = 4000)
        String content,

        Curso curso
) {}
