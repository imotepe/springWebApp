package com.exampleproject.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

@Document("organization_types")
public class OrganizationType {
    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String description;

    public OrganizationType() {}

    public OrganizationType(String id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrganizationType)) return false;
        OrganizationType that = (OrganizationType) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "OrganizationType{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}

