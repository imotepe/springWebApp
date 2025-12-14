package com.exampleproject.repository;

import com.exampleproject.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByOrgId(String orgId);
    List<Resource> findByOrgIdIn(List<String> orgIds);

    Optional<Resource> findByPractitionerUserId(String practitionerUserId);
}
