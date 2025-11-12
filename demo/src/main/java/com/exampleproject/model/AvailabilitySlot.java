package com.exampleproject.model;

import java.time.LocalDateTime;
import java.util.Objects;

public class AvailabilitySlot {
    private LocalDateTime start;
    private LocalDateTime end;

    public AvailabilitySlot() {}

    public AvailabilitySlot(LocalDateTime start, LocalDateTime end) {
        this.start = start;
        this.end = end;
    }

    public LocalDateTime getStart() { return start; }
    public void setStart(LocalDateTime start) { this.start = start; }

    public LocalDateTime getEnd() { return end; }
    public void setEnd(LocalDateTime end) { this.end = end; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AvailabilitySlot)) return false;
        AvailabilitySlot that = (AvailabilitySlot) o;
        return Objects.equals(start, that.start) && Objects.equals(end, that.end);
    }

    @Override
    public int hashCode() { return Objects.hash(start, end); }
}

