package com.exampleproject.service;

import com.exampleproject.model.*;
import com.exampleproject.repository.AppointmentRepository;
import com.exampleproject.repository.AppointmentTypeRepository;
import com.exampleproject.repository.OrganizationRepository;
import com.exampleproject.repository.ResourceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AvailabilityService {
    private final OrganizationRepository organizationRepository;
    private final AppointmentTypeRepository appointmentTypeRepository;
    private final ResourceRepository resourceRepository;
    private final AppointmentRepository appointmentRepository;

    public AvailabilityService(
            OrganizationRepository organizationRepository,
            AppointmentTypeRepository appointmentTypeRepository,
            ResourceRepository resourceRepository,
            AppointmentRepository appointmentRepository
    ) {
        this.organizationRepository = organizationRepository;
        this.appointmentTypeRepository = appointmentTypeRepository;
        this.resourceRepository = resourceRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public List<AvailabilitySlot> findAvailableSlots(
            String orgId,
            String appointmentTypeId,
            String resourceId,
            LocalDateTime from,
            LocalDateTime to
    ) {
        if (orgId == null || orgId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orgId is required");
        }
        if (appointmentTypeId == null || appointmentTypeId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "appointmentTypeId is required");
        }
        if (from == null || to == null || !from.isBefore(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range");
        }

        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        AppointmentType type = appointmentTypeRepository.findById(appointmentTypeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment type not found"));
        if (!orgId.equals(type.getOrgId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type does not belong to organization");
        }

        Resource resource = null;
        if (type.isRequiresResource()) {
            if (resourceId == null || resourceId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "resourceId is required for this type");
            }
        }
        if (resourceId != null && !resourceId.isBlank()) {
            resource = resourceRepository.findById(resourceId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
            if (!orgId.equals(resource.getOrgId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource does not belong to organization");
            }
            if (!resource.getAllowedAppointmentTypeIds().isEmpty() &&
                    !resource.getAllowedAppointmentTypeIds().contains(appointmentTypeId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type not allowed on resource");
            }
        }

        int durationMinutes = Optional.ofNullable(type.getDefaultDurationMinutes()).orElse(30);
        ScheduleConfig schedule = resource != null && resource.getScheduleOverride() != null
                ? resource.getScheduleOverride()
                : org.getScheduleConfig();

        if (schedule == null) {
            // default Monday-Friday 9-17 with 12-13 break
            schedule = defaultSchedule();
        }

        // Fetch existing appointments in range to check conflicts
        List<Appointment> existing = resource != null
                ? appointmentRepository.findByOrgIdAndResourceIdAndStartTimeBetween(orgId, resource.getId(), from, to)
                : appointmentRepository.findByOrgIdAndStartTimeBetween(orgId, from, to);

        List<AvailabilitySlot> slots = new ArrayList<>();
        LocalDate date = from.toLocalDate();
        LocalDate endDate = to.toLocalDate();
        List<Holiday> holidays = Optional.ofNullable(schedule.getHolidays()).orElse(Collections.emptyList());
        Set<DayOfWeek> typeAllowedDays = type.getAllowedDaysOfWeek();
        Map<DayOfWeek, List<TimeWindow>> typeAllowedWindows = type.getAllowedTimeWindows();

        while (!date.isAfter(endDate)) {
            final LocalDate currentDate = date;
            List<Holiday> dayHolidays = holidays.stream()
                    .filter(h -> h.getDate() != null && h.getDate().equals(currentDate))
                    .collect(Collectors.toList());
            boolean fullDayHoliday = dayHolidays.stream().anyMatch(Holiday::isAllDay);
            if (fullDayHoliday) {
                date = date.plusDays(1);
                continue;
            }
            DayOfWeek dow = date.getDayOfWeek();
            if (schedule.getWorkingDays() != null && !schedule.getWorkingDays().contains(dow)) {
                date = date.plusDays(1);
                continue;
            }
            if (typeAllowedDays != null && !typeAllowedDays.isEmpty() && !typeAllowedDays.contains(dow)) {
                date = date.plusDays(1);
                continue;
            }
            List<TimeWindow> dayWindows = optionalList(schedule.getBusinessHours(), dow);
            List<TimeWindow> allowedWindows = typeAllowedWindows != null
                    ? sanitizeTimeWindows(typeAllowedWindows.getOrDefault(dow, Collections.emptyList()))
                    : Collections.emptyList();
            if (!allowedWindows.isEmpty()) {
                dayWindows = intersectTimeWindows(dayWindows, allowedWindows);
            }
            if (dayWindows.isEmpty()) {
                date = date.plusDays(1);
                continue;
            }
            List<TimeWindow> dayBreaks = new ArrayList<>(optionalList(schedule.getBreaks(), dow));

            List<TimeWindow> holidayBlocks = dayHolidays.stream()
                    .filter(h -> !h.isAllDay())
                    .flatMap(h -> sanitizeTimeWindows(h.getClosedWindows()).stream())
                    .collect(Collectors.toList());
            if (!holidayBlocks.isEmpty()) {
                dayBreaks.addAll(holidayBlocks);
            }

            for (TimeWindow window : dayWindows) {
                LocalDateTime windowStart = LocalDateTime.of(date, window.getStart());
                LocalDateTime windowEnd = LocalDateTime.of(date, window.getEnd());
                if (windowEnd.isBefore(from)) continue;
                if (windowStart.isAfter(to)) break;

                LocalDateTime cursor = windowStart.isBefore(from) ? from : windowStart;
                while (!cursor.plusMinutes(durationMinutes).isAfter(windowEnd) && !cursor.plusMinutes(durationMinutes).isAfter(to)) {
                    LocalDateTime candidateEnd = cursor.plusMinutes(durationMinutes);
                    if (!overlapsBreak(cursor, candidateEnd, date, dayBreaks) &&
                        !overlapsAppointments(cursor, candidateEnd, existing)) {
                        slots.add(new AvailabilitySlot(cursor, candidateEnd));
                    }
                    cursor = cursor.plusMinutes(durationMinutes);
                }
            }
            date = date.plusDays(1);
        }

        return slots;
    }

    private ScheduleConfig defaultSchedule() {
        ScheduleConfig cfg = new ScheduleConfig();
        Map<DayOfWeek, List<TimeWindow>> bh = new EnumMap<>(DayOfWeek.class);
        for (DayOfWeek d : EnumSet.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY)) {
            bh.put(d, List.of(new TimeWindow(LocalTime.of(9, 0), LocalTime.of(17, 0))));
        }
        cfg.setBusinessHours(bh);
        Map<DayOfWeek, List<TimeWindow>> br = new EnumMap<>(DayOfWeek.class);
        for (DayOfWeek d : bh.keySet()) {
            br.put(d, List.of(new TimeWindow(LocalTime.of(12, 0), LocalTime.of(13, 0))));
        }
        cfg.setBreaks(br);
        return cfg;
    }

    private List<TimeWindow> optionalList(Map<DayOfWeek, List<TimeWindow>> map, DayOfWeek key) {
        if (map == null) return Collections.emptyList();
        List<TimeWindow> lst = map.getOrDefault(key, Collections.emptyList());
        return sanitizeTimeWindows(lst);
    }

    private boolean overlapsBreak(LocalDateTime start, LocalDateTime end, LocalDate date, List<TimeWindow> breaks) {
        for (TimeWindow b : breaks) {
            LocalDateTime bs = LocalDateTime.of(date, b.getStart());
            LocalDateTime be = LocalDateTime.of(date, b.getEnd());
            if (overlap(start, end, bs, be)) return true;
        }
        return false;
    }

    private boolean overlapsAppointments(LocalDateTime start, LocalDateTime end, List<Appointment> appts) {
        for (Appointment a : appts) {
            if (a.getStatus() == AppointmentStatus.CANCELLED) continue;
            LocalDateTime as = a.getStartTime();
            LocalDateTime ae = a.getEndTime();
            if (overlap(start, end, as, ae)) return true;
        }
        return false;
    }

    private boolean overlap(LocalDateTime s1, LocalDateTime e1, LocalDateTime s2, LocalDateTime e2) {
        return s1.isBefore(e2) && s2.isBefore(e1);
    }

    private List<TimeWindow> sanitizeTimeWindows(List<TimeWindow> windows) {
        if (windows == null) return Collections.emptyList();
        return windows.stream()
                .filter(tw -> tw.getStart() != null && tw.getEnd() != null && tw.getStart().isBefore(tw.getEnd()))
                .sorted(Comparator.comparing(TimeWindow::getStart))
                .collect(Collectors.toList());
    }

    private List<TimeWindow> intersectTimeWindows(List<TimeWindow> base, List<TimeWindow> constraints) {
        if (base.isEmpty() || constraints.isEmpty()) {
            return Collections.emptyList();
        }
        List<TimeWindow> result = new ArrayList<>();
        for (TimeWindow b : base) {
            for (TimeWindow c : constraints) {
                LocalTime start = b.getStart().isAfter(c.getStart()) ? b.getStart() : c.getStart();
                LocalTime end = b.getEnd().isBefore(c.getEnd()) ? b.getEnd() : c.getEnd();
                if (start.isBefore(end)) {
                    result.add(new TimeWindow(start, end));
                }
            }
        }
        return sanitizeTimeWindows(result);
    }
}
