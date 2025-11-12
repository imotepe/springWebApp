package com.exampleproject.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Document("resources")
public class Resource {
    @Id
    private String id;
    private String orgId;
    private String name;
    private String type; // e.g., official, street, sand
    private Set<String> allowedAppointmentTypeIds = new HashSet<>();
    private ScheduleConfig scheduleOverride; // optional per-resource schedule
    private Integer capacity; // optional: number of parallel bookings
    private boolean active = true;

    public Resource() {}

    public Resource(
            String id,
            String orgId,
            String name,
            String type,
            Set<String> allowedAppointmentTypeIds,
            ScheduleConfig scheduleOverride,
            Integer capacity,
            boolean active
    ) {
        this.id = id;
        this.orgId = orgId;
        this.name = name;
        this.type = type;
        this.allowedAppointmentTypeIds = allowedAppointmentTypeIds;
        this.scheduleOverride = scheduleOverride;
        this.capacity = capacity;
        this.active = active;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrgId() { return orgId; }
    public void setOrgId(String orgId) { this.orgId = orgId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Set<String> getAllowedAppointmentTypeIds() { return allowedAppointmentTypeIds; }
    public void setAllowedAppointmentTypeIds(Set<String> allowedAppointmentTypeIds) { this.allowedAppointmentTypeIds = allowedAppointmentTypeIds; }

    public ScheduleConfig getScheduleOverride() { return scheduleOverride; }
    public void setScheduleOverride(ScheduleConfig scheduleOverride) { this.scheduleOverride = scheduleOverride; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Resource)) return false;
        Resource resource = (Resource) o;
        return Objects.equals(id, resource.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "Resource{" +
                "id='" + id + '\'' +
                ", orgId='" + orgId + '\'' +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                '}';
    }
}

