package com.exampleproject.model;

import java.time.DayOfWeek;
import java.util.*;

public class ScheduleConfig {
    private Set<DayOfWeek> workingDays = EnumSet.allOf(DayOfWeek.class);

    // Business hours per day-of-week
    private Map<DayOfWeek, List<TimeWindow>> businessHours = new EnumMap<>(DayOfWeek.class);

    // Breaks per day-of-week
    private Map<DayOfWeek, List<TimeWindow>> breaks = new EnumMap<>(DayOfWeek.class);

    // Holidays which can cover full or partial days
    private List<Holiday> holidays = new ArrayList<>();

    public ScheduleConfig() {}

    public Set<DayOfWeek> getWorkingDays() { return workingDays; }
    public void setWorkingDays(Set<DayOfWeek> workingDays) { this.workingDays = workingDays; }

    public Map<DayOfWeek, List<TimeWindow>> getBusinessHours() { return businessHours; }
    public void setBusinessHours(Map<DayOfWeek, List<TimeWindow>> businessHours) { this.businessHours = businessHours; }

    public Map<DayOfWeek, List<TimeWindow>> getBreaks() { return breaks; }
    public void setBreaks(Map<DayOfWeek, List<TimeWindow>> breaks) { this.breaks = breaks; }

    public List<Holiday> getHolidays() { return holidays; }
    public void setHolidays(List<Holiday> holidays) { this.holidays = holidays; }
}
