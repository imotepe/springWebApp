package com.exampleproject.service;

import com.exampleproject.model.OrganizationType;
import com.exampleproject.repository.OrganizationTypeRepository;
import com.exampleproject.security.OrganizationAccessManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@SuppressWarnings("null")
public class OrganizationTypeService {
    private final OrganizationTypeRepository repository;
    private final OrganizationAccessManager organizationAccessManager;

    public OrganizationTypeService(OrganizationTypeRepository repository,
                                   OrganizationAccessManager organizationAccessManager) {
        this.repository = repository;
        this.organizationAccessManager = organizationAccessManager;
    }

    public List<OrganizationType> findAll() { return repository.findAll(); }

    public OrganizationType findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization type not found"));
    }

    public OrganizationType create(OrganizationType type) {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (!context.isPlatformUser()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only platform administrators can create organization types");
        }
        validateName(type.getName());
        type.setId(null);
        if (repository.existsByName(type.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Organization type already exists");
        }
        type.setCreatedBy(context.user().getId());
        type.setCreatedAt(LocalDateTime.now());
        return repository.save(type);
    }

    public OrganizationType update(String id, OrganizationType type) {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (!context.isPlatformUser()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only platform administrators can update organization types");
        }
        OrganizationType existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization type not found"));
        if (context.isPlatformAdmin() && !context.isSuperAdmin()) {
            if (existing.getCreatedBy() == null || !existing.getCreatedBy().equals(context.user().getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Platform admins can only update organization types they created");
            }
            LocalDateTime createdAt = existing.getCreatedAt();
            if (createdAt == null || createdAt.isBefore(LocalDateTime.now().minusHours(24))) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Update window expired (24h after organization type creation)");
            }
        }
        validateName(type.getName());
        repository.findByName(type.getName())
                .filter(existingType -> !existingType.getId().equals(id))
                .ifPresent(conflict -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Organization type already exists");
                });
        type.setId(id);
        type.setCreatedBy(existing.getCreatedBy());
        type.setCreatedAt(existing.getCreatedAt());
        return repository.save(type);
    }

    public void delete(String id) {
        OrganizationType existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization type not found"));
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (!context.isPlatformUser()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only platform administrators can delete organization types");
        }
        if (context.isPlatformAdmin() && !context.isSuperAdmin()) {
            if (existing.getCreatedBy() == null || !existing.getCreatedBy().equals(context.user().getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Platform admins can only delete organization types they created");
            }
            LocalDateTime createdAt = existing.getCreatedAt();
            if (createdAt == null || createdAt.isBefore(LocalDateTime.now().minusHours(24))) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Delete window expired (24h after organization type creation)");
            }
        }
        repository.deleteById(id);
    }

    private void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization type name is required");
        }
    }
}
