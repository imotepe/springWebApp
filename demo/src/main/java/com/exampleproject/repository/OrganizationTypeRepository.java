package com.exampleproject.repository;

import com.exampleproject.model.OrganizationType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OrganizationTypeRepository extends MongoRepository<OrganizationType, String> {
    boolean existsByName(String name);
    Optional<OrganizationType> findByName(String name);
}

