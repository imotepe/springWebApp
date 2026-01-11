package com.exampleproject.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Document("resources")
public class Resource {
    @Id
    private String id;
    private String orgId;
    private String name;
    private String type; // e.g., official, street, sand
    @JsonIgnore
    private String photoPath;
    @JsonIgnore
    private List<ResourcePhoto> photos = new ArrayList<>();
    private Set<String> allowedAppointmentTypeIds = new HashSet<>();
    private ScheduleConfig scheduleOverride; // optional per-resource schedule
    private Integer capacity; // optional: number of parallel bookings
    private boolean active = true;
    private ResourceKind kind = ResourceKind.ASSET;
    private String practitionerUserId;

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
        this(id, orgId, name, type, allowedAppointmentTypeIds, scheduleOverride, capacity, active, ResourceKind.ASSET, null);
    }

    public Resource(
            String id,
            String orgId,
            String name,
            String type,
            Set<String> allowedAppointmentTypeIds,
            ScheduleConfig scheduleOverride,
            Integer capacity,
            boolean active,
            ResourceKind kind,
            String practitionerUserId
    ) {
        this.id = id;
        this.orgId = orgId;
        this.name = name;
        this.type = type;
        setAllowedAppointmentTypeIds(allowedAppointmentTypeIds);
        this.scheduleOverride = scheduleOverride;
        this.capacity = capacity;
        this.active = active;
        this.kind = kind == null ? ResourceKind.ASSET : kind;
        this.practitionerUserId = practitionerUserId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrgId() { return orgId; }
    public void setOrgId(String orgId) { this.orgId = orgId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPhotoPath() { return photoPath; }
    public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }

    public List<ResourcePhoto> getPhotos() { return photos; }
    public void setPhotos(List<ResourcePhoto> photos) {
        this.photos = photos == null ? new ArrayList<>() : new ArrayList<>(photos);
    }

    public Set<String> getAllowedAppointmentTypeIds() { return allowedAppointmentTypeIds; }
    public void setAllowedAppointmentTypeIds(Set<String> allowedAppointmentTypeIds) {
        this.allowedAppointmentTypeIds = allowedAppointmentTypeIds == null
                ? new HashSet<>()
                : new HashSet<>(allowedAppointmentTypeIds);
    }

    public ScheduleConfig getScheduleOverride() { return scheduleOverride; }
    public void setScheduleOverride(ScheduleConfig scheduleOverride) { this.scheduleOverride = scheduleOverride; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public ResourceKind getKind() { return kind; }
    public void setKind(ResourceKind kind) {
        this.kind = kind == null ? ResourceKind.ASSET : kind;
    }

    public String getPractitionerUserId() { return practitionerUserId; }
    public void setPractitionerUserId(String practitionerUserId) { this.practitionerUserId = practitionerUserId; }

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
                ", kind=" + kind +
                ", practitionerUserId='" + practitionerUserId + '\'' +
                '}';
    }
}
