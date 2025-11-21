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

---

## Appointments (`/api/appointments`)

| Method & Path | Description | Parameters |
| --- | --- | --- |
| `GET /api/appointments` | List appointments. Practitioners are automatically scoped to their resource and only see their own events. | Query: `customerId` _(optional)_, `from` & `to` (ISO-8601, optional filter). |
| `GET /api/appointments/{id}` | Fetch a single appointment. Practitioner events are filtered to those authored by the caller. | – |
| `POST /api/appointments` | Create a new appointment. | Body: `Appointment` payload. |
| `PUT /api/appointments/{id}` | Update an appointment. | Body: `Appointment`. |
| `POST /api/appointments/{id}/events` | Append an `AppointmentEvent`. Practitioners automatically generate `PRACTITIONER_NOTE` events, mark the appointment `COMPLETED`, and cannot edit others' entries. | Body: `AppointmentEvent`. |
| `DELETE /api/appointments/{id}` | Delete an appointment. | – |

## Appointment Types (`/api/appointment-types`)

| Method | Description | Notes |
| --- | --- | --- |
| `GET /api/appointment-types` | List appointment types, optionally filtered by `orgId`. | Query: `orgId` optional. |
| `GET /api/appointment-types/{id}` | Retrieve one appointment type. | – |
| `POST /api/appointment-types` | Create a type. | Body: `AppointmentType`. |
| `PUT /api/appointment-types/{id}` | Update a type. | Body: `AppointmentType`. |
| `DELETE /api/appointment-types/{id}` | Delete a type. | – |

## Availability (`/api/availability`)

`GET /api/availability`: compute availability slots for an org & appointment type.  
Required query params: `orgId`, `appointmentTypeId`, time range `from`, `to` (ISO datetime). Optional `resourceId` narrows computation to a specific resource.

## Customers (`/api/customers`)

| Method | Description | Notes |
| --- | --- | --- |
| `GET /api/customers` | List all customers. | – |
| `GET /api/customers/{id}` | Retrieve one customer. | – |
| `POST /api/customers` | Create customer. | Body: `Customer`. |
| `PUT /api/customers/{id}` | Update customer. | Body: `Customer`. |
| `DELETE /api/customers/{id}` | Delete. | – |
| `GET /api/customers/{id}/appointments` | List appointments for a customer. | Reuses appointment service. |

## Organizations (`/api/organizations`)

Standard CRUD (GET collection, GET item, POST, PUT, DELETE). Organizations reference addresses, schedule configs, etc. Validation ensures type names exist.

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

POST/PUT payloads include `username`, `firstName`, `lastName`, `email`, optional `password`, and the `roles` array. Example:

```json
{
  "username": "paul.martin",
  "firstName": "Paul",
  "lastName": "Martin",
  "email": "paul.martin@example.com",
  "password": "ChangeMe123!",
  "roles": ["PRACTITIONER"]
}
```

---

### Notes on Role Behavior

- Practitioner users (role `PRACTITIONER`) must be linked to a `Resource` (`practitionerUserId`). They can only:
  - List appointments assigned to their resource.
  - View appointment events they personally created.
  - Add closing notes (`PRACTITIONER_NOTE`) that may mark appointments as `COMPLETED`.
- Other roles (Agent, Service Manager, etc.) have unrestricted access to appointment and comment data subject to higher-level security configuration.

Refer to `docs/roles.md` for the full privilege hierarchy.
