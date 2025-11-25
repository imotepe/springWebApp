package com.exampleproject.repository;

import com.exampleproject.model.Plan;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PlanRepository extends MongoRepository<Plan, String> {
    Optional<Plan> findByCode(String code);
}
