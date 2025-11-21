package com.exampleproject.controller;

import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.exampleproject.model.User;
import com.exampleproject.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@SuppressWarnings("null")
public class UserController {
    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<User> all() { return repo.findAll(); }

    @GetMapping("/{id}")
    public User get(@PathVariable @NonNull String id) { return repo.findById(id).orElseThrow(); }

    @PostMapping
    public User create(@RequestBody User user) {
        encodePassword(user);
        return repo.save(user);
    }

    @PutMapping("/{id}")
    public User update(@PathVariable @NonNull String id, @RequestBody User user) {
        user.setId(id);
        User existing = repo.findById(id).orElseThrow();
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            user.setPassword(existing.getPassword());
        } else {
            encodePassword(user);
        }
        return repo.save(user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { repo.deleteById(id); }

    private void encodePassword(User user) {
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
    }
}
