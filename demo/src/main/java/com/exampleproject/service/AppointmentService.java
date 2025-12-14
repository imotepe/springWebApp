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
import com.exampleproject.security.CurrentUserProvider;
import com.exampleproject.security.OrganizationAccessManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final ResourceRepository resourceRepository;
    private final CurrentUserProvider currentUserProvider;
    private final OrganizationAccessManager organizationAccessManager;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            CustomerRepository customerRepository,
            ResourceRepository resourceRepository,
            CurrentUserProvider currentUserProvider,
            OrganizationAccessManager organizationAccessManager
    ) {
        this.appointmentRepository = appointmentRepository;
        this.customerRepository = customerRepository;
        this.resourceRepository = resourceRepository;
        this.currentUserProvider = currentUserProvider;
        this.organizationAccessManager = organizationAccessManager;
    }

    public List<Appointment> findAll() {
        UserAccessContext context = resolveContext();
        forbidPlatformAdmin(context);
        if (context.isSuperAdmin()) {
            return appointmentRepository.findAll();
        }
        if (context.isPlatformAdmin()) {
            List<String> orgIds = List.copyOf(context.permittedOrgIds(OrganizationAccessManager.AccessIntent.READ));
            if (orgIds.isEmpty()) {
                return List.of();
            }
            return appointmentRepository.findByOrgIdIn(orgIds);
        }
        return appointmentRepository.findByOrgId(context.requireOrgScope());
    }

    public List<Appointment> findByCustomerId(String customerId) {
        UserAccessContext context = resolveContext();
        forbidPlatformAdmin(context);
        return filterByOrgScope(appointmentRepository.findByCustomerId(customerId), context);
    }

    public List<Appointment> findByStartRange(LocalDateTime start, LocalDateTime end) {
        UserAccessContext context = resolveContext();
        forbidPlatformAdmin(context);
        if (start == null || end == null) {
            return findAll();
        }
        validateTimeRange(start, end);
        return filterByOrgScope(appointmentRepository.findByStartTimeBetween(start, end), context);
    }

    public List<Appointment> search(String customerId, LocalDateTime from, LocalDateTime to) {
        UserAccessContext context = resolveContext();
        forbidPlatformAdmin(context);
        if (context.isPractitioner()) {
            return findForPractitioner(context, customerId, from, to);
        }
        if (customerId != null && !customerId.isBlank()) {
            if (from != null && to != null) {
                validateTimeRange(from, to);
                return filterByOrgScope(
                        appointmentRepository.findByCustomerIdAndStartTimeBetween(customerId, from, to),
                        context
                );
            }
            return filterByOrgScope(appointmentRepository.findByCustomerId(customerId), context);
        }
        if (from != null && to != null) {
            validateTimeRange(from, to);
            return filterByOrgScope(appointmentRepository.findByStartTimeBetween(from, to), context);
        }
        return filterByOrgScope(appointmentRepository.findAll(), context);
    }

    public Appointment findByIdForUser(String id) {
        UserAccessContext context = resolveContext();
        forbidPlatformAdmin(context);
        Appointment appointment = loadAccessibleAppointment(id, context);
        if (context.isPractitioner()) {
            sanitizeAppointmentForPractitioner(appointment, context);
        }
        return appointment;
    }

    public Appointment create(Appointment appointment) {
        UserAccessContext context = resolveContext();
        forbidPlatformAdmin(context);
        appointment.setId(null);
        ensureOrgForWrite(appointment, context, null);
        validateAppointment(appointment);
        if (appointment.getStatus() == null) {
            appointment.setStatus(AppointmentStatus.SCHEDULED);
        }
        ensureEventsCollection(appointment);
        return appointmentRepository.save(appointment);
    }

    public Appointment update(String id, Appointment appointment) {
        UserAccessContext context = resolveContext();
        forbidPlatformAdmin(context);
        Appointment existing = loadAccessibleAppointment(id, context, OrganizationAccessManager.AccessIntent.WRITE);
        ensureOrgForWrite(appointment, context, existing);
        validateAppointment(appointment);
        appointment.setId(id);
        if (appointment.getStatus() == null) {
            appointment.setStatus(AppointmentStatus.SCHEDULED);
        }
        ensureEventsCollection(appointment);
        return appointmentRepository.save(appointment);
    }

    public void delete(String id) {
        UserAccessContext context = resolveContext();
        forbidPlatformAdmin(context);
        Appointment existing = loadAccessibleAppointment(id, context, OrganizationAccessManager.AccessIntent.WRITE);
        appointmentRepository.deleteById(existing.getId());
    }

    public Appointment addEvent(String appointmentId, AppointmentEvent event) {
        if (event == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event payload is required");
        }
        UserAccessContext context = resolveContext();
        forbidPlatformAdmin(context);
        Appointment appointment = loadAccessibleAppointment(appointmentId, context, OrganizationAccessManager.AccessIntent.WRITE);

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
        appointments = filterByOrgScope(appointments, context);
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

    private List<Appointment> filterByOrgScope(List<Appointment> appointments, UserAccessContext context) {
        if (context.isSuperAdmin()) {
            return appointments;
        }
        List<String> permitted = List.copyOf(context.permittedOrgIds(OrganizationAccessManager.AccessIntent.READ));
        if (permitted.isEmpty()) {
            return List.of();
        }
        return appointments.stream()
                .filter(appt -> permitted.contains(appt.getOrgId()))
                .collect(Collectors.toList());
    }

    private Appointment loadAccessibleAppointment(String id, UserAccessContext context) {
        return loadAccessibleAppointment(id, context, OrganizationAccessManager.AccessIntent.READ);
    }

    private Appointment loadAccessibleAppointment(String id, UserAccessContext context, OrganizationAccessManager.AccessIntent intent) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        context.checkOrgAccess(appointment.getOrgId(), intent);
        return appointment;
    }

    private void ensureOrgForWrite(Appointment appointment, UserAccessContext context, Appointment existing) {
        if (existing != null) {
            appointment.setOrgId(existing.getOrgId());
            return;
        }
        if (context.isPlatformUser()) {
            if (appointment.getOrgId() == null || appointment.getOrgId().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orgId is required for appointments");
            }
            context.checkOrgAccess(appointment.getOrgId(), OrganizationAccessManager.AccessIntent.WRITE);
        } else {
            appointment.setOrgId(context.requireOrgScope());
        }
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

    private void forbidPlatformAdmin(UserAccessContext context) {
        if (!context.isSuperAdmin() && context.isPlatformAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Platform admins cannot access appointments or events");
        }
    }

    private UserAccessContext resolveContext() {
        User user = currentUserProvider.getCurrentUser();
        Resource practitionerResource = null;
        if (user.getRoles().contains(UserRole.PRACTITIONER)) {
            practitionerResource = resourceRepository.findByPractitionerUserId(user.getId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.FORBIDDEN,
                            "No resource linked to practitioner user"
                    ));
        }
        return new UserAccessContext(
                user,
                practitionerResource,
                organizationAccessManager.currentContext()
        );
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
        if (appointment.getOrgId() == null || appointment.getOrgId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orgId is required");
        }
        if (appointment.getCustomerId() == null || appointment.getCustomerId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer id is required");
        }
        Customer customer = customerRepository.findById(appointment.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer does not exist"));
        if (customer.getOrgId() == null || !customer.getOrgId().equals(appointment.getOrgId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer does not belong to organization");
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
        private final OrganizationAccessManager.OrganizationAccessContext orgContext;

        private UserAccessContext(
                User user,
                Resource practitionerResource,
                OrganizationAccessManager.OrganizationAccessContext orgContext
        ) {
            this.user = user;
            this.practitionerResource = practitionerResource;
            this.orgContext = orgContext;
        }

        boolean isPractitioner() {
            return user.getRoles().contains(UserRole.PRACTITIONER);
        }

        boolean isPlatformUser() {
            return orgContext.isPlatformUser();
        }

        boolean isSuperAdmin() {
            return orgContext.isSuperAdmin();
        }

        boolean isPlatformAdmin() {
            return orgContext.isPlatformAdmin();
        }

        String requireOrgScope() {
            if (orgContext.isPlatformUser()) {
                throw new IllegalStateException("Platform users are not scoped");
            }
            return orgContext.requireOrgScope();
        }

        void checkOrgAccess(String orgId, OrganizationAccessManager.AccessIntent intent) {
            orgContext.checkOrgAccess(orgId, intent);
        }

        String userId() {
            return user.getId();
        }

        Resource practitionerResource() {
            return practitionerResource;
        }

        Set<String> permittedOrgIds(OrganizationAccessManager.AccessIntent intent) {
            return orgContext.permittedOrgIds(intent);
        }
    }
}
