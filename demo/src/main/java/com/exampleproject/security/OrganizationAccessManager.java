package com.exampleproject.security;

import com.exampleproject.model.Organization;
import com.exampleproject.model.User;
import com.exampleproject.model.UserRole;
import com.exampleproject.repository.OrganizationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class OrganizationAccessManager {

    private static final Set<UserRole> PLATFORM_ROLES = EnumSet.of(
            UserRole.SUPER_PLATFORM_ADMIN,
            UserRole.PLATFORM_ADMIN
    );

    private final CurrentUserProvider currentUserProvider;
    private final OrganizationRepository organizationRepository;

    public OrganizationAccessManager(CurrentUserProvider currentUserProvider,
                                     OrganizationRepository organizationRepository) {
        this.currentUserProvider = currentUserProvider;
        this.organizationRepository = organizationRepository;
    }

    public enum AccessIntent {
        READ,
        WRITE
    }

    public OrganizationAccessContext currentContext() {
        User user = currentUserProvider.getCurrentUser();
        Set<UserRole> roles = user.getRoles() == null ? EnumSet.noneOf(UserRole.class) : EnumSet.copyOf(user.getRoles());
        boolean agentScoped = roles.contains(UserRole.AGENT);
        boolean superAdmin = roles.contains(UserRole.SUPER_PLATFORM_ADMIN) && !agentScoped;
        boolean platformAdmin = roles.contains(UserRole.PLATFORM_ADMIN) && !agentScoped;
        boolean platformUser = superAdmin || platformAdmin;
        return new OrganizationAccessContext(
                user,
                superAdmin,
                platformAdmin,
                platformUser,
                user.getHomeOrganizationId()
        );
    }

    public final class OrganizationAccessContext {
        private final User user;
        private final boolean superAdmin;
        private final boolean platformAdmin;
        private final boolean platformUser;
        private final String homeOrganizationId;
        private final OrganizationRepository organizationRepository;

        private OrganizationAccessContext(User user,
                                          boolean superAdmin,
                                          boolean platformAdmin,
                                          boolean platformUser,
                                          String homeOrganizationId) {
            this.user = user;
            this.superAdmin = superAdmin;
            this.platformAdmin = platformAdmin;
            this.platformUser = platformUser;
            this.homeOrganizationId = homeOrganizationId;
            this.organizationRepository = OrganizationAccessManager.this.organizationRepository;
        }

        public User user() {
            return user;
        }

        public boolean isPlatformUser() {
            return platformUser;
        }

        public boolean isSuperAdmin() {
            return superAdmin;
        }

        public boolean isPlatformAdmin() {
            return platformAdmin;
        }

        public Optional<String> scopedOrgId() {
            if (platformUser) {
                return Optional.empty();
            }
            return Optional.ofNullable(homeOrganizationId);
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
            checkOrgAccess(orgId, AccessIntent.READ);
        }

        public void checkOrgAccess(String orgId, AccessIntent intent) {
            if (orgId == null || orgId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organization id is required");
            }
            if (superAdmin) {
                return;
            }
            if (platformAdmin) {
                Organization org = organizationRepository.findById(orgId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Organization not found or not owned by caller"));
                if (org.getCreatedBy() == null || !org.getCreatedBy().equals(user.getId())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Platform admins can only access organizations they created");
                }
                if (intent == AccessIntent.WRITE) {
                    LocalDateTime createdAt = org.getCreatedAt();
                    if (createdAt == null || createdAt.isBefore(LocalDateTime.now().minusHours(24))) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Write window expired (24h after organization creation)");
                    }
                }
                return;
            }
            String expected = requireOrgScope();
            if (!orgId.equals(expected)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Resource belongs to another organization");
            }
        }

        public Set<String> permittedOrgIds(AccessIntent intent) {
            if (superAdmin) {
                return Set.of();
            }
            if (platformAdmin) {
                return organizationRepository.findByCreatedBy(user.getId()).stream()
                        .filter(org -> intent == AccessIntent.READ
                                || (org.getCreatedAt() != null && !org.getCreatedAt().isBefore(LocalDateTime.now().minusHours(24))))
                        .map(Organization::getId)
                        .collect(Collectors.toSet());
            }
            return Set.of(requireOrgScope());
        }
    }
}
