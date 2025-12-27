package com.exampleproject.service;

import com.exampleproject.model.Organization;
import com.exampleproject.repository.OrganizationRepository;
import com.exampleproject.repository.OrganizationTypeRepository;
import com.exampleproject.security.OrganizationAccessManager;
import com.exampleproject.service.SubscriptionService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@SuppressWarnings("null")
public class OrganizationService {
    private final OrganizationRepository repository;
    private final OrganizationTypeRepository typeRepository;
    private final OrganizationAccessManager organizationAccessManager;
    private final SubscriptionService subscriptionService;
    private final FileStorageService fileStorageService;

    public OrganizationService(OrganizationRepository repository,
                               OrganizationTypeRepository typeRepository,
                               OrganizationAccessManager organizationAccessManager,
                               SubscriptionService subscriptionService,
                               FileStorageService fileStorageService) {
        this.repository = repository;
        this.typeRepository = typeRepository;
        this.organizationAccessManager = organizationAccessManager;
        this.subscriptionService = subscriptionService;
        this.fileStorageService = fileStorageService;
    }

    public List<Organization> findAll() {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (context.isSuperAdmin()) {
            return repository.findAll();
        }
        if (context.isPlatformAdmin()) {
            return repository.findByCreatedBy(context.user().getId());
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
        org.setType(resolveTypeId(org.getType()));
        org.setId(null);
        org.setCreatedBy(context.user().getId());
        org.setCreatedAt(LocalDateTime.now());
        Organization saved = repository.save(org);
        subscriptionService.createDefaultForOrg(saved.getId());
        return saved;
    }

    public Organization update(String id, Organization org) {
        Organization existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        organizationAccessManager.currentContext().checkOrgAccess(existing.getId(), OrganizationAccessManager.AccessIntent.WRITE);
        org.setType(resolveTypeId(org.getType()));
        org.setId(id);
        org.setCreatedBy(existing.getCreatedBy());
        org.setCreatedAt(existing.getCreatedAt());
        return repository.save(org);
    }

    public void delete(String id) {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (!context.isPlatformUser()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only platform administrators can delete organizations");
        }
        Organization existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        organizationAccessManager.currentContext().checkOrgAccess(existing.getId(), OrganizationAccessManager.AccessIntent.WRITE);
        repository.deleteById(id);
    }

    public Organization updateLogo(String id, MultipartFile file) {
        Organization existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        organizationAccessManager.currentContext().checkOrgAccess(existing.getId(), OrganizationAccessManager.AccessIntent.WRITE);
        String previousLogo = existing.getLogoImage();
        String logoPath = fileStorageService.storeOrganizationLogo(existing.getId(), file);
        existing.setLogoImage(logoPath);
        Organization saved = repository.save(existing);
        if (previousLogo != null && !previousLogo.isBlank() && !previousLogo.equals(logoPath)) {
            fileStorageService.deleteIfExists(previousLogo);
        }
        return saved;
    }

    private String resolveTypeId(String typeName) {
        if (typeName == null || typeName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization type is required");
        }
        String normalizedType = typeName.trim();
        if (typeRepository.existsById(normalizedType)) {
            return normalizedType;
        }
        return typeRepository.findByName(normalizedType)
                .map(type -> type.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unknown organization type: " + typeName
                ));
    }
}
