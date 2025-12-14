package com.exampleproject.repository;

import com.exampleproject.model.AppointmentType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AppointmentTypeRepository extends MongoRepository<AppointmentType, String> {
    List<AppointmentType> findByOrgId(String orgId);
    List<AppointmentType> findByOrgIdIn(List<String> orgIds);
}
