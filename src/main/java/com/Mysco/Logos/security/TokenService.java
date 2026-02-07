package com.Mysco.Logos.security;

import com.Mysco.Logos.model.User;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;


@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    @Value("${api.security.token.expiration}")
    private Long expirationHours;

    public String generateToken(User user) {
        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.create()
                .withIssuer("Logos API")
                .withSubject(user.getEmail())
                .withClaim("userId", user.getId())
                .withExpiresAt(expirationDate())
                .sign(algorithm);
    }

    public String getSubject(String token) {
        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.require(algorithm)
                .withIssuer("Logos API")
                .build()
                .verify(token)
                .getSubject();
    }

    private Instant expirationDate() {
        return LocalDateTime.now()
                .plusHours(expirationHours)
                .toInstant(ZoneOffset.UTC);
    }

}
