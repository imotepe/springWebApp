package com.exampleproject.service;

import com.exampleproject.model.AppointmentType;
import com.exampleproject.repository.AppointmentTypeRepository;
import com.exampleproject.security.OrganizationAccessManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@SuppressWarnings("null")
public class AppointmentTypeService {
    private final AppointmentTypeRepository repository;
    private final OrganizationAccessManager organizationAccessManager;

    public AppointmentTypeService(AppointmentTypeRepository repository,
                                  OrganizationAccessManager organizationAccessManager) {
        this.repository = repository;
        this.organizationAccessManager = organizationAccessManager;
    }

    public List<AppointmentType> findAll() {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (context.isSuperAdmin()) {
            return repository.findAll();
        }
        if (context.isPlatformAdmin()) {
            List<String> orgIds = repositoryOrgIds(context, OrganizationAccessManager.AccessIntent.READ);
            if (orgIds.isEmpty()) {
                return List.of();
            }
            return repository.findByOrgIdIn(orgIds);
        }
        return repository.findByOrgId(context.requireOrgScope());
    }

    public List<AppointmentType> findByOrgId(String orgId) {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        context.checkOrgAccess(orgId);
        return repository.findByOrgId(orgId);
    }

    public AppointmentType findById(String id) {
        AppointmentType type = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment type not found"));
        organizationAccessManager.currentContext().checkOrgAccess(type.getOrgId());
        return type;
    }

    public AppointmentType create(AppointmentType type) {
        type.setId(null);
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (context.isPlatformUser()) {
            if (type.getOrgId() == null || type.getOrgId().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orgId is required for appointment types");
            }
            context.checkOrgAccess(type.getOrgId(), OrganizationAccessManager.AccessIntent.WRITE);
        } else {
            type.setOrgId(context.requireOrgScope());
        }
        if (type.getDefaultDurationMinutes() == null) {
            type.setDefaultDurationMinutes(30);
        }
        return repository.save(type);
    }

    public AppointmentType update(String id, AppointmentType type) {
        AppointmentType existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment type not found"));
        organizationAccessManager.currentContext().checkOrgAccess(existing.getOrgId(), OrganizationAccessManager.AccessIntent.WRITE);
        type.setId(id);
        type.setOrgId(existing.getOrgId());
        if (type.getDefaultDurationMinutes() == null) {
            type.setDefaultDurationMinutes(30);
        }
        return repository.save(type);
    }

    public void delete(String id) {
        AppointmentType existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment type not found"));
        organizationAccessManager.currentContext().checkOrgAccess(existing.getOrgId(), OrganizationAccessManager.AccessIntent.WRITE);
        repository.deleteById(id);
    }

    private List<String> repositoryOrgIds(OrganizationAccessManager.OrganizationAccessContext context,
                                          OrganizationAccessManager.AccessIntent intent) {
        return List.copyOf(context.permittedOrgIds(intent));
    }
}
