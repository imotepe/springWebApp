package com.exampleproject.model;

/**
 * Hierarchie des privileges utilisateurs.
 * Chaque valeur correspond au role fonctionnel decrit dans la specification.
 */
public enum UserRole {
    SUPER_PLATFORM_ADMIN,
    PLATFORM_ADMIN,
    ORGANIZATION_ADMIN,
    SERVICE_MANAGER,
    AGENT,
    AUDITOR,
    PRACTITIONER
}

