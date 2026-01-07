package com.exampleproject.service;

import com.exampleproject.model.Resource;
import com.exampleproject.model.UserRole;
import com.exampleproject.repository.ResourceRepository;
import com.exampleproject.security.OrganizationAccessManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;
@Service
@SuppressWarnings("null")
public class ResourceService {
    private final ResourceRepository repository;
    private final OrganizationAccessManager organizationAccessManager;

    public ResourceService(ResourceRepository repository, OrganizationAccessManager organizationAccessManager) {
        this.repository = repository;
        this.organizationAccessManager = organizationAccessManager;
    }

    public List<Resource> findAll() {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (isPractitioner(context)) {
            return requirePractitionerResources(context);
        }
        if (context.isSuperAdmin()) {
            return repository.findAll();
        }
        if (context.isPlatformAdmin()) {
            List<String> orgIds = List.copyOf(context.permittedOrgIds(OrganizationAccessManager.AccessIntent.READ));
            if (orgIds.isEmpty()) {
                return List.of();
            }
            return repository.findByOrgIdIn(orgIds);
        }
        return repository.findByOrgId(context.requireOrgScope());
    }

    public List<Resource> findByOrgId(String orgId) {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        context.checkOrgAccess(orgId);
        if (isPractitioner(context)) {
            return requirePractitionerResources(context).stream()
                    .filter(resource -> orgId.equals(resource.getOrgId()))
                    .collect(Collectors.toList());
        }
        return repository.findByOrgId(orgId);
    }

    public Resource findById(String id) {
        Resource resource = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        context.checkOrgAccess(resource.getOrgId());
        if (isPractitioner(context)) {
            boolean allowed = requirePractitionerResources(context).stream()
                    .anyMatch(owned -> resource.getId().equals(owned.getId()));
            if (!allowed) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Resource not assigned to practitioner");
            }
        }
        return resource;
    }

    public Resource create(Resource resource) {
        resource.setId(null);
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (isPractitioner(context)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Practitioners cannot create resources");
        }
        if (context.isPlatformUser()) {
            if (resource.getOrgId() == null || resource.getOrgId().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orgId is required for resources");
            }
            context.checkOrgAccess(resource.getOrgId(), OrganizationAccessManager.AccessIntent.WRITE);
        } else {
            resource.setOrgId(context.requireOrgScope());
        }
        return repository.save(resource);
    }

    public Resource update(String id, Resource resource) {
        Resource existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (isPractitioner(context)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Practitioners cannot update resources");
        }
        context.checkOrgAccess(existing.getOrgId(), OrganizationAccessManager.AccessIntent.WRITE);
        resource.setId(id);
        resource.setOrgId(existing.getOrgId());
        return repository.save(resource);
    }

    public void delete(String id) {
        Resource existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (isPractitioner(context)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Practitioners cannot delete resources");
        }
        context.checkOrgAccess(existing.getOrgId(), OrganizationAccessManager.AccessIntent.WRITE);
        repository.deleteById(id);
    }

    private boolean isPractitioner(OrganizationAccessManager.OrganizationAccessContext context) {
        return context.user().getRoles() != null && context.user().getRoles().contains(UserRole.PRACTITIONER);
    }

    private List<Resource> requirePractitionerResources(OrganizationAccessManager.OrganizationAccessContext context) {
        String userId = context.user().getId();
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No resource linked to practitioner user");
        }
        List<Resource> resources = repository.findByPractitionerUserId(userId);
        if (resources.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No resource linked to practitioner user");
        }
        return resources;
    }
}
