package com.exampleproject.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.EnumSet;
import java.util.Objects;
import java.util.Set;

@Document("users")
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private Set<UserRole> roles = EnumSet.noneOf(UserRole.class);

    public User() {}

    public User(String id, String name, String email) {
        this(id, name, email, EnumSet.noneOf(UserRole.class));
    }

    public User(String id, String name, String email, Set<UserRole> roles) {
        this.id = id;
        this.name = name;
        this.email = email;
        setRoles(roles);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Set<UserRole> getRoles() {
        return roles.isEmpty() ? EnumSet.noneOf(UserRole.class) : EnumSet.copyOf(roles);
    }
    public void setRoles(Set<UserRole> roles) {
        if (roles == null || roles.isEmpty()) {
            this.roles = EnumSet.noneOf(UserRole.class);
            return;
        }
        this.roles = EnumSet.copyOf(roles);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof User)) {
            return false;
        }
        User user = (User) o;
        return Objects.equals(id, user.id)
                && Objects.equals(name, user.name)
                && Objects.equals(email, user.email)
                && Objects.equals(roles, user.roles);
    }

    @Override
    public int hashCode() { return Objects.hash(id, name, email, roles); }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", roles=" + roles +
                '}';
    }
}
