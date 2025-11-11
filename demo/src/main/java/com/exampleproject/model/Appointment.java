package com.exampleproject.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Objects;

@Document("appointments")
public class Appointment {
    @Id
    private String id;
    private String customerId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;
    private String notes;

    public Appointment() {
    }

    public Appointment(
            String id,
            String customerId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            AppointmentStatus status,
            String notes
    ) {
        this.id = id;
        this.customerId = customerId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.notes = notes;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Appointment)) {
            return false;
        }
        Appointment that = (Appointment) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Appointment{"
                + "id='" + id + '\''
                + ", customerId='" + customerId + '\''
                + ", startTime=" + startTime
                + ", endTime=" + endTime
                + ", status=" + status
                + '}';
    }
}
