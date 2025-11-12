package com.exampleproject.model;

import java.time.LocalDateTime;
import java.util.Objects;

public class CustomerInteraction {
    private String id;
    private String appointmentId;
    private AppointmentEventType type;
    private AppointmentStatus status;
    private String comment;
    private String createdBy;
    private LocalDateTime createdAt;

    public CustomerInteraction() {}

    public CustomerInteraction(
            String id,
            String appointmentId,
            AppointmentEventType type,
            AppointmentStatus status,
            String comment,
            String createdBy,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.appointmentId = appointmentId;
        this.type = type;
        this.status = status;
        this.comment = comment;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }

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
        if (!(o instanceof CustomerInteraction)) return false;
        CustomerInteraction that = (CustomerInteraction) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }
}

