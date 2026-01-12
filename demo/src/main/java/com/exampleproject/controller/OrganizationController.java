package com.exampleproject.controller;

import com.exampleproject.model.Organization;
import com.exampleproject.service.OrganizationService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequestMapping("/api/organizations")
public class OrganizationController {
    private final OrganizationService service;

    public OrganizationController(OrganizationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Organization> all() { return service.findAll(); }

    @GetMapping("/{id}")
    public Organization get(@PathVariable String id) { return service.findById(id); }

    @PostMapping
    public Organization create(@RequestBody Organization org) { return service.create(org); }

    @PutMapping("/{id}")
    public Organization update(@PathVariable String id, @RequestBody Organization org) {
        return service.update(id, org);
    }

    @PostMapping(path = "/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Organization uploadLogo(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        return service.updateLogo(id, file);
    }

    @PostMapping("/{id}/qr/refresh")
    public Organization refreshQrCodes(@PathVariable String id) {
        return service.refreshQrCodes(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { service.delete(id); }
}
