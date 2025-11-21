package com.exampleproject.service;

import com.exampleproject.model.AppointmentType;
import com.exampleproject.repository.AppointmentTypeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@SuppressWarnings("null")
public class AppointmentTypeService {
    private final AppointmentTypeRepository repository;

    public AppointmentTypeService(AppointmentTypeRepository repository) {
        this.repository = repository;
    }

    public List<AppointmentType> findAll() { return repository.findAll(); }

    public List<AppointmentType> findByOrgId(String orgId) { return repository.findByOrgId(orgId); }

    public AppointmentType findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment type not found"));
    }

    public AppointmentType create(AppointmentType type) {
        type.setId(null);
        if (type.getDefaultDurationMinutes() == null) {
            type.setDefaultDurationMinutes(30);
        }
        return repository.save(type);
    }

    public AppointmentType update(String id, AppointmentType type) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment type not found");
        }
        type.setId(id);
        if (type.getDefaultDurationMinutes() == null) {
            type.setDefaultDurationMinutes(30);
        }
        return repository.save(type);
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment type not found");
        }
        repository.deleteById(id);
    }
}
