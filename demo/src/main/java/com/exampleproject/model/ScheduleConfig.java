package com.exampleproject.model;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

public class ScheduleConfig {
    private Set<DayOfWeek> workingDays = EnumSet.of(
            DayOfWeek.MONDAY,
            DayOfWeek.TUESDAY,
            DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY,
            DayOfWeek.FRIDAY
    );

    // Business hours per day-of-week
    private Map<DayOfWeek, List<TimeWindow>> businessHours = new EnumMap<>(DayOfWeek.class);

    // Breaks per day-of-week
    private Map<DayOfWeek, List<TimeWindow>> breaks = new EnumMap<>(DayOfWeek.class);

    // Whole-day holidays
    private Set<LocalDate> holidays = new HashSet<>();

    public ScheduleConfig() {}

    public Set<DayOfWeek> getWorkingDays() { return workingDays; }
    public void setWorkingDays(Set<DayOfWeek> workingDays) { this.workingDays = workingDays; }

    public Map<DayOfWeek, List<TimeWindow>> getBusinessHours() { return businessHours; }
    public void setBusinessHours(Map<DayOfWeek, List<TimeWindow>> businessHours) { this.businessHours = businessHours; }

    public Map<DayOfWeek, List<TimeWindow>> getBreaks() { return breaks; }
    public void setBreaks(Map<DayOfWeek, List<TimeWindow>> breaks) { this.breaks = breaks; }

    public Set<LocalDate> getHolidays() { return holidays; }
    public void setHolidays(Set<LocalDate> holidays) { this.holidays = holidays; }
}

