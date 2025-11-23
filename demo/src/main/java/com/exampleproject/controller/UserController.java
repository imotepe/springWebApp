package com.exampleproject.controller;

import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.exampleproject.model.User;
import com.exampleproject.model.UserRole;
import com.exampleproject.model.UserStatus;
import com.exampleproject.repository.UserRepository;
import com.exampleproject.security.OrganizationAccessManager;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@SuppressWarnings("null")
public class UserController {
    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final OrganizationAccessManager organizationAccessManager;

    public UserController(UserRepository repo,
                          PasswordEncoder passwordEncoder,
                          OrganizationAccessManager organizationAccessManager) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.organizationAccessManager = organizationAccessManager;
    }

    @GetMapping
    public List<User> all(@RequestParam(value = "orgId", required = false) String orgId) {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (context.isPlatformUser()) {
            if (orgId != null && !orgId.isBlank()) {
                return repo.findByHomeOrganizationId(orgId);
            }
            return repo.findAll();
        }
        return repo.findByHomeOrganizationId(context.requireOrgScope());
    }

    @GetMapping("/{id}")
    public User get(@PathVariable @NonNull String id) {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        User user = repo.findById(id).orElseThrow();
        ensureAccessToUser(user, context);
        return user;
    }

    @PostMapping
    public User create(@RequestBody User user) {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        ensureRoleAssignmentAllowed(user, context);
        applyStatusDefaults(user);
        normalizeStatusForExpiration(user);
        if (context.isPlatformUser()) {
            if (user.getRoles() != null && !user.getRoles().isEmpty()
                    && !user.getRoles().stream().anyMatch(role ->
                    role == UserRole.SUPER_PLATFORM_ADMIN
                            || role == UserRole.PLATFORM_ADMIN)) {
                if (user.getHomeOrganizationId() == null || user.getHomeOrganizationId().isBlank()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "homeOrganizationId is required for organization users");
                }
            }
        } else {
            user.setHomeOrganizationId(context.requireOrgScope());
        }
        encodePassword(user);
        return repo.save(user);
    }

    @PutMapping("/{id}")
    public User update(@PathVariable @NonNull String id, @RequestBody User user) {
        user.setId(id);
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        User existing = repo.findById(id).orElseThrow();
        ensureAccessToUser(existing, context);
        ensureRoleAssignmentAllowed(user, context);
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            user.setPassword(existing.getPassword());
        } else {
            encodePassword(user);
        }
        if (context.isPlatformUser()) {
            if (user.getHomeOrganizationId() == null || user.getHomeOrganizationId().isBlank()) {
                user.setHomeOrganizationId(existing.getHomeOrganizationId());
            }
        } else {
            user.setHomeOrganizationId(existing.getHomeOrganizationId());
        }
        if (user.getStatus() == null) {
            user.setStatus(existing.getStatus());
        }
        if (user.getExpiresAt() == null) {
            user.setExpiresAt(existing.getExpiresAt());
        }
        normalizeStatusForExpiration(user);
        return repo.save(user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        User existing = repo.findById(id).orElseThrow();
        ensureAccessToUser(existing, context);
        repo.deleteById(id);
    }

    private void encodePassword(User user) {
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
    }

    private void ensureAccessToUser(User target, OrganizationAccessManager.OrganizationAccessContext context) {
        if (context.isPlatformUser()) {
            return;
        }
        String scopedOrg = context.requireOrgScope();
        String targetOrg = target.getHomeOrganizationId();
        if (targetOrg == null || !targetOrg.equals(scopedOrg)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User belongs to another organization");
        }
    }

    private void ensureRoleAssignmentAllowed(User user, OrganizationAccessManager.OrganizationAccessContext context) {
        if (context.isPlatformUser()) {
            return;
        }
        boolean assigningPlatformRole = user.getRoles() != null && user.getRoles().stream()
                .anyMatch(role -> role == UserRole.SUPER_PLATFORM_ADMIN
                        || role == UserRole.PLATFORM_ADMIN);
        if (assigningPlatformRole) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organization users cannot assign platform roles");
        }
    }

    private void applyStatusDefaults(User user) {
        if (user.getStatus() == null) {
            user.setStatus(UserStatus.ACTIVE);
        }
    }

    private void normalizeStatusForExpiration(User user) {
        if (user.getExpiresAt() != null && LocalDateTime.now().isAfter(user.getExpiresAt())) {
            user.setStatus(UserStatus.EXPIRED);
        }
    }
}
