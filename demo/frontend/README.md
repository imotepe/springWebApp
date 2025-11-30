# Frontend (Expo)

Stack: React Native + Expo for web, Android, and iOS. The entry screen (`App.tsx`) renders a gradient-backed login form with Manrope typography and basic validation.

## Getting started
- Install deps: `npm install`
- Run web dev server: `npm run web`
- Run native (emulator/device): `npm run android` or `npm run ios`
- Type-check: `npx tsc --noEmit`

## API base URL
- Default (web + iOS): `http://localhost:8080`
- Default (Android emulator): `http://10.0.2.2:8080`
- Override for devices or remote servers: `EXPO_PUBLIC_API_BASE=http://<your-ip-or-host>:8080 npm run web`

## Screens
- Login: posts to `/api/auth/token`, captures the JWT, and routes into admin when it succeeds.
- Admin (SUPER_PLATFORM_ADMIN): list/create/update/delete organizations via `/api/organizations` and fetches types from `/api/organization-types`. Uses the JWT in the `Authorization: Bearer` header.

### Notes
- Ensure the user you log in with has the SUPER_PLATFORM_ADMIN role so org CRUD is allowed.
- If running on device, set `EXPO_PUBLIC_API_BASE` to your machine’s LAN IP and allow CORS for that origin.
- Persist the token with SecureStore/AsyncStorage for production use; the current state keeps it in memory.
