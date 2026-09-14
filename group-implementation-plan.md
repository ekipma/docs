# Group implementation plan

Created: 2026-09-14.

This plan captures the backend work for groups, also called ekips in product copy.

## Existing state

1. The app exposes a Groups chip, but it has no action wired yet.
   Source: `ekipma-app/lib/modules/features/chips_feature.dart`.

2. The REST record contract already accepts and returns `groupId`.
   Sources: `ekipma-api/openapi/ekipma.v1.yaml`, `ekipma-server/httpapi/records.go`.

3. The server already has a basic `Group` model and `groups` table.
   Sources: `ekipma-server/models/group.go`, `ekipma-server/migrations/20260914000000_baseline.sql`.

4. There is no group service, REST route, API schema, authorization rule, or app-side group model/store yet.

## Product intent

Groups let users create an ekip with a set of members. A group can be used as a shortcut target when creating payments, turn-based activities, or plans, so the app can assign the record to everyone in the group.

Product labels:

1. English: `Group`
2. Persian: `اکیپ`
3. Persian unofficial: `گله`

Groups are private by default. Public visibility is an opt-in setting for search/discovery only; membership still requires joining by invite code or an admin-managed action.

## Model decision

Use the existing `groups` table as the canonical backend model.

Do not implement groups as rows in `users` unless there is a later product reason to make groups log in, own tokens, or behave as first-class user accounts. The current schema already has `groups`, while `recs.group` / REST `groupId` already point naturally at a group entity.

## Backend domain model

Replace the current array-based membership with normalized membership tables.

1. `groups`
   - `id`
   - `created_at`, `updated_at`, `deleted_at`
   - `name`, required, length aligned with user/display-name rules
   - `desc`, optional
   - `admin_id`, required, references `users.id`
   - `code`, required unique private invite code
   - `public`, required boolean, defaults to `false`
   - `photo_url` or group avatar UUID, optional

2. `group_members`
   - `group_id`, references `groups.id`
   - `user_id`, references `users.id`
   - `role`, enum/string: `admin` or `member`
   - `created_at`
   - unique `(group_id, user_id)`

3. Keep the invariant that a group cannot have fewer than one member.
   - The admin is always a member.
   - Creating a group inserts the group and admin membership in one transaction.
   - Leaving/removing the final member is rejected unless the operation deletes the group.

4. Keep the current `recs.group` field, but treat `0` as "no group" and positive values as `groups.id`.

## API shape

Add group endpoints under `/api/v1/groups`.

1. `POST /groups`
   - Creates a group with the authenticated user as admin.
   - Request: `{ "name": string, "desc": string }`
   - Optional later/admin advanced field: `{ "public": boolean }`, default `false` when omitted.
   - Response: `201 { "group": Group }`

2. `GET /groups`
   - Lists groups where the authenticated user is a member.
   - Response: `200 { "groups": Group[] }`

3. `GET /groups/:id`
   - Returns one group if the authenticated user is a member.
   - Public groups are not returned by ID to non-members unless a separate discovery endpoint explicitly allows that behavior.
   - Response: `200 { "group": Group }`

4. `PATCH /groups/:id`
   - Admin-only update for `name`, `desc`, `public`, and avatar metadata.
   - Response: `200 { "group": Group }`

5. `POST /groups/:id/invite/renew`
   - Admin-only private invite-code rotation.
   - Response: `200 { "group": Group }`

6. `POST /groups/join`
   - Joins a group by private invite code.
   - Request: `{ "code": string }`
   - Adds user to `group_members`.
   - Response: `200 { "group": Group }`

7. `DELETE /groups/:id/members/me`
   - Lets the authenticated user leave a group.
   - If user is the admin, reject while other members exist unless transfer/delete semantics are added.
   - Response: `204`

8. `DELETE /groups/:id/members/:userId`
   - Admin-only member removal.
   - Cannot remove the admin through this endpoint.
   - Response: `204`

