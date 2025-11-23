package com.exampleproject.security;

import com.exampleproject.model.User;
import com.exampleproject.model.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.EnumSet;
import java.util.Optional;
import java.util.Set;

@Component
public class OrganizationAccessManager {

    private static final Set<UserRole> PLATFORM_ROLES = EnumSet.of(
            UserRole.SUPER_PLATFORM_ADMIN,
            UserRole.PLATFORM_ADMIN
    );

    private final CurrentUserProvider currentUserProvider;

    public OrganizationAccessManager(CurrentUserProvider currentUserProvider) {
        this.currentUserProvider = currentUserProvider;
    }

    public OrganizationAccessContext currentContext() {
        User user = currentUserProvider.getCurrentUser();
        boolean platformUser = user.getRoles().stream().anyMatch(PLATFORM_ROLES::contains);
        return new OrganizationAccessContext(user, platformUser, user.getHomeOrganizationId());
    }

    public static final class OrganizationAccessContext {
        private final User user;
        private final boolean platformUser;
        private final String homeOrganizationId;

        private OrganizationAccessContext(User user, boolean platformUser, String homeOrganizationId) {
            this.user = user;
            this.platformUser = platformUser;
            this.homeOrganizationId = homeOrganizationId;
        }

        public User user() {
            return user;
        }

        public boolean isPlatformUser() {
            return platformUser;
        }

        public Optional<String> scopedOrgId() {
            return platformUser ? Optional.empty() : Optional.ofNullable(homeOrganizationId);
        }

        public String requireOrgScope() {
            if (platformUser) {
                throw new IllegalStateException("Platform users have no org scope restrictions");
            }
            if (homeOrganizationId == null || homeOrganizationId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not assigned to an organization");
            }
            return homeOrganizationId;
        }

        public void checkOrgAccess(String orgId) {
            if (platformUser) {
                return;
            }
            String expected = requireOrgScope();
            if (orgId == null || !orgId.equals(expected)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Resource belongs to another organization");
            }
        }
    }
}
