package com.exampleproject.repository;

import com.exampleproject.model.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends MongoRepository<Customer, String> {
    List<Customer> findByOrgId(String orgId);

    Optional<Customer> findByOrgIdAndEmailIgnoreCase(String orgId, String email);
}
