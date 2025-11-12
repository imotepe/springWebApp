package com.exampleproject.model;

import java.time.LocalDateTime;
import java.util.Objects;

public class AppointmentEvent {
    private String id;
    private AppointmentEventType type;
    private AppointmentStatus status;
    private String comment;
    private String createdBy;
    private LocalDateTime createdAt;

    public AppointmentEvent() {}

    public AppointmentEvent(
            String id,
            AppointmentEventType type,
            AppointmentStatus status,
            String comment,
            String createdBy,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.type = type;
        this.status = status;
        this.comment = comment;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public AppointmentEventType getType() { return type; }
    public void setType(AppointmentEventType type) { this.type = type; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AppointmentEvent)) return false;
        AppointmentEvent that = (AppointmentEvent) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }
}

