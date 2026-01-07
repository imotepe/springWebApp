package com.exampleproject.service;

import com.exampleproject.model.Appointment;
import com.exampleproject.model.Customer;
import com.exampleproject.model.Resource;
import com.exampleproject.model.UserRole;
import com.exampleproject.repository.AppointmentRepository;
import com.exampleproject.repository.CustomerRepository;
import com.exampleproject.repository.ResourceRepository;
import com.exampleproject.security.OrganizationAccessManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@SuppressWarnings("null")
public class CustomerService {
    private final CustomerRepository repository;
    private final AppointmentRepository appointmentRepository;
    private final ResourceRepository resourceRepository;
    private final OrganizationAccessManager organizationAccessManager;

    public CustomerService(CustomerRepository repository,
                           AppointmentRepository appointmentRepository,
                           ResourceRepository resourceRepository,
                           OrganizationAccessManager organizationAccessManager) {
        this.repository = repository;
        this.appointmentRepository = appointmentRepository;
        this.resourceRepository = resourceRepository;
        this.organizationAccessManager = organizationAccessManager;
    }

    public List<Customer> findAll() {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        forbidPlatformAdmin(context);
        if (isPractitioner(context)) {
            List<Resource> resources = requirePractitionerResources(context);
            List<String> resourceIds = resources.stream()
                    .map(Resource::getId)
                    .filter(id -> id != null && !id.isBlank())
                    .collect(Collectors.toList());
            if (resourceIds.isEmpty()) {
                return List.of();
            }
            Set<String> customerIds = appointmentRepository.findByResourceIdIn(resourceIds).stream()
                    .map(Appointment::getCustomerId)
                    .filter(id -> id != null && !id.isBlank())
                    .collect(Collectors.toSet());
            if (customerIds.isEmpty()) {
                return List.of();
            }
            Set<String> orgIds = resources.stream()
                    .map(Resource::getOrgId)
                    .filter(id -> id != null && !id.isBlank())
                    .collect(Collectors.toSet());
            return StreamSupport.stream(repository.findAllById(customerIds).spliterator(), false)
                    .filter(customer -> orgIds.isEmpty() || orgIds.contains(customer.getOrgId()))
                    .collect(Collectors.toList());
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

    public Customer findById(String id) {
        Customer customer = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        forbidPlatformAdmin(context);
        if (!isPractitioner(context)) {
            context.checkOrgAccess(customer.getOrgId());
        } else {
            List<Resource> resources = requirePractitionerResources(context);
            List<String> resourceIds = resources.stream()
                    .map(Resource::getId)
                    .filter(id -> id != null && !id.isBlank())
                    .collect(Collectors.toList());
            if (resourceIds.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customer not assigned to practitioner");
            }
            boolean linked = appointmentRepository.findByResourceIdIn(resourceIds).stream()
                    .anyMatch(appt -> id.equals(appt.getCustomerId()));
            if (!linked) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customer not assigned to practitioner");
            }
        }
        return customer;
    }

    public Customer create(Customer customer) {
        customer.setId(null);
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        forbidPlatformAdmin(context);
        if (isPractitioner(context)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Practitioners cannot create customers");
        }
        if (context.isPlatformUser()) {
            if (customer.getOrgId() == null || customer.getOrgId().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orgId is required for customers");
            }
            context.checkOrgAccess(customer.getOrgId(), OrganizationAccessManager.AccessIntent.WRITE);
        } else {
            customer.setOrgId(context.requireOrgScope());
        }
        normalizeInteractions(customer, context);
        return repository.save(customer);
    }

    public Customer update(String id, Customer customer) {
        Customer existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        forbidPlatformAdmin(context);
        if (isPractitioner(context)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Practitioners cannot update customers");
        }
        context.checkOrgAccess(existing.getOrgId(), OrganizationAccessManager.AccessIntent.WRITE);
        customer.setId(id);
        if (context.isPlatformUser()) {
            if (customer.getOrgId() == null || customer.getOrgId().isBlank()) {
                customer.setOrgId(existing.getOrgId());
            }
        } else {
            customer.setOrgId(existing.getOrgId());
        }
        normalizeInteractions(customer, context);
        return repository.save(customer);
    }

    public void delete(String id) {
        Customer existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        forbidPlatformAdmin(context);
        if (isPractitioner(context)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Practitioners cannot delete customers");
        }
        context.checkOrgAccess(existing.getOrgId(), OrganizationAccessManager.AccessIntent.WRITE);
        repository.deleteById(id);
    }

    private void forbidPlatformAdmin(OrganizationAccessManager.OrganizationAccessContext context) {
        if (!context.isSuperAdmin() && context.isPlatformAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Platform admins cannot access customers");
        }
    }

    private void normalizeInteractions(Customer customer, OrganizationAccessManager.OrganizationAccessContext context) {
        if (customer.getInteractions() == null || customer.getInteractions().isEmpty()) {
            return;
        }
        String userId = context.user().getId();
        LocalDateTime now = LocalDateTime.now();
        customer.getInteractions().forEach(interaction -> {
            if (interaction.getId() == null || interaction.getId().isBlank()) {
                interaction.setId(UUID.randomUUID().toString());
            }
            if (interaction.getCreatedBy() == null || interaction.getCreatedBy().isBlank()) {
                interaction.setCreatedBy(userId);
            }
            if (interaction.getCreatedAt() == null) {
                interaction.setCreatedAt(now);
            }
        });
    }

    private boolean isPractitioner(OrganizationAccessManager.OrganizationAccessContext context) {
        return context.user().getRoles() != null && context.user().getRoles().contains(UserRole.PRACTITIONER);
    }

    private List<Resource> requirePractitionerResources(OrganizationAccessManager.OrganizationAccessContext context) {
        String userId = context.user().getId();
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No resource linked to practitioner user");
        }
        List<Resource> resources = resourceRepository.findByPractitionerUserId(userId);
        if (resources.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No resource linked to practitioner user");
        }
        return resources;
    }
}
