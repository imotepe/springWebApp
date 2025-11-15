package com.exampleproject.controller;

import com.exampleproject.model.OrganizationType;
import com.exampleproject.service.OrganizationTypeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organization-types")
public class OrganizationTypeController {
    private final OrganizationTypeService service;

    public OrganizationTypeController(OrganizationTypeService service) {
        this.service = service;
    }

    @GetMapping
    public List<OrganizationType> all() { return service.findAll(); }

    @GetMapping("/{id}")
    public OrganizationType get(@PathVariable String id) { return service.findById(id); }

    @PostMapping
    public OrganizationType create(@RequestBody OrganizationType type) { return service.create(type); }

    @PutMapping("/{id}")
    public OrganizationType update(@PathVariable String id, @RequestBody OrganizationType type) {
        return service.update(id, type);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { service.delete(id); }
}

