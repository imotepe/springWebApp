package com.exampleproject.service;

import com.exampleproject.model.Customer;
import com.exampleproject.repository.CustomerRepository;
import com.exampleproject.security.OrganizationAccessManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@SuppressWarnings("null")
public class CustomerService {
    private final CustomerRepository repository;
    private final OrganizationAccessManager organizationAccessManager;

    public CustomerService(CustomerRepository repository, OrganizationAccessManager organizationAccessManager) {
        this.repository = repository;
        this.organizationAccessManager = organizationAccessManager;
    }

    public List<Customer> findAll() {
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        forbidPlatformAdmin(context);
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
        context.checkOrgAccess(customer.getOrgId());
        return customer;
    }

    public Customer create(Customer customer) {
        customer.setId(null);
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        forbidPlatformAdmin(context);
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
}