9. Later, optional discovery:
   - `GET /groups/search?q=...`
   - Return public groups only.
   - Private groups never appear in search/discovery.

## Record creation behavior

1. `CreateRecords` should validate `groupId` when it is nonzero.
   - Group must exist.
   - Author must be a group member.

2. When `groupId` is nonzero and `assignees` is empty, expand assignees to current group members.

3. When `groupId` is nonzero and `assignees` is not empty, require every assignee to be a member of that group.

4. Keep existing record behavior for `groupId = 0`.

5. Record change sync currently returns records where the user is author or assignee. That remains sufficient if group records expand into per-user records. If future group-only records are introduced, sync must also include group membership.

## Backend implementation steps

1. Replace `models.Group.Users pq.Int64Array` with normalized associations.

2. Add `models.GroupMember` and include it in `models.Models`.

3. Generate an Atlas migration.
   - Existing baseline has `groups.users integer[]`; add migration to create `group_members`, backfill any existing users array if data matters, then remove `groups.users`.
   - Add `groups.admin_id`, `groups.code`, and `groups.public`.
   - Set `groups.public` to `false` by default and backfill existing rows as private.
   - Add indexes for `groups.code`, `groups.public`, and group membership lookup.

4. Add model methods in `models/group.go`.
   - `CreateGroup(ctx, input, adminID)`
   - `GetGroupByID(ctx, id)`
   - `GroupsForUser(ctx, userID)`
   - `GroupByCode(ctx, code)`
   - `AddGroupMember(ctx, groupID, userID)`
   - `RemoveGroupMember(ctx, groupID, userID)`
   - `RenewGroupCode(ctx, groupID)`
   - `IsGroupMember(ctx, groupID, userID)`
   - `IsGroupAdmin(ctx, groupID, userID)`

5. Add `service/groups.go`.
   - Enforce admin/member permissions here.
   - Keep transactions at the model layer when multiple DB writes must be atomic.

6. Add `httpapi/groups.go`.
   - Define group DTOs with string IDs.
   - Register routes from `httpapi.New`.
   - Extend `Backend` and `Production`.

7. Update `models.CreateRecords`.
   - Validate group access.
   - Expand or validate assignees against group membership.
   - Preserve existing tests for non-group records.

8. Update `ekipma-api/openapi/ekipma.v1.yaml`.
   - Add group schemas, routes, request/response examples, and error responses.

9. Add localized backend error codes.
   - Suggested codes: `GROUP_CREATE_ERR`, `GROUP_404_ERR`, `GROUP_JOIN_ERR`, `GROUP_LEAVE_ERR`, `GROUP_MEMBER_ERR`, `GROUP_ADMIN_ERR`, `GROUP_CODE_RENEW_ERR`.
   - Add app locale entries when client work starts.

## Test plan

1. Model/service tests:
   - create group creates admin membership
   - group cannot exist with zero members
   - join by code is idempotent or returns a clear duplicate error
   - invite-code renewal invalidates old code
   - non-admin cannot remove members or renew code
   - admin cannot leave while members remain

2. HTTP tests:
   - `POST /groups`
   - `GET /groups`
   - `GET /groups/:id`
   - `PATCH /groups/:id`
   - `POST /groups/join`
   - `POST /groups/:id/invite/renew`
   - leave/remove-member paths and permission failures

3. Record tests:
   - creating pay/turn/plan with `groupId` and empty assignees expands to group members
   - non-member cannot create a group record
   - assignee outside the group is rejected
   - old `groupId = 0` record creation still works

## App follow-up after backend

1. Add singular key `group`.
   - `en-US`: `Group`
   - `fa-IR`: `اکیپ`
   - `fa-UN`: `گله`

2. Add group model/store/client methods after the REST contract is implemented.

3. Wire the Groups chip to a groups screen.

4. Let create-record forms choose a group and either auto-populate assignees or submit `groupId` with empty assignees for backend expansion.

5. Add group invite-code display and renewal UI for admins.
