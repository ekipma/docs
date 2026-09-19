A good approach is to add deep links around group invitations first, using the existing `go_router` setup.

Current state:

- Flutter already uses `go_router`.
- Group invite codes already exist and can be joined through `POST /api/v1/groups/join`.
- Android and iOS have no deep-link configuration yet.
- The router currently redirects unauthenticated users to splash/login, so invite links need to survive authentication.

Proposed deep-link design:

```text
https://app.ekipma.ir/join/<invite-code>
ekipma://join/<invite-code>
```

Domain ownership:

- `app.ekipma.ir` is the Flutter web app and the primary HTTPS deep-link host.
- `ekipma.ir` is the public landing page and is not used for app-link association.
- When the app is unavailable, the fallback/download experience remains under `app.ekipma.ir`.

Flow:

1. User opens an invitation link.
2. App launches and parses `/join/<invite-code>`.
3. If logged out, preserve the invite code and redirect to login/register.
4. After authentication, show a confirmation screen:
   - group name, if available
   - “Join group” action
   - invalid/expired invite handling
5. Call the existing `joinGroup(code)` API.
6. Refresh groups and navigate to `/groups`.
7. If the app is already running, handle the incoming link without restarting navigation.

Implementation plan:

1. Add a dedicated route:
   - `/join/:code`
   - likely a new `JoinGroupScreen`
   - validate and URL-decode the invite code.

2. Add a pending deep-link model/service:
   - store the intended route or invite code while authentication is in progress
   - restore it after `AuthLoaded`
   - avoid putting sensitive or mutable state only in widget state.

3. Update router redirects:
   - allow `/join/:code` for logged-out users
   - redirect to login while retaining the original destination
   - after login, return to the join screen rather than always going home.

4. Configure Android:
   - add an intent filter for `https://app.ekipma.ir/join/...`
   - optionally support the custom `ekipma://` scheme
   - add Digital Asset Links at `https://app.ekipma.ir/.well-known/assetlinks.json` for verified App Links.

5. Configure iOS:
   - Deferred until an iOS release is planned.
   - add Associated Domains capability: `applinks:app.ekipma.ir`
   - add Apple App Site Association at `https://app.ekipma.ir/.well-known/apple-app-site-association`
   - optionally support a custom URL scheme as a fallback.

6. Add web fallback:
   - make `/join/<code>` resolve to a useful web page or app-download page when the app is unavailable.
   - Keep the same URL structure so links are shareable from the existing web presence.

7. Add tests:
   - cold start with a link
   - warm app with a link
   - logged-in user
   - logged-out user
   - invalid invite code
   - expired/duplicate membership
   - Android verified link
   - iOS universal link
   - browser fallback.

I recommend using HTTPS App Links/Universal Links as the primary format and the custom scheme only as a fallback. The first implementation should focus on group invitations; record and profile links can then reuse the same routing infrastructure.
