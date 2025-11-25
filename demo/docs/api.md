# API Reference

Base URL: all endpoints are served under `/api`. Responses are JSON and follow standard Spring Boot error semantics (HTTP 4xx for validation/auth, 5xx for unexpected errors). Every `/api/**` request must be authenticated with a valid JWT.

## Common Headers

| Header | Usage |
| --- | --- |
| `Authorization` | `Bearer <token>` issued by `POST /api/auth/token`. |

## Authentication (`/api/auth/token`)

Obtain a JWT:

- **Request**: `POST /api/auth/token`

```json
{
  "username": "claire.dubois",
  "password": "ChangeMe123!"
}
```

- **Response**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Use the returned token in the `Authorization: Bearer ...` header for all subsequent calls.  
_Tip_: the seeded demo users all share the default password `ChangeMe123!`.

You can also provide `email` instead of `username`; both values are evaluated case-insensitively but only one identifier is required alongside the password.  
JWT payloads now include `homeOrganizationId` so downstream services can scope UI/session logic without an additional lookup. Accounts whose status is not `ACTIVE` cannot authenticate; they produce `403 FORBIDDEN`. If a user's optional `expiresAt` timestamp (ISO-8601) is reached, the platform automatically marks them `EXPIRED` on the next login attempt and denies authentication.

Organization-scoped users also require an active subscription for their home organization. If the subscription is expired, suspended, or cancelled the API returns `403 FORBIDDEN` for every `/api/**` request.

---

### Organization Scoping

- `SUPER_PLATFORM_ADMIN` and `PLATFORM_ADMIN` users may access every organization.
- All other roles are automatically restricted to their `homeOrganizationId`. Every repository call applies this scope, so supplying another `orgId` in the query or payload results in `403 FORBIDDEN`.
- When scoped users create entities (`Customer`, `Resource`, `Appointment`, etc.), the API overwrites/ignores the provided `orgId` and stores their home organization automatically.

---

## Appointments (`/api/appointments`)

| Method & Path | Description | Parameters |
| --- | --- | --- |
| `GET /api/appointments` | List appointments. Practitioners are automatically scoped to their resource and only see their own events. | Query: `customerId` _(optional)_, `from` & `to` (ISO-8601, optional filter). |
| `GET /api/appointments/{id}` | Fetch a single appointment. Practitioner events are filtered to those authored by the caller. | None |
| `POST /api/appointments` | Create a new appointment. | Body: `Appointment` payload. |
| `PUT /api/appointments/{id}` | Update an appointment. | Body: `Appointment`. |
| `POST /api/appointments/{id}/events` | Append an `AppointmentEvent`. Practitioners automatically generate `PRACTITIONER_NOTE` events, mark the appointment `COMPLETED`, and cannot edit others' entries. | Body: `AppointmentEvent`. |
| `DELETE /api/appointments/{id}` | Delete an appointment. | None |

## Appointment Types (`/api/appointment-types`)

| Method | Description | Notes |
| --- | --- | --- |
| `GET /api/appointment-types` | List appointment types, optionally filtered by `orgId`. | Query: `orgId` optional. |
| `GET /api/appointment-types/{id}` | Retrieve one appointment type. | None |
| `POST /api/appointment-types` | Create a type. | Body: `AppointmentType`. |
| `PUT /api/appointment-types/{id}` | Update a type. | Body: `AppointmentType`. |
| `DELETE /api/appointment-types/{id}` | Delete a type. | None |

## Availability (`/api/availability`)

`GET /api/availability`: compute availability slots for an org & appointment type.  
Required query params: `orgId`, `appointmentTypeId`, time range `from`, `to` (ISO datetime). Optional `resourceId` narrows computation to a specific resource.

## Customers (/api/customers)

| Method | Description | Notes |
| --- | --- | --- |
| GET /api/customers | List customers. | Automatically scoped to the caller's home organization unless they are a platform admin. |
| GET /api/customers/{id} | Retrieve one customer. |  |
| POST /api/customers | Create customer. | Body: Customer (includes orgId; ignored for scoped users). |
| PUT /api/customers/{id} | Update customer. | Body: Customer. |
| DELETE /api/customers/{id} | Delete. |  |
| GET /api/customers/{id}/appointments | List appointments for a customer. | Reuses appointment service. |

