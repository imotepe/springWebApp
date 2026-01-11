package com.exampleproject.service;

import com.exampleproject.model.Resource;
import com.exampleproject.model.ResourcePhoto;
import com.exampleproject.model.UserRole;
import com.exampleproject.repository.ResourceRepository;
import com.exampleproject.security.OrganizationAccessManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
@Service
@SuppressWarnings("null")
public class ResourceService {
    private final ResourceRepository repository;
    private final OrganizationAccessManager organizationAccessManager;
    private final FileStorageService fileStorageService;
    private static final int MAX_RESOURCE_PHOTOS = 10;

    public record ResourcePhotoView(String id, String url, boolean isDefault, int order) {}

    public ResourceService(ResourceRepository repository,
                           OrganizationAccessManager organizationAccessManager,
                           FileStorageService fileStorageService) {
        this.repository = repository;
        this.organizationAccessManager = organizationAccessManager;
        this.fileStorageService = fileStorageService;
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
        resource.setPhotos(existing.getPhotos());
        resource.setPhotoPath(existing.getPhotoPath());
        return repository.save(resource);
    }

    public List<ResourcePhotoView> listPhotos(String id) {
        Resource resource = findById(id);
        resource = ensurePhotoMigration(resource);
        return toPhotoViews(resource);
    }

