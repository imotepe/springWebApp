package com.exampleproject.service;

import com.exampleproject.model.Subscription;
import com.exampleproject.model.SubscriptionStatus;
import com.exampleproject.repository.SubscriptionRepository;
import com.exampleproject.security.CurrentUserProvider;
import com.exampleproject.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@SuppressWarnings("null")
public class SubscriptionService {
    private static final String DEFAULT_PLAN = "TRIAL_30D";
    private static final int DEFAULT_TRIAL_DAYS = 30;

    private final SubscriptionRepository subscriptionRepository;
    private final CurrentUserProvider currentUserProvider;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, CurrentUserProvider currentUserProvider) {
        this.subscriptionRepository = subscriptionRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public Subscription createDefaultForOrg(String orgId) {
        LocalDateTime now = LocalDateTime.now();
        Subscription subscription = new Subscription(
                UUID.randomUUID().toString(),
                orgId,
                DEFAULT_PLAN,
                SubscriptionStatus.TRIAL,
                now,
                now.plusDays(DEFAULT_TRIAL_DAYS),
                resolveCreatedBy(),
                now
        );
        return subscriptionRepository.save(subscription);
    }

    public Optional<Subscription> findByOrgId(String orgId) {
        return subscriptionRepository.findByOrgId(orgId);
    }

    public Subscription ensureActiveSubscription(String orgId) {
        Subscription subscription = subscriptionRepository.findByOrgId(orgId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Subscription missing for organization " + orgId));
        SubscriptionStatus status = subscription.getStatus();

        if (isExpired(subscription)) {
            subscription.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(subscription);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Subscription expired for organization " + orgId);
        }

        if (status == SubscriptionStatus.PREACTIVE
                || status == SubscriptionStatus.SUSPENDED
                || status == SubscriptionStatus.CANCELLED
                || status == SubscriptionStatus.EXPIRED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Subscription inactive for organization " + orgId + " (" + status + ")");
        }

        return subscription;
    }

    private boolean isExpired(Subscription subscription) {
        LocalDateTime endsAt = subscription.getEndsAt();
        return endsAt != null && endsAt.isBefore(LocalDateTime.now());
    }

    private String resolveCreatedBy() {
        try {
            User user = currentUserProvider.getCurrentUser();
            return user.getId() != null ? user.getId() : user.getUsername();
        } catch (Exception ex) {
            return "system";
        }
    }
}
