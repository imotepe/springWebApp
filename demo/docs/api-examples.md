# API Examples

This companion to `docs/api.md` shows concrete request/response pairs using realistic payloads based on the seeded Mongo data (`app.initial-data.enabled=true`).

## Authentication

### Obtain a token

```http
POST /api/auth/token HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "username": "emma.leroy",
  "password": "ChangeMe123!"
}
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Use this token in the `Authorization` header (e.g., `Authorization: Bearer eyJhbGci...`) for the rest of the requests.

You may also provide `email` instead of `username`; both identifiers are matched case-insensitively before checking the password.

## Appointments

### Practitioner listing own appointments

```http
GET /api/appointments?from=2025-11-18T00:00:00&to=2025-11-30T00:00:00 HTTP/1.1
Host: localhost:8080
Authorization: Bearer <token-for-user-practitioner>
Accept: application/json
```

```json
[
  {
    "id": "appt-onsite-install",
    "orgId": "org-aurora-retail",
    "customerId": "customer-emma-leroy",
    "appointmentTypeId": "appt-installation",
    "resourceId": "resource-onsite-crew",
    "startTime": "2025-11-21T14:00:00",
    "endTime": "2025-11-21T15:30:00",
    "status": "SCHEDULED",
    "notes": "Installation pilote d'equipement",
    "events": [
      {
        "id": "appt-event-2",
        "type": "CUSTOMER_UPDATE",
        "status": "SCHEDULED",
        "comment": "Client confirme la presence d'un acces electrique",
        "createdBy": "emma.leroy@example.com",
        "createdAt": "2025-11-20T14:00:00"
      }
    ]
  }
]
```

> Practitioner tokens are automatically scoped to their linked resource, so they only see their own appointments and the events they personally created.

### Adding a practitioner note / closing an appointment

```http
POST /api/appointments/appt-onsite-install/events HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <token-for-user-practitioner>

{
  "comment": "Intervention terminee, installation conforme",
  "type": "PRACTITIONER_NOTE"
}
```

```json
{
  "id": "appt-onsite-install",
  "orgId": "org-aurora-retail",
  "customerId": "customer-emma-leroy",
  "appointmentTypeId": "appt-installation",
  "resourceId": "resource-onsite-crew",
  "startTime": "2025-11-21T14:00:00",
  "endTime": "2025-11-21T15:30:00",
  "status": "COMPLETED",
  "notes": "Installation pilote d'equipement",
  "events": [
    {
      "id": "generated-uuid",
      "type": "PRACTITIONER_NOTE",
      "status": "COMPLETED",
      "comment": "Intervention terminee, installation conforme",
      "createdBy": "user-practitioner",
      "createdAt": "2025-11-19T10:12:33"
    }
  ]
}
```

> The service injects `createdBy`, timestamps, and default status (`COMPLETED`) when a practitioner submits an event. Other roles must supply `comment` and may choose any allowed status.

### Agent listing all appointments

```http
GET /api/appointments HTTP/1.1
Host: localhost:8080
Authorization: Bearer <token-for-user-agent>
Accept: application/json
```

```json
[
  {
    "id": "appt-discovery-call",
    "orgId": "org-aurora-retail",
    "customerId": "customer-jean-dupont",
    "appointmentTypeId": "appt-consultation",
    "resourceId": "resource-crm-desk",
    "startTime": "2025-11-18T10:00:00",
    "endTime": "2025-11-18T10:30:00",
    "status": "SCHEDULED",
    "notes": "Decouverte des besoins CRM",
    "events": [
      {
        "id": "appt-event-1",
        "type": "INTERNAL_NOTE",
        "status": "SCHEDULED",
        "comment": "Creation automatique du rendez-vous",
        "createdBy": "system",
        "createdAt": "2025-11-17T12:00:00"
      }
    ]
  },
  {
    "id": "appt-onsite-install",
    "...": "..."
  }
]
```

Here the agent (`user-agent`) sees the full event history because they are not a practitioner.

## Customers

### Create customer

```http
POST /api/customers HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <token-for-user-agent>

