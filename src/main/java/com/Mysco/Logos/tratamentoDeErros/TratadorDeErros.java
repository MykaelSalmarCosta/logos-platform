package com.Mysco.Logos.tratamentoDeErros;

import com.Mysco.Logos.exception.BusinessRuleException;
import com.Mysco.Logos.exception.ForbiddenOperationException;
import com.Mysco.Logos.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

@RestControllerAdvice
public class TratadorDeErros {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> tratarErro404(
            ResourceNotFoundException ex,
            HttpServletRequest request
    ) {
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> tratarErro400(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        List<FieldValidationError> fieldErrors = ex.getFieldErrors().stream()
                .map(FieldValidationError::new)
                .toList();

        ValidationErrorResponse response = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Erro de validacao nos dados enviados",
                request.getRequestURI(),
                LocalDateTime.now(),
                fieldErrors
        );

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> tratarErro400(
            HttpMessageNotReadableException ex,
            HttpServletRequest request
    ) {
        return buildError(HttpStatus.BAD_REQUEST, "Corpo da requisicao invalido", request);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiErrorResponse> tratarRegraDeNegocio(
            BusinessRuleException ex,
            HttpServletRequest request
    ) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> tratarErroBadCredentials(HttpServletRequest request) {
        return buildError(HttpStatus.UNAUTHORIZED, "Credenciais invalidas", request);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> tratarErroAuthentication(
            AuthenticationException ex,
            HttpServletRequest request
    ) {
        return buildError(HttpStatus.UNAUTHORIZED, "Falha na autenticacao", request);
    }

    @ExceptionHandler({AccessDeniedException.class, ForbiddenOperationException.class})
    public ResponseEntity<ApiErrorResponse> tratarErroAcessoNegado(
            Exception ex,
            HttpServletRequest request
    ) {
        String message = ex.getMessage();

        if (message == null || message.isBlank()) {
            message = "Acesso negado";
        }

        return buildError(HttpStatus.FORBIDDEN, message, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> tratarErro500(
            Exception ex,
            HttpServletRequest request
    ) {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno no servidor", request);
    }

    private ResponseEntity<ApiErrorResponse> buildError(
            HttpStatus status,
            String message,
            HttpServletRequest request
    ) {
        ApiErrorResponse response = new ApiErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                LocalDateTime.now()
        );

        return ResponseEntity.status(status).body(response);
    }
}
