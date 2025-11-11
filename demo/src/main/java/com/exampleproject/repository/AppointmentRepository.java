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
}
