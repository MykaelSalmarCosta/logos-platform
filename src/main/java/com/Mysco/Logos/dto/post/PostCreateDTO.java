package com.Mysco.Logos.dto.post;

import com.Mysco.Logos.model.Tema;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PostCreateDTO(

        @NotBlank
        @Size(max = 120)
        String title,

        @NotBlank
        @Size(min = 10, max = 4000)
        String content,

        @NotNull
        @JsonAlias("curso")
        Tema tema
) {}
