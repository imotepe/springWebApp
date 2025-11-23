package com.exampleproject.service;

import com.exampleproject.model.Customer;
import com.exampleproject.repository.CustomerRepository;
import com.exampleproject.security.OrganizationAccessManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

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
        if (context.isPlatformUser()) {
            return repository.findAll();
        }
        return repository.findByOrgId(context.requireOrgScope());
    }

    public Customer findById(String id) {
        Customer customer = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        organizationAccessManager.currentContext().checkOrgAccess(customer.getOrgId());
        return customer;
    }

    public Customer create(Customer customer) {
        customer.setId(null);
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        if (context.isPlatformUser()) {
            if (customer.getOrgId() == null || customer.getOrgId().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orgId is required for customers");
            }
        } else {
            customer.setOrgId(context.requireOrgScope());
        }
        return repository.save(customer);
    }

    public Customer update(String id, Customer customer) {
        Customer existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        OrganizationAccessManager.OrganizationAccessContext context = organizationAccessManager.currentContext();
        context.checkOrgAccess(existing.getOrgId());
        customer.setId(id);
        if (context.isPlatformUser()) {
            if (customer.getOrgId() == null || customer.getOrgId().isBlank()) {
                customer.setOrgId(existing.getOrgId());
            }
        } else {
            customer.setOrgId(existing.getOrgId());
        }
        return repository.save(customer);
    }

    public void delete(String id) {
        Customer existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        organizationAccessManager.currentContext().checkOrgAccess(existing.getOrgId());
        repository.deleteById(id);
    }
}
