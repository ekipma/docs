# Ekipma admin panel — implementation plan

Status: proposed scope; no admin implementation has started.
Date: 2026-09-15.

## Purpose and assumptions

Create an internal English operations console at `/admin` in the existing `web` project. Its main jobs are to understand adoption by friend groups and roommates, resolve account issues, manage Premium access, and inspect operational problems.

Assume the first release is used by the owner. Design permissions so support staff can be added later, but do not build a staff-management product before it is needed. All production screens use actual backend data; fixtures are confined to development and tests. An unavailable metric is labeled unavailable, not shown as zero.

Use the landing's dark neutral palette, restrained lavender branding, and expense/turn/plan accents. Favor readable tables, compact charts, clear status labels, and useful search. Keep decorative motion out of working screens.

## What exists today

Verified against current implementation rather than older backlog documents:

- Go/Fiber REST endpoints cover authentication, profiles, friends, groups, records, Premium upgrades, asset purchases, and avatars.
- Group admin permissions are scoped to individual groups. They are not platform administrator permissions.
- `User.Role` exists, but the inspected routes do not enforce a platform administrator role. JWT user claims contain the user ID; role must be resolved and checked by the server.
- The profile response does not expose administrative permissions.
- Group membership and record change synchronization are implemented.
- New users receive 15 days of Premium. Plan state alone does not establish whether access was paid, granted, or a trial.
- Expense and plan creation can produce a separate record for each assignee. Counting record rows or summing repeated `Pay.Total` values inflates product activity and expense totals.
- Premium upgrades and cosmetics spend internal tokens. A current balance is not a transaction ledger or a revenue history.
- Asset definitions are bundled in the Flutter app. The purchase service currently accepts UUID/price/hash inputs; a dynamic catalog requires server-authoritative pricing and an app migration.
- Notifications have a basic model, without a campaign/delivery system in the inspected endpoints.
- Website links and displayed monthly pricing currently live in `web/app/site-config.ts`.
- Current authentication stores one refresh-token hash per user. Admin sessions should be independent so browser administration does not interfere with the same user's mobile session.

## First release: seven core sections

| Section | Route | Screens and functions |
| --- | --- | --- |
| Overview | `/admin` | Date range, signups, total users/groups, current Premium access, feature usage, recent operational issues, links to filtered lists |
| Users | `/admin/users` | Paginated search by ID/name/mobile/email, plan/status filters, account detail, group memberships, access history, audit trail |
| Groups | `/admin/groups` | Search by ID/name, owner, member count, visibility, creation date, aggregate activity; group details and membership list |
| Activity | `/admin/activity` | Tabs for Expenses, Turns, Plans; filter by user/group/date/state; read-only support investigation of linked records and sync history |
| Memberships | `/admin/memberships` | Current/expired access, upcoming expiry, known trial/grant/upgrade provenance, owner-only grant/extend/revoke with reason and history |
| System | `/admin/system` | API/database readiness and last checked time; deployed/minimum client versions and configured limits where available; request-ID lookup links when a log source is connected |
| Audit log | `/admin/audit` | Search/filter administrator actions by actor, target, action, result and time; changes and reasons; sensitive access events |

### User detail

Show profile summary, joined date, account status, Premium expiry, groups, aggregate activity, existing cosmetic ownership, and links to relevant records. Mask contact information in list views; only expose needed fields in authorized detail responses. Do not include password hashes, OTPs, token secrets, or card numbers in admin DTOs or exports.

Add suspension/restoration only with backend account-state enforcement and session invalidation. Do not implement suspension as a UI flag. Require a reason and record the resulting action.

Keep group and shared record inspection read-only in this release. Private record contents require an explicit authorized reveal with a reason and audit event. Do not add bulk record deletion, debt editing, repayment acceptance on behalf of a user, or account impersonation to the initial scope.

### Overview metrics

The most useful long-term product measure is **weekly collaborating groups**: groups in which at least two distinct members performed a qualifying action during the last seven days. A qualifying action is creating a shared expense/plan, advancing a turn, or confirming a repayment. Being assigned a record is not an action.

Other useful measures:

- New registrations and new groups over a selected period.
- Group size distribution and groups with multiple members.
- Adoption of each of the three pillars.
- Time from joining to first shared activity, once events are available.
- Current Premium access and upcoming expirations.
- Active groups returning in subsequent weeks, once sufficient event history exists.

Metric rules:

1. Add one logical activity ID for each newly created shared expense/plan, shared by its assignee rows. Preserve existing numeric record IDs and wire contracts. Do not guess historical groupings from title or timestamp.
2. Record minimal product events with actor ID, group ID, action, logical activity ID and timestamp. Exclude private titles/descriptions/locations. Define retention before collecting these events.
3. Distinguish current state counts from action counts. Existing sync journal entries are not a complete actor-attributed analytics history.
4. Clearly label pre-instrumentation historical gaps and start dates.
5. Separate currencies. Shared expenses are not company revenue; omit money-volume cards from the first overview.
6. Track entitlement provenance moving forward. Mark legacy access source unknown if it cannot be established reliably. Do not infer paid subscriptions from active Premium access.
7. Show payment revenue and recurring revenue only after a payment/subscription ledger exists.

## Second release: business and content operations

### Website settings — `/admin/website`

