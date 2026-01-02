package com.exampleproject.service;

import com.exampleproject.model.Appointment;
import com.exampleproject.model.AppointmentEvent;
import com.exampleproject.model.AppointmentEventType;
import com.exampleproject.model.AppointmentStatus;
import com.exampleproject.model.AppointmentType;
import com.exampleproject.model.Customer;
import com.exampleproject.model.CustomerInteraction;
import com.exampleproject.model.Resource;
import com.exampleproject.model.User;
import com.exampleproject.model.UserRole;
import com.exampleproject.repository.AppointmentRepository;
import com.exampleproject.repository.AppointmentTypeRepository;
import com.exampleproject.repository.CustomerRepository;
import com.exampleproject.repository.ResourceRepository;
import com.exampleproject.security.CurrentUserProvider;
import com.exampleproject.security.OrganizationAccessManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final AppointmentTypeRepository appointmentTypeRepository;
    private final CustomerRepository customerRepository;
    private final ResourceRepository resourceRepository;
    private final CurrentUserProvider currentUserProvider;
    private final OrganizationAccessManager organizationAccessManager;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            AppointmentTypeRepository appointmentTypeRepository,
            CustomerRepository customerRepository,
            ResourceRepository resourceRepository,
            CurrentUserProvider currentUserProvider,
            OrganizationAccessManager organizationAccessManager
    ) {
        this.appointmentRepository = appointmentRepository;
        this.appointmentTypeRepository = appointmentTypeRepository;
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
        AppointmentType type = resolveAppointmentType(appointment);
        Resource resource = resolveAppointmentResource(appointment, type);
        enforceAppointmentTypeDuration(appointment, type);
        ensureResourceCapacity(appointment, null, resource);
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
        AppointmentType type = resolveAppointmentType(appointment);
        Resource resource = resolveAppointmentResource(appointment, type);
        enforceAppointmentTypeDuration(appointment, type);
        ensureResourceCapacity(appointment, existing, resource);
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
        String userId = context.userId();
        if (practitioner) {
            event.setCreatedBy(userId);
            if (event.getStatus() == null) {
                event.setStatus(AppointmentStatus.COMPLETED);
            }
        } else {
            if (event.getCreatedBy() == null || event.getCreatedBy().isBlank()) {
                event.setCreatedBy(userId != null ? userId : "system");
            }
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

    private AppointmentType resolveAppointmentType(Appointment appointment) {
        String typeId = appointment.getAppointmentTypeId();
        if (typeId == null || typeId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "appointmentTypeId is required");
        }
        AppointmentType type = appointmentTypeRepository.findById(typeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment type not found"));
        if (type.getOrgId() != null && !type.getOrgId().equals(appointment.getOrgId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment type does not belong to organization");
        }
        return type;
    }

    private Resource resolveAppointmentResource(Appointment appointment, AppointmentType type) {
        String resourceId = appointment.getResourceId();
        if (type.isRequiresResource() && (resourceId == null || resourceId.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "resourceId is required for this appointment type");
        }
        if (resourceId == null || resourceId.isBlank()) {
            return null;
        }
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource does not exist"));
        if (resource.getOrgId() != null && !resource.getOrgId().equals(appointment.getOrgId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource does not belong to organization");
        }
        Set<String> allowedTypes = Optional.ofNullable(resource.getAllowedAppointmentTypeIds()).orElse(Collections.emptySet());
        if (!allowedTypes.isEmpty() && !allowedTypes.contains(type.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment type not allowed on resource");
        }
        return resource;
    }

    private void enforceAppointmentTypeDuration(Appointment appointment, AppointmentType type) {
        LocalDateTime start = appointment.getStartTime();
        LocalDateTime end = appointment.getEndTime();
        if (start == null || end == null) {
            return;
        }
        long durationMinutes = Duration.between(start, end).toMinutes();
        if (durationMinutes <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }
        int defaultDuration = Optional.ofNullable(type.getDefaultDurationMinutes()).orElse(30);
        if (defaultDuration <= 0) {
            defaultDuration = 30;
        }
        Set<Integer> allowed = new HashSet<>();
        allowed.add(defaultDuration);
        for (Integer value : Optional.ofNullable(type.getAllowedDurations()).orElse(Collections.emptyList())) {
            if (value != null && value > 0) {
                allowed.add(value);
            }
        }
        if (!allowed.contains((int) durationMinutes)) {
            String allowedLabel = allowed.stream()
                    .sorted()
                    .map(String::valueOf)
                    .collect(Collectors.joining(", "));
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Appointment duration must be one of " + allowedLabel + " minutes"
            );
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

    private void ensureResourceCapacity(Appointment appointment, Appointment existing) {
        ensureResourceCapacity(appointment, existing, null);
    }

    private void ensureResourceCapacity(Appointment appointment, Appointment existing, Resource resource) {
        String resourceId = appointment.getResourceId();
        if (resourceId == null || resourceId.isBlank()) {
            return;
        }
        Resource resolved = resource;
        if (resolved == null || resolved.getId() == null || !resolved.getId().equals(resourceId)) {
            resolved = resourceRepository.findById(resourceId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource does not exist"));
        }
        if (resolved.getOrgId() != null && !resolved.getOrgId().equals(appointment.getOrgId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource does not belong to organization");
        }
        int capacity = 1;
        Integer resourceCapacity = resolved.getCapacity();
        if (resourceCapacity != null && resourceCapacity > 0) {
            capacity = resourceCapacity;
        }
        if (capacity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource capacity must be positive");
        }
        LocalDateTime start = appointment.getStartTime();
        LocalDateTime end = appointment.getEndTime();
        long durationMinutes = Math.max(1, Duration.between(start, end).toMinutes());
        long bufferMinutes = Math.max(durationMinutes, 1440);
        LocalDateTime from = start.minusMinutes(bufferMinutes);
        LocalDateTime to = end.plusMinutes(bufferMinutes);
        List<Appointment> candidates = appointmentRepository.findByOrgIdAndResourceIdAndStartTimeBetween(
                appointment.getOrgId(),
                resolved.getId(),
                from,
                to
        );
        int overlaps = 0;
        for (Appointment candidate : candidates) {
            if (candidate.getStatus() == AppointmentStatus.CANCELLED) {
                continue;
            }
            if (existing != null && existing.getId() != null && existing.getId().equals(candidate.getId())) {
                continue;
            }
            LocalDateTime candidateStart = candidate.getStartTime();
            LocalDateTime candidateEnd = candidate.getEndTime();
            if (candidateStart == null || candidateEnd == null) {
                continue;
            }
            if (candidateStart.isBefore(end) && candidateEnd.isAfter(start)) {
                overlaps += 1;
                if (overlaps >= capacity) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Resource capacity reached for this slot");
                }
            }
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
