package com.Mysco.Logos.tratamentoDeErros;

import java.time.LocalDateTime;
import java.util.List;

public record ValidationErrorResponse(
        int status,
        String error,
        String message,
        String path,
        LocalDateTime timestamp,
        List<FieldValidationError> fieldErrors
) {}
