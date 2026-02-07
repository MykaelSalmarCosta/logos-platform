package com.Mysco.Logos.controller;

import com.Mysco.Logos.dto.user.UserCreateDTO;
import com.Mysco.Logos.service.UserService;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("users")
public class UserController {


    private final UserService service;
    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Void> create(
            @RequestBody @Valid UserCreateDTO dto,
            UriComponentsBuilder uriBuilder
    ) {
        Long id = service.create(dto);

        var uri = uriBuilder
                .path("/users/{id}")
                .buildAndExpand(id)
                .toUri();


        return ResponseEntity.created(uri).build();
    }
}