Edit store URLs, APK URL, contact email, displayed pricing, FAQ and selected landing copy using structured fields. Add draft/preview/publish and revision history. Persist configuration on the server; update the landing to consume published settings and refresh its cache. Display pricing remains distinct from billable prices and actual plan entitlements.

### Assets — `/admin/assets`

Manage skins, frames, sounds, visibility and prices only after migrating catalog authority to the server. Preserve legacy ownership references when prices change: current hashes incorporate UUID and price, so simply replacing them could break ownership. Add app catalog consumption before claiming new uploads are available to users.

### Support — `/admin/support`

Add a ticket/report inbox when there is an app or website intake flow. Link cases to users/groups, assign status, and store internal notes with a clear access policy. Do not show an empty inbox as though reports are already integrated.

### Company inquiries — `/admin/inquiries`

A small lead list with organization, contact, estimated team size, needs, notes, and status. Requires a real inquiry form or another defined intake source. Do not turn existing consumer groups into company tenants implicitly; organization accounts and company billing need separate product design.

### Announcements — `/admin/announcements`

Draft, preview, target and publish in-app notices when app delivery exists. Bulk email, SMS and push campaigns are separate work requiring delivery, failure reporting and audience rules.

### Payments and ledger

Once the replacement payment provider is implemented, add purchases, provider references, payment state, access changes and immutable token movements. Token adjustments must use a ledger with reason, idempotency and audit, not direct balance editing. Crypto/wallet functionality remains outside the proposed scope.

## Architecture and access

1. Keep `/admin` in Next.js with its own layout, navigation and metadata; exclude it from public indexing. Indexing controls are not authorization.
2. Add dedicated Go endpoints under `/api/v1/admin`. Go owns access checks, data validation, pagination, transactions and audit writes. Never connect the web browser directly to the database.
3. Use same-origin Next.js server endpoints as the browser-facing layer. Keep an opaque admin session cookie HttpOnly, Secure in production, with suitable SameSite, expiry and CSRF/origin protection for mutations. Keep upstream credentials server-side.
4. Bootstrap the first owner explicitly from a trusted server-side setup command. No public administrator registration. Define platform roles separately from group roles and plan tiers, including the legacy `UserPlanGod` value.
5. Give admin authentication an independent session lifecycle, revocation and MFA enrollment before public production access. Check current permissions for every admin API request; layout redirects alone are insufficient.
6. Start with owner permissions. Model capabilities for later support/viewer access. Owner-only writes are explicit capabilities, not arbitrary table editing.
7. Add an append-only `AdminAuditEvent` model and write successful changes plus their audit event atomically. Log denied attempts without copying sensitive payloads. Bound pagination/export sizes and allowlist filter/sort fields.
8. Use string IDs in TypeScript/JSON to preserve the server's existing large-ID contract.
9. Use explicit read models/DTOs for admin views. Distinguish an empty list, an unavailable backend, lack of permission and a failed request.

## Backend additions by milestone

### Foundation

- Explicit platform role semantics and owner bootstrap.
- Independent revocable admin sessions and MFA.
- Admin authorization middleware/capabilities.
- Admin audit events.
- Admin API contracts and integration tests.

### Read-only operations

- Paginated user/group/activity search and detail queries.
- Current plan/expiry queries and accurate basic aggregate counts.
- Health adapter with timeouts, freshness and unavailable states.
- Logical activity grouping and actor-attributed events for future trustworthy analytics.

### Controlled operations

- Membership grant/extend/revoke service with entitlement source and history.
- User suspension/restoration with actual API/session enforcement.
- Transactional audit writes and idempotency where retries could repeat effects.
- Explicit boundaries for sensitive record inspection.

All schema changes use the existing Atlas migration workflow. Existing mobile behavior and REST routes remain covered by regression tests.

## Implementation order

1. **Foundation:** admin login, owner bootstrap, session/MFA, permissions, audit model, separate web layout.
2. **Read-only release:** Overview, Users, Groups, Activity, Memberships, System, Audit log, wired to real APIs. Implement telemetry definitions before showing activity metrics that require them.
3. **Controlled actions:** membership administration and account suspension/restoration with explanations, confirmations, audit and tests.
4. **Content/business operations:** website settings first; then assets, support and company inquiries as their data/intake sources become available.
5. **Growth and billing:** retention cohorts, payment ledger and announcements after the required integrations exist.

## Definition of done for the first release

- Unauthenticated users and ordinary app/group admins cannot access admin pages or APIs.
- Admin login does not invalidate mobile sessions. Logout, expiry, revocation and suspension are verified.
- Sensitive reads and all administrative changes obey permissions; mutation requests resist CSRF and forged role/target input.
- Search, filters, sorting and pagination use real data and preserve large IDs.
- User/group/record navigation is coherent; loading, empty, error and permission states are designed.
- Expense/plan totals do not double-count assignee copies. Unknown historical provenance and unavailable telemetry are explicit.
- Membership changes behave correctly and produce an audit trail; retries do not extend access twice.
- Tables and dialogs work with a keyboard and at tablet/desktop widths, with a usable small-screen fallback.
- Frontend lint/build, targeted backend authorization/operation tests and browser checks pass.

## Decisions for kickoff

Recommended defaults: owner-only launch, English, live backend integration, read-only shared records, and the seven core sections above. Confirm the owner identity through the setup flow rather than placing an account credential in this document. Staff roles, bulk messaging, dynamic assets, billing and a full CMS are follow-on work.
