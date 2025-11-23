package com.exampleproject.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Objects;
import java.util.Set;

@Document("users")
public class User {
    @Id
    private String id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private Set<UserRole> roles = EnumSet.noneOf(UserRole.class);
    private String homeOrganizationId;
    private UserStatus status = UserStatus.ACTIVE;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    public User() {}

    public User(String id, String username, String firstName, String lastName) {
        this(id, username, firstName, lastName, null, null, EnumSet.noneOf(UserRole.class), null, UserStatus.ACTIVE, null, null);
    }

    public User(
            String id,
            String username,
            String firstName,
            String lastName,
            String email,
            String password,
            Set<UserRole> roles
    ) {
        this(id, username, firstName, lastName, email, password, roles, null, UserStatus.ACTIVE, null, null);
    }

    public User(
            String id,
            String username,
            String firstName,
            String lastName,
            String email,
            String password,
            Set<UserRole> roles,
            String homeOrganizationId
    ) {
        this(id, username, firstName, lastName, email, password, roles, homeOrganizationId, UserStatus.ACTIVE, null, null);
    }

    public User(
            String id,
            String username,
            String firstName,
            String lastName,
            String email,
            String password,
            Set<UserRole> roles,
            String homeOrganizationId,
            UserStatus status
    ) {
        this(id, username, firstName, lastName, email, password, roles, homeOrganizationId, status, null, null);
    }

    public User(
            String id,
            String username,
            String firstName,
            String lastName,
            String email,
            String password,
            Set<UserRole> roles,
            String homeOrganizationId,
            UserStatus status,
            LocalDateTime expiresAt,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        setRoles(roles);
        this.homeOrganizationId = homeOrganizationId;
        this.status = status == null ? UserStatus.ACTIVE : status;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt == null ? LocalDateTime.now() : createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getName() {
        if (firstName == null && lastName == null) {
            return null;
        }
        if (firstName == null) {
            return lastName;
        }
        if (lastName == null) {
            return firstName;
        }
        return firstName + " " + lastName;
    }

    public void setName(String name) {
        if (name == null) {
            this.firstName = null;
            this.lastName = null;
            return;
        }
        String trimmed = name.trim();
        if (trimmed.isEmpty()) {
            this.firstName = null;
            this.lastName = null;
            return;
        }
        String[] parts = trimmed.split("\\s+", 2);
        this.firstName = parts[0];
        this.lastName = parts.length > 1 ? parts[1] : null;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

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

    public String getHomeOrganizationId() {
        return homeOrganizationId;
    }

    public void setHomeOrganizationId(String homeOrganizationId) {
        this.homeOrganizationId = homeOrganizationId;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status == null ? UserStatus.ACTIVE : status;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
                && Objects.equals(username, user.username)
                && Objects.equals(firstName, user.firstName)
                && Objects.equals(lastName, user.lastName)
                && Objects.equals(email, user.email)
                && Objects.equals(password, user.password)
                && Objects.equals(roles, user.roles)
                && Objects.equals(homeOrganizationId, user.homeOrganizationId)
                && status == user.status
                && Objects.equals(expiresAt, user.expiresAt)
                && Objects.equals(createdAt, user.createdAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, username, firstName, lastName, email, password, roles, homeOrganizationId, status, expiresAt, createdAt);
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", password='[PROTECTED]'" +
                ", roles=" + roles +
                ", homeOrganizationId='" + homeOrganizationId + '\'' +
                ", status=" + status +
                ", expiresAt=" + expiresAt +
                ", createdAt=" + createdAt +
                '}';
    }
}
