package com.exampleproject.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Document("appointment_types")
public class AppointmentType {
    @Id
    private String id;
    private String orgId;
    private String name;
    private String category; // e.g., based on enterprise activity
    private Integer defaultDurationMinutes; // e.g., 30
    private List<Integer> allowedDurations = new ArrayList<>(); // e.g., [15,30,45,60]
    private boolean requiresResource = false; // if true, must specify resource
    private boolean active = true;

    public AppointmentType() {}

    public AppointmentType(
            String id,
            String orgId,
            String name,
            String category,
            Integer defaultDurationMinutes,
            List<Integer> allowedDurations,
            boolean requiresResource,
            boolean active
    ) {
        this.id = id;
        this.orgId = orgId;
        this.name = name;
        this.category = category;
        this.defaultDurationMinutes = defaultDurationMinutes;
        this.allowedDurations = allowedDurations;
        this.requiresResource = requiresResource;
        this.active = active;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrgId() { return orgId; }
    public void setOrgId(String orgId) { this.orgId = orgId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getDefaultDurationMinutes() { return defaultDurationMinutes; }
    public void setDefaultDurationMinutes(Integer defaultDurationMinutes) { this.defaultDurationMinutes = defaultDurationMinutes; }

    public List<Integer> getAllowedDurations() { return allowedDurations; }
    public void setAllowedDurations(List<Integer> allowedDurations) { this.allowedDurations = allowedDurations; }

    public boolean isRequiresResource() { return requiresResource; }
    public void setRequiresResource(boolean requiresResource) { this.requiresResource = requiresResource; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AppointmentType)) return false;
        AppointmentType that = (AppointmentType) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "AppointmentType{" +
                "id='" + id + '\'' +
                ", orgId='" + orgId + '\'' +
                ", name='" + name + '\'' +
                ", category='" + category + '\'' +
                ", defaultDurationMinutes=" + defaultDurationMinutes +
                '}';
    }
}

