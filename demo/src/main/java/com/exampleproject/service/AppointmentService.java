package com.exampleproject.service;

import com.exampleproject.model.Appointment;
import com.exampleproject.model.AppointmentEvent;
import com.exampleproject.model.AppointmentEventType;
import com.exampleproject.model.AppointmentStatus;
import com.exampleproject.model.Customer;
import com.exampleproject.model.CustomerInteraction;
import com.exampleproject.repository.AppointmentRepository;
import com.exampleproject.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            CustomerRepository customerRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.customerRepository = customerRepository;
    }

    public List<Appointment> findAll() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> findByCustomerId(String customerId) {
        return appointmentRepository.findByCustomerId(customerId);
    }

    public List<Appointment> findByStartRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return findAll();
        }
        if (start.isAfter(end)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start time must be before end time"
            );
        }
        return appointmentRepository.findByStartTimeBetween(start, end);
    }

    public Appointment findById(String id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
    }

    public Appointment create(Appointment appointment) {
        validateAppointment(appointment);
        appointment.setId(null);
        if (appointment.getStatus() == null) {
            appointment.setStatus(AppointmentStatus.SCHEDULED);
        }
        if (appointment.getEvents() == null) {
            appointment.setEvents(new ArrayList<>());
        }
        return appointmentRepository.save(appointment);
    }

    public Appointment update(String id, Appointment appointment) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found");
        }
        validateAppointment(appointment);
        appointment.setId(id);
        if (appointment.getStatus() == null) {
            appointment.setStatus(AppointmentStatus.SCHEDULED);
        }
        if (appointment.getEvents() == null) {
            appointment.setEvents(new ArrayList<>());
        }
        return appointmentRepository.save(appointment);
    }

    public void delete(String id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found");
        }
        appointmentRepository.deleteById(id);
    }

    public Appointment addEvent(String appointmentId, AppointmentEvent event) {
        if (event == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event payload is required");
        }
        Appointment appointment = findById(appointmentId);

        if (appointment.getEvents() == null) {
            appointment.setEvents(new ArrayList<>());
        }

        AppointmentEventType type = event.getType();
        if (type == null) {
            type = AppointmentEventType.CUSTOMER_COMMENT;
            event.setType(type);
        }

        if (event.getComment() == null || event.getComment().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment is required");
        }

        event.setId(UUID.randomUUID().toString());
        if (event.getCreatedAt() == null) {
            event.setCreatedAt(LocalDateTime.now());
        }
        if (event.getCreatedBy() == null || event.getCreatedBy().isBlank()) {
            event.setCreatedBy("customer");
        }

        if (event.getStatus() != null) {
            appointment.setStatus(event.getStatus());
        }

        appointment.getEvents().add(event);
        Appointment saved = appointmentRepository.save(appointment);

        propagateToCustomer(saved, event);
        return saved;
    }

    private void propagateToCustomer(Appointment appointment, AppointmentEvent event) {
        Customer customer = customerRepository.findById(appointment.getCustomerId())
                .orElse(null);
        if (customer == null) {
            return;
        }
        if (customer.getInteractions() == null) {
            customer.setInteractions(new ArrayList<>());
        }
        CustomerInteraction interaction = new CustomerInteraction(
                event.getId(),
                appointment.getId(),
                event.getType(),
                event.getStatus(),
                event.getComment(),
                event.getCreatedBy(),
                event.getCreatedAt()
        );
        customer.getInteractions().add(interaction);
        customerRepository.save(customer);
    }

    private void validateAppointment(Appointment appointment) {
        if (appointment.getCustomerId() == null || appointment.getCustomerId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer id is required");
        }
        if (!customerRepository.existsById(appointment.getCustomerId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer does not exist");
        }
        LocalDateTime startTime = appointment.getStartTime();
        LocalDateTime endTime = appointment.getEndTime();
        if (startTime == null || endTime == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start and end time are required");
        }
        if (!startTime.isBefore(endTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }
    }
}
