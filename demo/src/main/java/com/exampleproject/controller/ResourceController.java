package com.exampleproject.controller;

import com.exampleproject.model.Resource;
import com.exampleproject.service.ResourceService;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public Resource create(@RequestBody Resource resource) { return service.create(resource); }

    @PutMapping("/{id}")
    public Resource update(@PathVariable String id, @RequestBody Resource resource) {
        return service.update(id, resource);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { service.delete(id); }
}

