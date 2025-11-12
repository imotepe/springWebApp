package com.exampleproject.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

@Document("organizations")
public class Organization {
    @Id
    private String id;
    private String name;
    private String industry;
    private String type;
    private ScheduleConfig scheduleConfig;

    public Organization() {}

    public Organization(String id, String name, String industry, String type, ScheduleConfig scheduleConfig) {
        this.id = id;
        this.name = name;
        this.industry = industry;
        this.type = type;
        this.scheduleConfig = scheduleConfig;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public ScheduleConfig getScheduleConfig() { return scheduleConfig; }
    public void setScheduleConfig(ScheduleConfig scheduleConfig) { this.scheduleConfig = scheduleConfig; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Organization)) return false;
        Organization that = (Organization) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "Organization{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", industry='" + industry + '\'' +
                ", type='" + type + '\'' +
                '}';
    }
}

