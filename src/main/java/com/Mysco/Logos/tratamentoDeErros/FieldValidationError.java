package com.Mysco.Logos.tratamentoDeErros;

import org.springframework.validation.FieldError;

public record FieldValidationError(
        String field,
        String message
) {
    public FieldValidationError(FieldError error) {
        this(error.getField(), error.getDefaultMessage());
    }
}
