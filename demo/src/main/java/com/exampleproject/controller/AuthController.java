package com.exampleproject.controller;

import com.exampleproject.dto.AuthRequest;
import com.exampleproject.dto.AuthResponse;
import com.exampleproject.model.User;
import com.exampleproject.model.UserStatus;
import com.exampleproject.repository.UserRepository;
import com.exampleproject.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/token")
    public AuthResponse token(@RequestBody AuthRequest request) {
        String identifier = request.getIdentifier();
        String password = request.getPassword();
        if (identifier == null || identifier.isBlank() || password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Identifier and password are required");
        }
        String normalizedIdentifier = identifier.trim();
        List<User> candidates = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(
                normalizedIdentifier,
                normalizedIdentifier
        );
        User user = candidates.stream()
                .filter(candidate -> candidate.getPassword() != null
                        && passwordEncoder.matches(password, candidate.getPassword()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        enforceExpiration(user);
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is not active");
        }
        return new AuthResponse(jwtService.generateToken(user));
    }

    private void enforceExpiration(User user) {
        LocalDateTime expiresAt = user.getExpiresAt();
        if (expiresAt == null) {
            return;
        }
        if (LocalDateTime.now().isAfter(expiresAt)) {
            if (user.getStatus() != UserStatus.EXPIRED) {
                user.setStatus(UserStatus.EXPIRED);
                userRepository.save(user);
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is expired");
        }
    }
}
