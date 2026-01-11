package com.exampleproject.controller;

import com.exampleproject.model.Resource;
import com.exampleproject.service.FileStorageService.StoredFile;
import com.exampleproject.service.ResourceService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {
    private final ResourceService service;

    public ResourceController(ResourceService service) { this.service = service; }

    @GetMapping
    public List<Resource> all(@RequestParam(required = false) String orgId) {
        if (orgId != null && !orgId.isBlank()) {
            return service.findByOrgId(orgId);
        }
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Resource get(@PathVariable String id) { return service.findById(id); }

    @GetMapping("/{id}/photo")
    public ResponseEntity<org.springframework.core.io.Resource> photo(@PathVariable String id) {
        StoredFile file = service.loadDefaultPhoto(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .body(file.getResource());
    }

    @GetMapping("/{id}/photos")
    public List<ResourceService.ResourcePhotoView> photos(@PathVariable String id) {
        return service.listPhotos(id);
    }

    @GetMapping("/{id}/photos/{photoId}")
    public ResponseEntity<org.springframework.core.io.Resource> photoById(@PathVariable String id,
                                                                          @PathVariable String photoId) {
        StoredFile file = service.loadPhoto(id, photoId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .body(file.getResource());
    }

    @PostMapping
    public Resource create(@RequestBody Resource resource) { return service.create(resource); }

    @PostMapping(path = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<ResourceService.ResourcePhotoView> uploadPhoto(@PathVariable String id,
                                                               @RequestParam("file") MultipartFile file) {
        if (file == null) {
            return service.uploadPhotos(id, List.of());
        }
        return service.uploadPhotos(id, List.of(file));
    }

    @PostMapping(path = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<ResourceService.ResourcePhotoView> uploadPhotos(@PathVariable String id,
                                                                @RequestParam("files") List<MultipartFile> files) {
        return service.uploadPhotos(id, files);
    }

    @PostMapping("/{id}/photos/delete")
    public List<ResourceService.ResourcePhotoView> deletePhotos(@PathVariable String id,
                                                                @RequestBody PhotoDeleteRequest request) {
        return service.deletePhotos(id, request.ids());
    }

    @PutMapping("/{id}/photos/order")
    public List<ResourceService.ResourcePhotoView> reorderPhotos(@PathVariable String id,
                                                                 @RequestBody PhotoOrderRequest request) {
        return service.reorderPhotos(id, request.ids());
    }

    @PutMapping("/{id}/photos/{photoId}/default")
    public List<ResourceService.ResourcePhotoView> setDefaultPhoto(@PathVariable String id,
                                                                   @PathVariable String photoId) {
        return service.setDefaultPhoto(id, photoId);
    }

    @PutMapping("/{id}")
    public Resource update(@PathVariable String id, @RequestBody Resource resource) {
        return service.update(id, resource);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { service.delete(id); }

    public record PhotoDeleteRequest(List<String> ids) {}
    public record PhotoOrderRequest(List<String> ids) {}
}
