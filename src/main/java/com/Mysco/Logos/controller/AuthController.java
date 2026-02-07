package com.Mysco.Logos.controller;


import com.Mysco.Logos.dto.auth.LoginDTO;
import com.Mysco.Logos.dto.auth.TokenDTO;
import com.Mysco.Logos.model.User;
import com.Mysco.Logos.security.TokenService;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/login")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public AuthController(AuthenticationManager authenticationManager,
                          TokenService tokenService
    ) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    @PostMapping
    public TokenDTO login(@RequestBody @Valid LoginDTO dto) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                dto.email(),
                                dto.password()
                        )
                );

        User user = (User) authentication.getPrincipal();
        
        String token = tokenService.generateToken(user);
        
        return new TokenDTO(token);
    }
}
