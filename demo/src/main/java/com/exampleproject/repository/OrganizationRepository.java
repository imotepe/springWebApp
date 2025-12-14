package com.exampleproject.repository;

import com.exampleproject.model.Organization;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface OrganizationRepository extends MongoRepository<Organization, String> {
    Optional<Organization> findByMarketingNameIgnoreCase(String marketingName);
    List<Organization> findByCreatedBy(String createdBy);
}