    public List<ResourcePhotoView> uploadPhotos(String id, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photo files are required");
        }
        Resource existing = requireWritableResource(id);
        existing = ensurePhotoMigration(existing);
        List<ResourcePhoto> photos = new ArrayList<>(existing.getPhotos());
        int incoming = (int) files.stream().filter(file -> file != null && !file.isEmpty()).count();
        if (incoming == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photo files are required");
        }
        if (photos.size() + incoming > MAX_RESOURCE_PHOTOS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource photos limit is 10");
        }
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            String storedPath = fileStorageService.storeResourcePhoto(existing.getId(), file);
            photos.add(new ResourcePhoto(UUID.randomUUID().toString(), storedPath));
        }
        existing.setPhotos(photos);
        Resource saved = repository.save(existing);
        return toPhotoViews(saved);
    }

    public List<ResourcePhotoView> deletePhotos(String id, List<String> photoIds) {
        if (photoIds == null || photoIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "photoIds is required");
        }
        Resource existing = requireWritableResource(id);
        existing = ensurePhotoMigration(existing);
        Set<String> deleteIds = photoIds.stream()
                .filter(value -> value != null && !value.isBlank())
                .collect(Collectors.toSet());
        if (deleteIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "photoIds is required");
        }
        List<ResourcePhoto> remaining = new ArrayList<>();
        for (ResourcePhoto photo : existing.getPhotos()) {
            if (photo == null || photo.getId() == null) {
                continue;
            }
            if (deleteIds.contains(photo.getId())) {
                fileStorageService.deleteResourcePhotoIfExists(photo.getPath());
            } else {
                remaining.add(photo);
            }
        }
        existing.setPhotos(remaining);
        Resource saved = repository.save(existing);
        return toPhotoViews(saved);
    }

    public List<ResourcePhotoView> setDefaultPhoto(String id, String photoId) {
        if (photoId == null || photoId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "photoId is required");
        }
        Resource existing = requireWritableResource(id);
        existing = ensurePhotoMigration(existing);
        List<ResourcePhoto> photos = new ArrayList<>(existing.getPhotos());
        int index = findPhotoIndex(photos, photoId);
        if (index < 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource photo not found");
        }
        if (index > 0) {
            ResourcePhoto selected = photos.remove(index);
            photos.add(0, selected);
            existing.setPhotos(photos);
            existing = repository.save(existing);
        }
        return toPhotoViews(existing);
    }

    public List<ResourcePhotoView> reorderPhotos(String id, List<String> orderedIds) {
        if (orderedIds == null || orderedIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "photo order is required");
        }
        Resource existing = requireWritableResource(id);
        existing = ensurePhotoMigration(existing);
        List<ResourcePhoto> photos = new ArrayList<>(existing.getPhotos());
        if (orderedIds.size() != photos.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "photo order does not match photo count");
        }
        String defaultId = photos.isEmpty() ? null : photos.get(0).getId();
        if (defaultId != null && !defaultId.equals(orderedIds.get(0))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Default photo must stay first");
        }
        Set<String> seen = new java.util.HashSet<>();
        List<ResourcePhoto> reordered = new ArrayList<>(photos.size());
        for (String orderedId : orderedIds) {
            if (orderedId == null || orderedId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "photo order is invalid");
            }
            if (!seen.add(orderedId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "photo order is invalid");
            }
            ResourcePhoto match = findPhoto(photos, orderedId);
            if (match == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "photo order is invalid");
            }
            reordered.add(match);
        }
        existing.setPhotos(reordered);
        Resource saved = repository.save(existing);
        return toPhotoViews(saved);
    }

    public FileStorageService.StoredFile loadDefaultPhoto(String id) {
        Resource resource = findById(id);
        resource = ensurePhotoMigration(resource);
        List<ResourcePhoto> photos = resource.getPhotos();
        if (photos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource photo not found");
        }
        ResourcePhoto photo = photos.get(0);
        return fileStorageService.loadResourcePhoto(photo.getPath());
    }

    public FileStorageService.StoredFile loadPhoto(String id, String photoId) {
        Resource resource = findById(id);
        resource = ensurePhotoMigration(resource);
        ResourcePhoto photo = findPhoto(resource.getPhotos(), photoId);
        if (photo == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource photo not found");
        }
        return fileStorageService.loadResourcePhoto(photo.getPath());
    }

    public void delete(String id) {
        Resource existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (isPractitioner(context)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Practitioners cannot delete resources");
        }
        context.checkOrgAccess(existing.getOrgId(), OrganizationAccessManager.AccessIntent.WRITE);
        List<ResourcePhoto> photos = existing.getPhotos();
        if (photos != null) {
            for (ResourcePhoto photo : photos) {
                if (photo == null) {
                    continue;
                }
                fileStorageService.deleteResourcePhotoIfExists(photo.getPath());
            }
        }
        String legacyPath = existing.getPhotoPath();
        repository.deleteById(id);
        fileStorageService.deleteResourcePhotoIfExists(legacyPath);
    }

    private Resource requireWritableResource(String id) {
        Resource existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (isPractitioner(context)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Practitioners cannot update resources");
        }
        context.checkOrgAccess(existing.getOrgId(), OrganizationAccessManager.AccessIntent.WRITE);
        return existing;
    }

    private Resource ensurePhotoMigration(Resource resource) {
        boolean updated = false;
        List<ResourcePhoto> normalized = new ArrayList<>();
        for (ResourcePhoto photo : resource.getPhotos()) {
            if (photo == null) {
                updated = true;
                continue;
            }
            String path = photo.getPath();
            if (path == null || path.isBlank()) {
                updated = true;
                continue;
            }
            if (photo.getId() == null || photo.getId().isBlank()) {
                photo.setId(UUID.randomUUID().toString());
                updated = true;
            }
            normalized.add(photo);
        }
        if (normalized.isEmpty()) {
            String legacyPath = resource.getPhotoPath();
            if (legacyPath != null && !legacyPath.isBlank()) {
                normalized.add(new ResourcePhoto(UUID.randomUUID().toString(), legacyPath));
                resource.setPhotoPath(null);
                updated = true;
            }
        }
        if (updated) {
            resource.setPhotos(normalized);
            return repository.save(resource);
        }
        return resource;
    }

    private List<ResourcePhotoView> toPhotoViews(Resource resource) {
        List<ResourcePhotoView> views = new ArrayList<>();
        List<ResourcePhoto> photos = resource.getPhotos();
        for (int i = 0; i < photos.size(); i++) {
            ResourcePhoto photo = photos.get(i);
            if (photo == null || photo.getId() == null || photo.getId().isBlank()) {
                continue;
            }
            boolean isDefault = i == 0;
            views.add(new ResourcePhotoView(
                    photo.getId(),
                    "/api/resources/" + resource.getId() + "/photos/" + photo.getId(),
                    isDefault,
                    i
            ));
        }
        return views;
    }

    private int findPhotoIndex(List<ResourcePhoto> photos, String photoId) {
        if (photoId == null || photoId.isBlank()) {
            return -1;
        }
        for (int i = 0; i < photos.size(); i++) {
            ResourcePhoto photo = photos.get(i);
            if (photo != null && photoId.equals(photo.getId())) {
                return i;
            }
        }
        return -1;
    }

    private ResourcePhoto findPhoto(List<ResourcePhoto> photos, String photoId) {
        int index = findPhotoIndex(photos, photoId);
        return index >= 0 ? photos.get(index) : null;
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