{
  "name": "Dupont",
  "firstName": "Claire",
  "email": "claire.dupont@example.com",
  "phone": "+33 6 44 55 66 77",
  "dateOfBirth": "1990-03-14",
  "notes": "VIP retail customer"
}
```

```json
{
  "id": "generated-id",
  "orgId": "org-aurora-retail",
  "name": "Dupont",
  "firstName": "Claire",
  "email": "claire.dupont@example.com",
  "phone": "+33 6 44 55 66 77",
  "dateOfBirth": "1990-03-14",
  "notes": "VIP retail customer",
  "interactions": []
}
```

> Scoped users don't need to pass `orgId`; the API sets it to their home organization automatically. Platform admins must provide it explicitly when creating customers for specific tenants.

## Resources

### Creating a practitioner resource

```http
POST /api/resources HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <token-for-user-org-admin>

{
  "orgId": "org-aurora-retail",
  "name": "Dr. Paul Martin",
  "type": "medical",
  "allowedAppointmentTypeIds": ["appt-consultation"],
  "capacity": 1,
  "active": true,
  "kind": "HUMAN",
  "practitionerUserId": "user-dr-martin"
}
```

The response mirrors the payload and ensures `kind/HUMAN` plus the linkage to the practitioner user id.

## Users

### Listing users for one organization

```http
GET /api/users?orgId=org-aurora-retail HTTP/1.1
Host: localhost:8080
Authorization: Bearer <token-for-user-platform-admin>
Accept: application/json
```

```json
[
  {
    "id": "user-org-admin",
    "username": "sophie.bernard",
    "firstName": "Sophie",
    "lastName": "Bernard",
    "email": "sophie.bernard@example.com",
    "roles": ["ORGANIZATION_ADMIN"],
    "homeOrganizationId": "org-aurora-retail"
  },
  {
    "id": "user-practitioner",
    "username": "emma.leroy",
    "firstName": "Emma",
    "lastName": "Leroy",
    "email": "emma.leroy@example.com",
    "roles": ["PRACTITIONER"],
    "homeOrganizationId": "org-aurora-retail"
  }
]
```

### Assigning roles

```http
PUT /api/users/user-dr-martin HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <token-for-user-super-admin-aitbelkacem>

{
  "username": "paul.martin",
  "firstName": "Paul",
  "lastName": "Martin",
  "email": "paul.martin@example.com",
  "roles": ["PRACTITIONER"],
  "homeOrganizationId": "org-aurora-retail",
  "status": "ACTIVE",
  "expiresAt": "2026-01-01T00:00:00"
}
```

```json
{
  "id": "user-dr-martin",
  "username": "paul.martin",
  "firstName": "Paul",
  "lastName": "Martin",
  "email": "paul.martin@example.com",
  "roles": ["PRACTITIONER"],
  "homeOrganizationId": "org-aurora-retail",
  "status": "ACTIVE",
  "expiresAt": "2026-01-01T00:00:00",
  "createdAt": "2025-11-01T10:00:00"
}
```

> Link this user to a `Resource` via `practitionerUserId` so practitioner-specific filtering works as expected. Platform-level accounts can omit `homeOrganizationId`. Use the `status` field (`ACTIVE`, `SUSPENDED`, `EXPIRED`, `BLOCKED`) plus `expiresAt` to disable or expire accounts without deleting them.

---

## Organizations

### Create organization (shared database)

```http
POST /api/organizations HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer <token-for-user-org-admin>

{
  "name": "Nordic Support Hub",
  "industry": "Field Services",
  "type": "org-type-retail",
  "phone": "+46 700 11 22 33",
  "address": {
    "street": "3 Centralplan",
    "city": "Stockholm",
    "state": "Stockholm",
    "postalCode": "111 20",
    "country": "Sweden"
  },
  "scheduleConfig": {
    "workingDays": ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"],
    "businessHours": {
      "MONDAY": [{"start": "08:00", "end": "16:00"}]
    },
    "breaks": {},
    "holidays": []
  }
}
```

```json
{
  "id": "org-nordic-support-hub",
  "name": "Nordic Support Hub",
  "industry": "Field Services",
  "type": "org-type-retail",
  "phone": "+46 700 11 22 33",
  "address": {
    "street": "3 Centralplan",
    "city": "Stockholm",
    "state": "Stockholm",
    "postalCode": "111 20",
    "country": "Sweden"
  },
  "location": null,
  "scheduleConfig": {
    "workingDays": ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"],
    "businessHours": {
      "MONDAY": [{"start": "08:00", "end": "16:00"}]
    },
    "breaks": {},
    "holidays": []
  },
  // databaseName removed
}
```

> `databaseName` was removed because all organizations share the same database.

---

Use these samples as templates for manual testing or onboarding API consumers. Adjust IDs and timestamps to match your environment.
