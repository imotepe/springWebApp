package com.exampleproject.service;

import com.exampleproject.model.Organization;
import com.exampleproject.repository.OrganizationRepository;
import com.exampleproject.repository.OrganizationTypeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@SuppressWarnings("null")
public class OrganizationService {
    private final OrganizationRepository repository;
    private final OrganizationTypeRepository typeRepository;

    public OrganizationService(OrganizationRepository repository, OrganizationTypeRepository typeRepository) {
        this.repository = repository;
        this.typeRepository = typeRepository;
    }

    public List<Organization> findAll() { return repository.findAll(); }

    public Organization findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public Organization create(Organization org) {
        validateType(org.getType());
        org.setId(null);
        return repository.save(org);
    }

    public Organization update(String id, Organization org) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found");
        }
        validateType(org.getType());
        org.setId(id);
        return repository.save(org);
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found");
        }
        repository.deleteById(id);
    }

    private void validateType(String typeName) {
        if (typeName == null || typeName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization type is required");
        }
        if (!typeRepository.existsByName(typeName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown organization type: " + typeName);
        }
    }
}
