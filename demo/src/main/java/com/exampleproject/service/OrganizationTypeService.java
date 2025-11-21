package com.exampleproject.service;

import com.exampleproject.model.OrganizationType;
import com.exampleproject.repository.OrganizationTypeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@SuppressWarnings("null")
public class OrganizationTypeService {
    private final OrganizationTypeRepository repository;

    public OrganizationTypeService(OrganizationTypeRepository repository) {
        this.repository = repository;
    }

    public List<OrganizationType> findAll() { return repository.findAll(); }

    public OrganizationType findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization type not found"));
    }

    public OrganizationType create(OrganizationType type) {
        validateName(type.getName());
        type.setId(null);
        if (repository.existsByName(type.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Organization type already exists");
        }
        return repository.save(type);
    }

    public OrganizationType update(String id, OrganizationType type) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization type not found");
        }
        validateName(type.getName());
        repository.findByName(type.getName())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Organization type already exists");
                });
        type.setId(id);
        return repository.save(type);
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization type not found");
        }
        repository.deleteById(id);
    }

    private void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization type name is required");
        }
    }
}
