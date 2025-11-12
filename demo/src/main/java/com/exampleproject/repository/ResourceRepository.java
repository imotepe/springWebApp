package com.exampleproject.repository;

import com.exampleproject.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByOrgId(String orgId);
}

