package com.exampleproject.service;

import com.exampleproject.model.*;
import com.exampleproject.repository.AppointmentRepository;
import com.exampleproject.repository.AppointmentTypeRepository;
import com.exampleproject.repository.OrganizationRepository;
import com.exampleproject.repository.ResourceRepository;
import com.exampleproject.security.OrganizationAccessManager;
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
    private final OrganizationAccessManager organizationAccessManager;

    public AvailabilityService(
            OrganizationRepository organizationRepository,
            AppointmentTypeRepository appointmentTypeRepository,
            ResourceRepository resourceRepository,
            AppointmentRepository appointmentRepository,
            OrganizationAccessManager organizationAccessManager
    ) {
        this.organizationRepository = organizationRepository;
        this.appointmentTypeRepository = appointmentTypeRepository;
        this.resourceRepository = resourceRepository;
        this.appointmentRepository = appointmentRepository;
        this.organizationAccessManager = organizationAccessManager;
    }

    public List<AvailabilitySlot> findAvailableSlots(
            String orgId,
            String appointmentTypeId,
            String resourceId,
            LocalDateTime from,
            LocalDateTime to,
            Integer durationMinutes
    ) {
        return computeAvailableSlots(orgId, appointmentTypeId, resourceId, from, to, durationMinutes, true);
    }

    public List<AvailabilitySlot> findAvailableSlotsPublic(
            String orgId,
            String appointmentTypeId,
            String resourceId,
            LocalDateTime from,
            LocalDateTime to,
            Integer durationMinutes
    ) {
        return computeAvailableSlots(orgId, appointmentTypeId, resourceId, from, to, durationMinutes, false);
    }

    private List<AvailabilitySlot> computeAvailableSlots(
            String orgId,
            String appointmentTypeId,
            String resourceId,
            LocalDateTime from,
            LocalDateTime to,
            Integer durationMinutes,
            boolean enforceOrgAccess
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
        LocalDateTime effectiveTo = normalizeEndOfDay(to);
        if (enforceOrgAccess) {
            organizationAccessManager.currentContext().checkOrgAccess(orgId);
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

        int duration = resolveDurationMinutes(type, durationMinutes);
        int maxDuration = resolveMaxDurationMinutes(type);
        int bufferMinutes = Math.max(maxDuration, 1440);
        ScheduleConfig schedule = resolveEffectiveSchedule(
                org.getScheduleConfig(),
                resource != null ? resource.getScheduleOverride() : null
        );

        // Fetch existing appointments in range to check conflicts
        LocalDateTime fetchFrom = from.minusMinutes(bufferMinutes);
        LocalDateTime fetchTo = effectiveTo.plusMinutes(bufferMinutes);
        List<Appointment> existing = resource != null
                ? appointmentRepository.findByOrgIdAndResourceIdAndStartTimeBetween(orgId, resource.getId(), fetchFrom, fetchTo)
                : appointmentRepository.findByOrgIdAndStartTimeBetween(orgId, fetchFrom, fetchTo);

        int capacity = 1;
        if (resource != null) {
            Integer resourceCapacity = resource.getCapacity();
            if (resourceCapacity != null && resourceCapacity > 0) {
                capacity = resourceCapacity;
            }
        }

        List<AvailabilitySlot> slots = new ArrayList<>();
        LocalDate date = from.toLocalDate();
        LocalDate endDate = effectiveTo.toLocalDate();
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
                LocalDateTime windowEnd = resolveWindowEnd(date, window.getEnd());
                if (windowEnd.isBefore(from)) continue;
                if (windowStart.isAfter(effectiveTo)) break;

                LocalDateTime cursor = windowStart.isBefore(from) ? from : windowStart;
                while (!cursor.plusMinutes(duration).isAfter(windowEnd) && !cursor.plusMinutes(duration).isAfter(effectiveTo)) {
                    LocalDateTime candidateEnd = cursor.plusMinutes(duration);
                    if (!overlapsBreak(cursor, candidateEnd, date, dayBreaks) &&
                        hasCapacity(cursor, candidateEnd, existing, capacity)) {
                        slots.add(new AvailabilitySlot(cursor, candidateEnd));
                    }
                    cursor = cursor.plusMinutes(duration);
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

    private ScheduleConfig resolveEffectiveSchedule(ScheduleConfig orgSchedule, ScheduleConfig resourceSchedule) {
        ScheduleConfig baseOrg = orgSchedule != null ? orgSchedule : defaultSchedule();
        if (resourceSchedule == null) {
            return baseOrg;
        }
        return intersectSchedules(baseOrg, resourceSchedule);
    }

    private ScheduleConfig intersectSchedules(ScheduleConfig orgSchedule, ScheduleConfig resourceSchedule) {
        ScheduleConfig merged = new ScheduleConfig();
        merged.setWorkingDays(intersectWorkingDays(orgSchedule.getWorkingDays(), resourceSchedule.getWorkingDays()));
        merged.setBusinessHours(intersectBusinessHours(orgSchedule.getBusinessHours(), resourceSchedule.getBusinessHours()));
        merged.setBreaks(mergeBreaks(orgSchedule.getBreaks(), resourceSchedule.getBreaks()));
        merged.setHolidays(mergeHolidays(orgSchedule.getHolidays(), resourceSchedule.getHolidays()));
        return merged;
    }

    private Set<DayOfWeek> intersectWorkingDays(Set<DayOfWeek> orgDays, Set<DayOfWeek> resourceDays) {
        Set<DayOfWeek> base = normalizeWorkingDays(orgDays);
        Set<DayOfWeek> override = normalizeWorkingDays(resourceDays);
        base.retainAll(override);
        return base;
    }

    private Set<DayOfWeek> normalizeWorkingDays(Set<DayOfWeek> days) {
        if (days == null) {
            return EnumSet.allOf(DayOfWeek.class);
        }
        if (days.isEmpty()) {
            return EnumSet.noneOf(DayOfWeek.class);
        }
        return EnumSet.copyOf(days);
    }

    private Map<DayOfWeek, List<TimeWindow>> intersectBusinessHours(
            Map<DayOfWeek, List<TimeWindow>> orgHours,
            Map<DayOfWeek, List<TimeWindow>> resourceHours
    ) {
        Map<DayOfWeek, List<TimeWindow>> result = new EnumMap<>(DayOfWeek.class);
        for (DayOfWeek day : DayOfWeek.values()) {
            List<TimeWindow> base = optionalList(orgHours, day);
            List<TimeWindow> override = optionalList(resourceHours, day);
            List<TimeWindow> windows = intersectTimeWindows(base, override);
            if (!windows.isEmpty()) {
                result.put(day, windows);
            }
        }
        return result;
    }

    private Map<DayOfWeek, List<TimeWindow>> mergeBreaks(
            Map<DayOfWeek, List<TimeWindow>> orgBreaks,
            Map<DayOfWeek, List<TimeWindow>> resourceBreaks
    ) {
        Map<DayOfWeek, List<TimeWindow>> result = new EnumMap<>(DayOfWeek.class);
        for (DayOfWeek day : DayOfWeek.values()) {
            List<TimeWindow> merged = new ArrayList<>();
            merged.addAll(optionalList(orgBreaks, day));
            merged.addAll(optionalList(resourceBreaks, day));
            if (!merged.isEmpty()) {
                result.put(day, sanitizeTimeWindows(merged));
            }
        }
        return result;
    }

    private List<Holiday> mergeHolidays(List<Holiday> orgHolidays, List<Holiday> resourceHolidays) {
        List<Holiday> merged = new ArrayList<>();
        if (orgHolidays != null) {
            merged.addAll(orgHolidays);
        }
        if (resourceHolidays != null) {
            merged.addAll(resourceHolidays);
        }
        return merged;
    }

    private List<TimeWindow> optionalList(Map<DayOfWeek, List<TimeWindow>> map, DayOfWeek key) {
        if (map == null) return Collections.emptyList();
        List<TimeWindow> lst = map.getOrDefault(key, Collections.emptyList());
        return sanitizeTimeWindows(lst);
    }

    private boolean overlapsBreak(LocalDateTime start, LocalDateTime end, LocalDate date, List<TimeWindow> breaks) {
        for (TimeWindow b : breaks) {
            LocalDateTime bs = LocalDateTime.of(date, b.getStart());
            LocalDateTime be = resolveWindowEnd(date, b.getEnd());
            if (overlap(start, end, bs, be)) return true;
        }
        return false;
    }

    private boolean hasCapacity(LocalDateTime start, LocalDateTime end, List<Appointment> appts, int capacity) {
        int requiredCapacity = Math.max(1, capacity);
        int overlaps = 0;
        for (Appointment a : appts) {
            if (a.getStatus() == AppointmentStatus.CANCELLED) continue;
            LocalDateTime as = a.getStartTime();
            LocalDateTime ae = a.getEndTime();
            if (overlap(start, end, as, ae)) {
                overlaps += 1;
                if (overlaps >= requiredCapacity) {
                    return false;
                }
            }
        }
        return true;
    }

    private boolean overlap(LocalDateTime s1, LocalDateTime e1, LocalDateTime s2, LocalDateTime e2) {
        return s1.isBefore(e2) && s2.isBefore(e1);
    }

    private int resolveDurationMinutes(AppointmentType type, Integer requestedMinutes) {
        int defaultDuration = Optional.ofNullable(type.getDefaultDurationMinutes()).orElse(30);
        if (requestedMinutes == null) {
            return defaultDuration;
        }
        if (requestedMinutes <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "durationMinutes must be positive");
        }
        Set<Integer> allowed = new HashSet<>(Optional.ofNullable(type.getAllowedDurations()).orElse(Collections.emptyList()));
        allowed.add(defaultDuration);
        if (!allowed.contains(requestedMinutes)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "durationMinutes not allowed for appointment type");
        }
        return requestedMinutes;
    }

    private int resolveMaxDurationMinutes(AppointmentType type) {
        int maxDuration = Optional.ofNullable(type.getDefaultDurationMinutes()).orElse(30);
        List<Integer> allowed = Optional.ofNullable(type.getAllowedDurations()).orElse(Collections.emptyList());
        for (Integer value : allowed) {
            if (value != null && value > maxDuration) {
                maxDuration = value;
            }
        }
        return Math.max(maxDuration, 30);
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

    private LocalDateTime resolveWindowEnd(LocalDate date, LocalTime end) {
        if (end == null) {
            return LocalDateTime.of(date, LocalTime.MIDNIGHT);
        }
        LocalDateTime value = LocalDateTime.of(date, end);
        if (isEndOfDay(end)) {
            return value.plusMinutes(1);
        }
        return value;
    }

    private LocalDateTime normalizeEndOfDay(LocalDateTime value) {
        if (value == null) {
            return null;
        }
        if (isEndOfDay(value.toLocalTime())) {
            return value.plusMinutes(1);
        }
        return value;
    }

    private boolean isEndOfDay(LocalTime time) {
        return time != null && time.getHour() == 23 && time.getMinute() == 59;
    }
}
