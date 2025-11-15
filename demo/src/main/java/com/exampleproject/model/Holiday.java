package com.exampleproject.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class Holiday {
    private LocalDate date;
    private boolean allDay = true;
    private List<TimeWindow> closedWindows = new ArrayList<>();
    private String description;

    public Holiday() {}

    public Holiday(LocalDate date, boolean allDay, List<TimeWindow> closedWindows, String description) {
        this.date = date;
        this.allDay = allDay;
        this.closedWindows = closedWindows;
        this.description = description;
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public boolean isAllDay() { return allDay; }
    public void setAllDay(boolean allDay) { this.allDay = allDay; }

    public List<TimeWindow> getClosedWindows() { return closedWindows; }
    public void setClosedWindows(List<TimeWindow> closedWindows) { this.closedWindows = closedWindows; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Holiday)) return false;
        Holiday holiday = (Holiday) o;
        return Objects.equals(date, holiday.date) &&
                allDay == holiday.allDay &&
                Objects.equals(closedWindows, holiday.closedWindows) &&
                Objects.equals(description, holiday.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(date, allDay, closedWindows, description);
    }

    @Override
    public String toString() {
        return "Holiday{" +
                "date=" + date +
                ", allDay=" + allDay +
                ", closedWindows=" + closedWindows +
                ", description='" + description + '\'' +
                '}';
    }
}
