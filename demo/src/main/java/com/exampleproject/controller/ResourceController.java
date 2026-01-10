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
        StoredFile file = service.loadPhoto(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .body(file.getResource());
    }

    @PostMapping
    public Resource create(@RequestBody Resource resource) { return service.create(resource); }

    @PostMapping(path = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Resource uploadPhoto(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        return service.updatePhoto(id, file);
    }

    @PutMapping("/{id}")
    public Resource update(@PathVariable String id, @RequestBody Resource resource) {
        return service.update(id, resource);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { service.delete(id); }
}
