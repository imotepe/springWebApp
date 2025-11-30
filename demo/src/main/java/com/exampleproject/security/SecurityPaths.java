package com.exampleproject.security;

/**
 * Central allowlist for endpoints that should stay publicly accessible.
 */
public final class SecurityPaths {

    private SecurityPaths() {
        // utility class
    }

    public static final String[] PUBLIC = {
            "/",

            // Auth and public APIs
            "/api/auth/**",
            "/api/public/**",

            // Ops and docs
            "/actuator/**",
            "/docs/**",
            "/error"
    };
}
