package com.exampleproject.controller;

import com.exampleproject.model.Appointment;
import com.exampleproject.model.AppointmentStatus;
import com.exampleproject.model.AppointmentType;
import com.exampleproject.model.AvailabilitySlot;
import com.exampleproject.model.Customer;
import com.exampleproject.model.Organization;
import com.exampleproject.model.Resource;
import com.exampleproject.model.ResourcePhoto;
import com.exampleproject.repository.AppointmentRepository;
import com.exampleproject.repository.AppointmentTypeRepository;
import com.exampleproject.repository.CustomerRepository;
import com.exampleproject.repository.OrganizationRepository;
import com.exampleproject.repository.ResourceRepository;
import com.exampleproject.service.AvailabilityService;
import com.exampleproject.service.FileStorageService;
import com.exampleproject.service.FileStorageService.StoredFile;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    private final FileStorageService fileStorageService;

    public PublicBookingController(
            OrganizationRepository organizationRepository,
            AppointmentTypeRepository appointmentTypeRepository,
            ResourceRepository resourceRepository,
            AvailabilityService availabilityService,
            AppointmentRepository appointmentRepository,
            CustomerRepository customerRepository,
            FileStorageService fileStorageService
    ) {
        this.organizationRepository = organizationRepository;
        this.appointmentTypeRepository = appointmentTypeRepository;
        this.resourceRepository = resourceRepository;
        this.availabilityService = availabilityService;
        this.appointmentRepository = appointmentRepository;
        this.customerRepository = customerRepository;
        this.fileStorageService = fileStorageService;
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

    @GetMapping("/{slug}/resources/{resourceId}/photo")
    public ResponseEntity<org.springframework.core.io.Resource> resourcePhoto(
            @PathVariable String slug,
            @PathVariable String resourceId
    ) {
        Organization org = resolveOrg(slug);
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        if (!org.getId().equals(resource.getOrgId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
        }
        String photoPath = resolveDefaultPhotoPath(resource);
        if (photoPath == null || photoPath.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource photo not found");
        }
        StoredFile file = fileStorageService.loadResourcePhoto(photoPath);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .body(file.getResource());
    }

    @GetMapping("/{slug}/availability")
    public List<AvailabilitySlot> availability(
            @PathVariable String slug,
            @RequestParam String appointmentTypeId,
            @RequestParam(required = false) String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) Integer durationMinutes
    ) {
        Organization org = resolveOrg(slug);
        return availabilityService.findAvailableSlotsPublic(
                org.getId(),
                appointmentTypeId,
                resourceId,
                from,
                to,
                durationMinutes
        );
    }

    @GetMapping("/{slug}/customers/search")
    public List<Customer> searchCustomers(
            @PathVariable String slug,
            @RequestParam(required = false) String msisdn,
            @RequestParam(required = false) String firstName
    ) {
        Organization org = resolveOrg(slug);
        String phone = normalizePhone(msisdn);
        String name = Optional.ofNullable(firstName).orElse("").trim();
        if (phone.isEmpty() && name.isEmpty()) {
            return List.of();
        }
        String phoneFilter = phone.isEmpty() ? "" : phone;
        String nameFilter = name.isEmpty() ? "" : name;
        return customerRepository.findByOrgIdAndPhoneContainingAndFirstNameContainingIgnoreCase(
                org.getId(),
                phoneFilter,
                nameFilter
        ).stream().limit(20).toList();
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
        String requestedResourceId = request.resourceId();
        if (requestedResourceId != null && !requestedResourceId.isBlank()) {
            resource = resourceRepository.findById(requestedResourceId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
            if (!org.getId().equals(resource.getOrgId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource does not belong to organization");
            }
            if (!resource.getAllowedAppointmentTypeIds().isEmpty()
                    && !resource.getAllowedAppointmentTypeIds().contains(type.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type not allowed on resource");
            }
        }
        if (type.isRequiresResource() && resource == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "resourceId is required for this type");
        }

        if (request.firstName() == null || request.firstName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "firstName is required");
        }
        if (request.phone() == null || request.phone().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "phone is required");
        }
        LocalDateTime start = parseDateTime(request.startTime(), "startTime");
        int duration = resolveDurationMinutes(type, request.durationMinutes());
        LocalDateTime end = start.plusMinutes(duration);

        ensureSlotFree(org.getId(), type.getId(), resource != null ? resource.getId() : null, start, duration);
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
        String phone = normalizePhone(request.phone());
        Optional<Customer> existing = customerRepository.findByOrgIdAndPhoneAndFirstNameIgnoreCase(
                orgId,
                phone,
                request.firstName()
        );
        if (existing.isPresent()) {
            return existing.get();
        }
        Customer customer = new Customer(
                null,
                orgId,
                request.lastName(),
                request.firstName(),
                request.email(),
                phone,
                request.notes(),
                null,
                List.of()
        );
        return customerRepository.save(customer);
    }

    private void ensureSlotFree(String orgId, String appointmentTypeId, String resourceId, LocalDateTime start, int durationMinutes) {
        LocalDateTime end = start.plusMinutes(durationMinutes);
        List<AvailabilitySlot> slots = availabilityService.findAvailableSlotsPublic(
                orgId,
                appointmentTypeId,
                resourceId,
                start,
                end,
                durationMinutes
        );
        boolean available = slots.stream().anyMatch(slot -> start.equals(slot.getStart()));
        if (!available) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slot already booked");
        }
    }

    private Organization resolveOrg(String slug) {
        return organizationRepository.findByMarketingNameIgnoreCase(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    private String resolveDefaultPhotoPath(Resource resource) {
        if (resource == null) {
            return "";
        }
        List<ResourcePhoto> photos = resource.getPhotos();
        if (photos != null) {
            for (ResourcePhoto photo : photos) {
                if (photo == null) {
                    continue;
                }
                String path = photo.getPath();
                if (path != null && !path.isBlank()) {
                    return path;
                }
            }
        }
        String legacyPath = resource.getPhotoPath();
        if (legacyPath == null || legacyPath.isBlank()) {
            return "";
        }
        return legacyPath.trim();
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

    private int resolveDurationMinutes(AppointmentType type, Integer requestedMinutes) {
        int defaultDuration = Optional.ofNullable(type.getDefaultDurationMinutes()).orElse(30);
        if (requestedMinutes == null) {
            return defaultDuration;
        }
        if (requestedMinutes <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "durationMinutes must be positive");
        }
        Set<Integer> allowed = Set.copyOf(Optional.ofNullable(type.getAllowedDurations()).orElse(List.of()));
        if (!allowed.contains(requestedMinutes) && requestedMinutes != defaultDuration) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "durationMinutes not allowed for appointment type");
        }
        return requestedMinutes;
    }

    private String normalizePhone(String value) {
        if (value == null) return "";
        return value.trim();
    }

    public record PublicBookingRequest(
            String firstName,
            String lastName,
            String email,
            String phone,
            String appointmentTypeId,
            String resourceId,
            Integer durationMinutes,
            String startTime,
            String notes
    ) {
    }
}
