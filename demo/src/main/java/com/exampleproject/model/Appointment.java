package com.exampleproject.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Document("appointments")
public class Appointment {
    @Id
    private String id;
    private String orgId; // tenant
    private String customerId;
    private String appointmentTypeId;
    private String resourceId; // optional
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;
    private String notes;
    private List<AppointmentEvent> events = new ArrayList<>();

    public Appointment() {
    }

    public Appointment(
            String id,
            String orgId,
            String customerId,
            String appointmentTypeId,
            String resourceId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            AppointmentStatus status,
            String notes,
            List<AppointmentEvent> events
    ) {
        this.id = id;
        this.orgId = orgId;
        this.customerId = customerId;
        this.appointmentTypeId = appointmentTypeId;
        this.resourceId = resourceId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.notes = notes;
        if (events != null) {
            this.events = events;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrgId() { return orgId; }
    public void setOrgId(String orgId) { this.orgId = orgId; }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getAppointmentTypeId() { return appointmentTypeId; }
    public void setAppointmentTypeId(String appointmentTypeId) { this.appointmentTypeId = appointmentTypeId; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

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

    public List<AppointmentEvent> getEvents() { return events; }
    public void setEvents(List<AppointmentEvent> events) { this.events = events; }

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
                + ", orgId='" + orgId + '\''
                + ", customerId='" + customerId + '\''
                + ", appointmentTypeId='" + appointmentTypeId + '\''
                + ", resourceId='" + resourceId + '\''
                + ", startTime=" + startTime
                + ", endTime=" + endTime
                + ", status=" + status
                + '}';
    }
}
