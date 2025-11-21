package com.exampleproject.service;

import com.exampleproject.model.Resource;
import com.exampleproject.repository.ResourceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@SuppressWarnings("null")
public class ResourceService {
    private final ResourceRepository repository;

    public ResourceService(ResourceRepository repository) { this.repository = repository; }

    public List<Resource> findAll() { return repository.findAll(); }

    public List<Resource> findByOrgId(String orgId) { return repository.findByOrgId(orgId); }

    public Resource findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
    }

    public Resource create(Resource resource) {
        resource.setId(null);
        return repository.save(resource);
    }

    public Resource update(String id, Resource resource) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
        }
        resource.setId(id);
        return repository.save(resource);
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
        }
        repository.deleteById(id);
    }
}
