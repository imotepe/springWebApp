package com.exampleproject.security;

import com.exampleproject.model.User;
import com.exampleproject.model.UserRole;
import com.exampleproject.service.SubscriptionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
@SuppressWarnings("null")
public class SubscriptionGuardFilter extends OncePerRequestFilter {

    private static final Set<UserRole> PLATFORM_ROLES = Set.of(
            UserRole.SUPER_PLATFORM_ADMIN,
            UserRole.PLATFORM_ADMIN
    );

    private final SubscriptionService subscriptionService;

    public SubscriptionGuardFilter(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/actuator")
                || path.startsWith("/docs")
                || path.startsWith("/api/auth")
                || path.startsWith("/error");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            filterChain.doFilter(request, response);
            return;
        }

        User user = (User) authentication.getPrincipal();
        if (user.getRoles().stream().anyMatch(PLATFORM_ROLES::contains)) {
            filterChain.doFilter(request, response);
            return;
        }

        String orgId = user.getHomeOrganizationId();
        if (orgId == null || orgId.isBlank()) {
            response.sendError(HttpStatus.FORBIDDEN.value(), "Organization-scoped users require a home organization");
            return;
        }

        try {
            subscriptionService.ensureActiveSubscription(orgId);
        } catch (Exception ex) {
            // ensure we return the same response status/message thrown by the service
            if (ex instanceof org.springframework.web.server.ResponseStatusException rse) {
                response.sendError(rse.getStatusCode().value(), rse.getReason());
            } else {
                response.sendError(HttpStatus.FORBIDDEN.value(), "Subscription check failed");
            }
            return;
        }

        filterChain.doFilter(request, response);
    }
}
