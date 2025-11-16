package com.exampleproject.service;

import com.exampleproject.model.Appointment;
import com.exampleproject.model.AppointmentEvent;
import com.exampleproject.model.AppointmentEventType;
import com.exampleproject.model.AppointmentStatus;
import com.exampleproject.model.Customer;
import com.exampleproject.model.CustomerInteraction;
import com.exampleproject.model.Resource;
import com.exampleproject.model.User;
import com.exampleproject.model.UserRole;
import com.exampleproject.repository.AppointmentRepository;
import com.exampleproject.repository.CustomerRepository;
import com.exampleproject.repository.ResourceRepository;
import com.exampleproject.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            CustomerRepository customerRepository,
            UserRepository userRepository,
            ResourceRepository resourceRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
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
        validateTimeRange(start, end);
        return appointmentRepository.findByStartTimeBetween(start, end);
    }

    public List<Appointment> search(String customerId, LocalDateTime from, LocalDateTime to, String userId) {
        UserAccessContext context = resolveContext(userId);
        if (context.isPractitioner()) {
            return findForPractitioner(context, customerId, from, to);
        }
        if (customerId != null && !customerId.isBlank()) {
            if (from != null && to != null) {
                validateTimeRange(from, to);
                return appointmentRepository.findByCustomerIdAndStartTimeBetween(customerId, from, to);
            }
            return findByCustomerId(customerId);
        }
        if (from != null && to != null) {
            return findByStartRange(from, to);
        }
        return findAll();
    }

    public Appointment findById(String id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
    }

    public Appointment findByIdForUser(String id, String userId) {
        Appointment appointment = findById(id);
        UserAccessContext context = resolveContext(userId);
        if (context.isPractitioner()) {
            sanitizeAppointmentForPractitioner(appointment, context);
        }
        return appointment;
    }

    public Appointment create(Appointment appointment) {
        validateAppointment(appointment);
        appointment.setId(null);
        if (appointment.getStatus() == null) {
            appointment.setStatus(AppointmentStatus.SCHEDULED);
        }
        ensureEventsCollection(appointment);
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
        ensureEventsCollection(appointment);
        return appointmentRepository.save(appointment);
    }

    public void delete(String id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found");
        }
        appointmentRepository.deleteById(id);
    }

    public Appointment addEvent(String appointmentId, AppointmentEvent event, String userId) {
        if (event == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event payload is required");
        }
        UserAccessContext context = resolveContext(userId);
        Appointment appointment = findById(appointmentId);

        ensureEventsCollection(appointment);

        boolean practitioner = context.isPractitioner();
        if (practitioner) {
            enforcePractitionerOwnership(appointment, context.practitionerResource());
        }

        AppointmentEventType type = event.getType();
        if (type == null) {
            type = practitioner ? AppointmentEventType.PRACTITIONER_NOTE : AppointmentEventType.CUSTOMER_COMMENT;
            event.setType(type);
        }

        if (!practitioner && (event.getComment() == null || event.getComment().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment is required");
        }

        event.setId(UUID.randomUUID().toString());
        if (event.getCreatedAt() == null) {
            event.setCreatedAt(LocalDateTime.now());
        }
        if (practitioner) {
            event.setCreatedBy(context.userId());
            if (event.getStatus() == null) {
                event.setStatus(AppointmentStatus.COMPLETED);
            }
        } else if (event.getCreatedBy() == null || event.getCreatedBy().isBlank()) {
            event.setCreatedBy("customer");
        }

        if (event.getStatus() != null) {
            appointment.setStatus(event.getStatus());
        }

        appointment.getEvents().add(event);
        Appointment saved = appointmentRepository.save(appointment);

        propagateToCustomer(saved, event);
        if (practitioner) {
            sanitizeAppointmentForPractitioner(saved, context);
        }
        return saved;
    }

    private List<Appointment> findForPractitioner(
            UserAccessContext context,
            String customerId,
            LocalDateTime from,
            LocalDateTime to
    ) {
        Resource resource = context.practitionerResource();
        List<Appointment> appointments;
        if (from != null && to != null) {
            validateTimeRange(from, to);
            appointments = appointmentRepository.findByResourceIdAndStartTimeBetween(resource.getId(), from, to);
        } else {
            appointments = appointmentRepository.findByResourceId(resource.getId());
        }
        if (customerId != null && !customerId.isBlank()) {
            appointments = appointments.stream()
                    .filter(appt -> customerId.equals(appt.getCustomerId()))
                    .collect(Collectors.toList());
        }
        appointments.forEach(appt -> sanitizeAppointmentForPractitioner(appt, context));
        return appointments;
    }

    private void ensureEventsCollection(Appointment appointment) {
        if (appointment.getEvents() == null) {
            appointment.setEvents(new ArrayList<>());
        }
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

    private void sanitizeAppointmentForPractitioner(Appointment appointment, UserAccessContext context) {
        enforcePractitionerOwnership(appointment, context.practitionerResource());
        List<AppointmentEvent> events = appointment.getEvents();
        if (events == null || events.isEmpty()) {
            appointment.setEvents(new ArrayList<>());
            return;
        }
        String practitionerId = context.userId();
        List<AppointmentEvent> filtered = events.stream()
                .filter(e -> practitionerId != null && practitionerId.equals(e.getCreatedBy()))
                .collect(Collectors.toList());
        appointment.setEvents(filtered);
    }

    private void enforcePractitionerOwnership(Appointment appointment, Resource resource) {
        if (resource == null || resource.getId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Practitioner resource missing");
        }
        String appointmentResourceId = appointment.getResourceId();
        if (appointmentResourceId == null || !appointmentResourceId.equals(resource.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Appointment not assigned to practitioner");
        }
    }

    private UserAccessContext resolveContext(String userId) {
        if (userId == null || userId.isBlank()) {
            return UserAccessContext.anonymous();
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user: " + userId));
        Resource practitionerResource = null;
        if (user.getRoles().contains(UserRole.PRACTITIONER)) {
            practitionerResource = resourceRepository.findByPractitionerUserId(user.getId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.FORBIDDEN,
                            "No resource linked to practitioner user"
                    ));
        }
        return new UserAccessContext(user, practitionerResource);
    }

    private void validateTimeRange(LocalDateTime start, LocalDateTime end) {
        if (start.isAfter(end)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start time must be before end time"
            );
        }
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

    private static final class UserAccessContext {
        private final User user;
        private final Resource practitionerResource;

        private UserAccessContext(User user, Resource practitionerResource) {
            this.user = user;
            this.practitionerResource = practitionerResource;
        }

        static UserAccessContext anonymous() {
            return new UserAccessContext(null, null);
        }

        boolean isPractitioner() {
            return user != null && user.getRoles().contains(UserRole.PRACTITIONER);
        }

        String userId() {
            return user == null ? null : user.getId();
        }

        Resource practitionerResource() {
            return practitionerResource;
        }
    }
}
