package com.exampleproject.controller;

import com.exampleproject.model.Appointment;
import com.exampleproject.model.AppointmentStatus;
import com.exampleproject.model.AppointmentType;
import com.exampleproject.model.AvailabilitySlot;
import com.exampleproject.model.Customer;
import com.exampleproject.model.Organization;
import com.exampleproject.model.Resource;
import com.exampleproject.repository.AppointmentRepository;
import com.exampleproject.repository.AppointmentTypeRepository;
import com.exampleproject.repository.CustomerRepository;
import com.exampleproject.repository.OrganizationRepository;
import com.exampleproject.repository.ResourceRepository;
import com.exampleproject.service.AvailabilityService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/organizations")
@SuppressWarnings("null")
public class PublicBookingController {

    private final OrganizationRepository organizationRepository;
    private final AppointmentTypeRepository appointmentTypeRepository;
    private final ResourceRepository resourceRepository;
    private final AvailabilityService availabilityService;
    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;

    public PublicBookingController(
            OrganizationRepository organizationRepository,
            AppointmentTypeRepository appointmentTypeRepository,
            ResourceRepository resourceRepository,
            AvailabilityService availabilityService,
            AppointmentRepository appointmentRepository,
            CustomerRepository customerRepository
    ) {
        this.organizationRepository = organizationRepository;
        this.appointmentTypeRepository = appointmentTypeRepository;
        this.resourceRepository = resourceRepository;
        this.availabilityService = availabilityService;
        this.appointmentRepository = appointmentRepository;
        this.customerRepository = customerRepository;
    }

    @GetMapping("/{slug}")
    public Organization organization(@PathVariable String slug) {
        return resolveOrg(slug);
    }

    @GetMapping("/{slug}/appointment-types")
    public List<AppointmentType> appointmentTypes(@PathVariable String slug) {
        Organization org = resolveOrg(slug);
        return appointmentTypeRepository.findByOrgId(org.getId()).stream()
                .filter(AppointmentType::isActive)
                .toList();
    }

    @GetMapping("/{slug}/resources")
    public List<Resource> resources(@PathVariable String slug) {
        Organization org = resolveOrg(slug);
        return resourceRepository.findByOrgId(org.getId());
    }

    @GetMapping("/{slug}/availability")
    public List<AvailabilitySlot> availability(
            @PathVariable String slug,
            @RequestParam String appointmentTypeId,
            @RequestParam(required = false) String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        Organization org = resolveOrg(slug);
        return availabilityService.findAvailableSlotsPublic(
                org.getId(),
                appointmentTypeId,
                resourceId,
                from,
                to
        );
    }

    @PostMapping("/{slug}/appointments")
    public Appointment book(
            @PathVariable String slug,
            @RequestBody PublicBookingRequest request
    ) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        Organization org = resolveOrg(slug);
        AppointmentType type = appointmentTypeRepository.findById(request.appointmentTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment type not found"));
        if (!org.getId().equals(type.getOrgId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type does not belong to organization");
        }

        Resource resource = null;
        if (type.isRequiresResource()) {
            if (request.resourceId() == null || request.resourceId().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "resourceId is required for this type");
            }
            resource = resourceRepository.findById(request.resourceId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
            if (!org.getId().equals(resource.getOrgId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource does not belong to organization");
            }
            if (!resource.getAllowedAppointmentTypeIds().isEmpty()
                    && !resource.getAllowedAppointmentTypeIds().contains(type.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type not allowed on resource");
            }
        }

        if (request.email() == null || request.email().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email is required");
        }
        LocalDateTime start = parseDateTime(request.startTime(), "startTime");
        Integer duration = Optional.ofNullable(type.getDefaultDurationMinutes()).orElse(30);
        LocalDateTime end = start.plusMinutes(duration);

        ensureSlotFree(org.getId(), resource != null ? resource.getId() : null, start, end);
        Customer customer = findOrCreateCustomer(org.getId(), request);

        Appointment appointment = new Appointment(
                UUID.randomUUID().toString(),
                org.getId(),
                customer.getId(),
                type.getId(),
                resource != null ? resource.getId() : null,
                start,
                end,
                AppointmentStatus.SCHEDULED,
                request.notes(),
                List.of()
        );
        return appointmentRepository.save(appointment);
    }

    private Customer findOrCreateCustomer(String orgId, PublicBookingRequest request) {
        Optional<Customer> existing = customerRepository.findByOrgIdAndEmailIgnoreCase(orgId, request.email());
        if (existing.isPresent()) {
            return existing.get();
        }
        Customer customer = new Customer(
                null,
                orgId,
                request.lastName(),
                request.firstName(),
                request.email(),
                request.phone(),
                request.notes(),
                null,
                List.of()
        );
        return customerRepository.save(customer);
    }

    private void ensureSlotFree(String orgId, String resourceId, LocalDateTime start, LocalDateTime end) {
        LocalDateTime from = start.minusMinutes(60);
        LocalDateTime to = end.plusMinutes(60);
        List<Appointment> candidates = resourceId != null
                ? appointmentRepository.findByOrgIdAndResourceIdAndStartTimeBetween(orgId, resourceId, from, to)
                : appointmentRepository.findByOrgIdAndStartTimeBetween(orgId, from, to);
        boolean overlaps = candidates.stream().anyMatch(appt -> {
            LocalDateTime aStart = appt.getStartTime();
            LocalDateTime aEnd = appt.getEndTime();
            return aStart != null && aEnd != null && aStart.isBefore(end) && aEnd.isAfter(start);
        });
        if (overlaps) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slot already booked");
        }
    }

    private Organization resolveOrg(String slug) {
        return organizationRepository.findByMarketingNameIgnoreCase(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    private LocalDateTime parseDateTime(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " is required");
        }
        try {
            return LocalDateTime.parse(value);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid " + field + " format");
        }
    }

    public record PublicBookingRequest(
            String firstName,
            String lastName,
            String email,
            String phone,
            String appointmentTypeId,
            String resourceId,
            String startTime,
            String notes
    ) {
    }
}
