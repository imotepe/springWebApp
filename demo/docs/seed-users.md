Seed users (initial data)
-------------------------

| username           | email                          | password      | role                    | organization             |
|--------------------|--------------------------------|---------------|-------------------------|--------------------------|
| nabil.haddad       | nabil.haddad@example.com       | ChangeMe123!  | PLATFORM_ADMIN          | Platform (none)          |
| sophie.bernard     | sophie.bernard@example.com     | ChangeMe123!  | ORGANIZATION_ADMIN      | Aurora Service Center    |
| alex.martin        | alex.martin@example.com        | ChangeMe123!  | SERVICE_MANAGER         | Aurora Service Center    |
| naima.khelifi      | naima.khelifi@example.com      | ChangeMe123!  | AGENT                   | Aurora Service Center    |
| luc.nguyen         | luc.nguyen@example.com         | ChangeMe123!  | AUDITOR                 | Aurora Service Center    |
| emma.leroy         | emma.leroy@example.com         | ChangeMe123!  | PRACTITIONER            | Aurora Service Center    |
| aitbelakcemi       | aitbelkacem.lyes@gmail.com     | Nac456*l      | SUPER_PLATFORM_ADMIN    | Global (none)            |
| super.admin        | super.admin@example.com        | ChangeMe123!  | SUPER_PLATFORM_ADMIN    | Global (none)            |
| lea.fontaine       | lea.fontaine@riviera.fr        | ChangeMe123!  | ORGANIZATION_ADMIN      | Riviera Community Hub    |
| mohamed.benali     | mohamed.benali@riviera.fr      | ChangeMe123!  | SERVICE_MANAGER         | Riviera Community Hub    |
| chloe.perrin       | chloe.perrin@riviera.fr        | ChangeMe123!  | AGENT                   | Riviera Community Hub    |
| antoine.gillet     | antoine.gillet@riviera.fr      | ChangeMe123!  | AUDITOR                 | Riviera Community Hub    |
| julie.ferre        | julie.ferre@riviera.fr         | ChangeMe123!  | PRACTITIONER            | Riviera Community Hub    |
| david.morel        | david.morel@helix.health       | ChangeMe123!  | ORGANIZATION_ADMIN      | Helix Medical Group      |
| pauline.renard     | pauline.renard@helix.health    | ChangeMe123!  | SERVICE_MANAGER         | Helix Medical Group      |
| marc.diallo        | marc.diallo@helix.health       | ChangeMe123!  | AGENT                   | Helix Medical Group      |
| ines.rahman        | ines.rahman@helix.health       | ChangeMe123!  | AUDITOR                 | Helix Medical Group      |
| samuel.lacroix     | samuel.lacroix@helix.health    | ChangeMe123!  | PRACTITIONER            | Helix Medical Group      |

Notes:
- `ChangeMe123!` is the default password used in `DataInitializer`.
- `SUPER_PLATFORM_ADMIN` users are global: they are not assigned to any organization but can access and manage every one.
- `PLATFORM_ADMIN` users are global as well; they can only create/manage organizations they create themselves, lose write/delete access to those orgs after 24h, and cannot create users with `PLATFORM_ADMIN` or `SUPER_PLATFORM_ADMIN` roles.
- The user `aitbelakcemi` uses the specific password `Nac456*l` as defined in the seed data.

Seed customers (initial data)
-----------------------------

| name             | email                       | organization           |
|------------------|-----------------------------|------------------------|
| Jean Dupont      | jean.dupont@example.com     | Aurora Service Center  |
| Emma Leroy       | emma.leroy@example.com      | Aurora Service Center  |
| Ines Perez       | ines.perez@riviera.fr       | Riviera Community Hub  |
| Martin Cho       | martin.cho@helix.fr         | Helix Medical Group    |
