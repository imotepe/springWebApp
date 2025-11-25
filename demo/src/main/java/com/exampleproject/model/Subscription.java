package com.exampleproject.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Objects;

@Document("subscriptions")
public class Subscription {
    @Id
    private String id;
    private String orgId;
    private String planCode;
    private SubscriptionStatus status;
    private LocalDateTime startAt;
    private LocalDateTime endsAt;
    private String createdBy;
    private LocalDateTime createdAt;

    public Subscription() {
    }

    public Subscription(String id,
                        String orgId,
                        String planCode,
                        SubscriptionStatus status,
                        LocalDateTime startAt,
                        LocalDateTime endsAt,
                        String createdBy,
                        LocalDateTime createdAt) {
        this.id = id;
        this.orgId = orgId;
        this.planCode = planCode;
        this.status = status;
        this.startAt = startAt;
        this.endsAt = endsAt;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrgId() {
        return orgId;
    }

    public void setOrgId(String orgId) {
        this.orgId = orgId;
    }

    public String getPlanCode() {
        return planCode;
    }

    public void setPlanCode(String planCode) {
        this.planCode = planCode;
    }

    public SubscriptionStatus getStatus() {
        return status;
    }

    public void setStatus(SubscriptionStatus status) {
        this.status = status;
    }

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public void setStartAt(LocalDateTime startAt) {
        this.startAt = startAt;
    }

    public LocalDateTime getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(LocalDateTime endsAt) {
        this.endsAt = endsAt;
    }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Subscription)) return false;
        Subscription that = (Subscription) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Subscription{" +
                "id='" + id + '\'' +
                ", orgId='" + orgId + '\'' +
                ", planCode='" + planCode + '\'' +
                ", status=" + status +
                ", startAt=" + startAt +
                ", endsAt=" + endsAt +
                ", createdBy='" + createdBy + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
