package com.Mysco.Logos.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentCreateDTO(

        @NotBlank
        @Size(max = 1600)
        String content
) {}