Customers now carry an orgId attribute. Platform administrators must provide it when creating a customer; organization-scoped users always write to (and can only read from) their own organization.

## Organizations (`/api/organizations`)

Standard CRUD (GET collection, GET item, POST, PUT, DELETE). Organizations reference addresses, schedule configs, etc. Validation ensures type names exist.

- Creating an organization automatically provisions a default subscription (30-day trial, plan `TRIAL_30D`). Platform administrators can later change status/plan through internal tooling or direct DB edits (no public API yet).
- Organization-scoped users cannot access `/api/**` when their organization's subscription status is `EXPIRED`, `SUSPENDED`, or `CANCELLED`; the API responds `403 FORBIDDEN`.
- Seeded plan catalog (codes): `TRIAL_30D` (default 30-day trial), `TRIAL_180D`, `TRIAL_360D`, `SUB_MONTHLY`, `SUB_90D`, `SUB_180D`, `SUB_360D`, `SUB_720D`. Prices are seeded to `0 EUR`; adjust as needed in production.
- `databaseName` is reserved for future multi-tenant sharding. All organizations currently share the same Mongo database, so the field will be `null` in responses and can be ignored.
- Deleting an organization only removes its document from the primary collection; no dedicated tenant databases are created or dropped.

## Organization Types (`/api/organization-types`)

CRUD endpoints at `/api/organization-types` mirroring those for organizations.

## Resources (`/api/resources`)

| Method | Description |
| --- | --- |
| `GET /api/resources` | List resources (optional `orgId` filter). Includes both human and asset resources; human resources expose `kind=HUMAN` and `practitionerUserId`. |
| `GET /api/resources/{id}` | Retrieve resource. |
| `POST /api/resources` | Create resource. |
| `PUT /api/resources/{id}` | Update resource. |
| `DELETE /api/resources/{id}` | Delete resource. |

## Users (`/api/users`)

CRUD endpoints for managing platform users and their `roles` set:  
`GET /api/users`, `GET /api/users/{id}`, `POST`, `PUT`, `DELETE`. Use these to assign platform/organization/practitioner roles described in `docs/roles.md`.

- `GET /api/users` accepts an optional `orgId` query parameter when called by platform admins; organization-scoped callers automatically receive only their own users regardless of the query.
- `homeOrganizationId` is persisted for every user (null for global platform admins) and is emitted back on read responses.
- `expiresAt` (ISO-8601 timestamp) can be set to automatically mark a user `EXPIRED` when the instant passes.

POST/PUT payloads include `username`, `firstName`, `lastName`, `email`, optional `password`, the `roles` array, optional `homeOrganizationId`, and `status`. Example:

```json
{
  "username": "paul.martin",
  "firstName": "Paul",
  "lastName": "Martin",
  "email": "paul.martin@example.com",
  "password": "ChangeMe123!",
  "roles": ["PRACTITIONER"],
  "homeOrganizationId": "org-aurora-retail",
  "status": "ACTIVE",
  "expiresAt": "2026-01-01T00:00:00"
}
```

---

### Notes on Role Behavior

- Practitioner users (role `PRACTITIONER`) must be linked to both a `homeOrganizationId` and a `Resource` (`practitionerUserId`). They can only:
  - List appointments assigned to their resource.
  - View appointment events they personally created.
  - Add closing notes (`PRACTITIONER_NOTE`) that may mark appointments as `COMPLETED`.
- Other roles (Agent, Service Manager, etc.) have unrestricted access to appointment and comment data subject to higher-level security configuration.
- Organization-scoped callers cannot assign `SUPER_PLATFORM_ADMIN` or `PLATFORM_ADMIN` roles or manage users belonging to other organizations.
- User statuses: `ACTIVE`, `SUSPENDED`, `EXPIRED`, `BLOCKED`. Only `ACTIVE` users may authenticate; others receive `403 FORBIDDEN`. Use `SUSPENDED`/`BLOCKED` to disable access temporarily/permanently and `EXPIRED` (manually or via `expiresAt`) to signal credentials need renewal.
- `createdAt` is set automatically on creation and behaves as read-only metadata in responses.

Refer to `docs/roles.md` for the full privilege hierarchy, and use `homeOrganizationId` to enforce tenant-level scoping in UI flows or custom endpoints.

