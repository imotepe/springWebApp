package com.exampleproject.repository;

import com.exampleproject.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    
    List<Appointment> findByCustomerId(String customerId);

    List<Appointment> findByCustomerIdAndStartTimeBetween(
            String customerId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    List<Appointment> findByStartTimeBetween(LocalDateTime startTime, LocalDateTime endTime);

    // Multi-tenant helpers
    List<Appointment> findByOrgIdAndStartTimeBetween(String orgId, LocalDateTime start, LocalDateTime end);

    List<Appointment> findByOrgIdAndResourceIdAndStartTimeBetween(
            String orgId,
            String resourceId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Appointment> findByResourceId(String resourceId);

    List<Appointment> findByResourceIdAndStartTimeBetween(
            String resourceId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );
}
