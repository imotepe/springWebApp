package com.exampleproject.controller;

import com.exampleproject.model.AppointmentType;
import com.exampleproject.service.AppointmentTypeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointment-types")
public class AppointmentTypeController {
    private final AppointmentTypeService service;

    public AppointmentTypeController(AppointmentTypeService service) {
        this.service = service;
    }

    @GetMapping
    public List<AppointmentType> all(@RequestParam(required = false) String orgId) {
        if (orgId != null && !orgId.isBlank()) {
            return service.findByOrgId(orgId);
        }
        return service.findAll();
    }

    @GetMapping("/{id}")
    public AppointmentType get(@PathVariable String id) { return service.findById(id); }

    @PostMapping
    public AppointmentType create(@RequestBody AppointmentType type) { return service.create(type); }

    @PutMapping("/{id}")
    public AppointmentType update(@PathVariable String id, @RequestBody AppointmentType type) {
        return service.update(id, type);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { service.delete(id); }
}

