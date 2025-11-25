package com.exampleproject.service;

import com.exampleproject.model.Organization;
import com.exampleproject.repository.OrganizationRepository;
import com.exampleproject.repository.OrganizationTypeRepository;
import com.exampleproject.security.OrganizationAccessManager;
import com.exampleproject.service.SubscriptionService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@SuppressWarnings("null")
public class OrganizationService {
    private final OrganizationRepository repository;
    private final OrganizationTypeRepository typeRepository;
    private final OrganizationAccessManager organizationAccessManager;
    private final SubscriptionService subscriptionService;

    public OrganizationService(OrganizationRepository repository,
                               OrganizationTypeRepository typeRepository,
                               OrganizationAccessManager organizationAccessManager,
                               SubscriptionService subscriptionService) {
        this.repository = repository;
        this.typeRepository = typeRepository;
        this.organizationAccessManager = organizationAccessManager;
        this.subscriptionService = subscriptionService;
    }

    public List<Organization> findAll() {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (context.isPlatformUser()) {
            return repository.findAll();
        }
        return context.scopedOrgId()
                .flatMap(repository::findById)
                .map(List::of)
                .orElse(List.of());
    }

    public Organization findById(String id) {
        Organization organization = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        organizationAccessManager.currentContext().checkOrgAccess(organization.getId());
        return organization;
    }

    public Organization create(Organization org) {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (!context.isPlatformUser()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only platform administrators can create organizations");
        }
        validateType(org.getType());
        org.setId(null);
        org.setCreatedBy(context.user().getId());
        Organization saved = repository.save(org);
        subscriptionService.createDefaultForOrg(saved.getId());
        return saved;
    }

    public Organization update(String id, Organization org) {
        Organization existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        organizationAccessManager.currentContext().checkOrgAccess(existing.getId());
        validateType(org.getType());
        org.setId(id);
        org.setDatabaseName(existing.getDatabaseName());
        org.setCreatedBy(existing.getCreatedBy());
        return repository.save(org);
    }

    public void delete(String id) {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (!context.isPlatformUser()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only platform administrators can delete organizations");
        }
        Organization existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
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
