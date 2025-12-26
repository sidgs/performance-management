package com.performancemanagement.controller;

import com.performancemanagement.dto.JwtRequest;
import com.performancemanagement.dto.JwtResponse;
import com.performancemanagement.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/jwt")
@CrossOrigin(origins = "*")
public class JwtController {

    @Autowired
    private JwtService jwtService;

    /**
     * Create an unsigned (alg=none) OIDC-compatible JWT containing
     * name, roles, permissions, tenantId and email.
     *
     * POST /jwt
     *
     * Example body:
     * {
     *   "name": "Alice Admin",
     *   "email": "alice@example.com",
     *   "tenantId": 1,
     *   "roles": ["EPM_ADMIN"],
     *   "permissions": ["departments:write", "users:write"]
     * }
     */
    @PostMapping
    public ResponseEntity<JwtResponse> createJwt(@RequestBody JwtRequest request) {
        try {
            String token = jwtService.createUnsignedToken(request);
            return new ResponseEntity<>(new JwtResponse(token), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}


