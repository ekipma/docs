# Fiber REST migration — completed handoff

Updated: 2026-09-14. Work in `ekipma-app`, `ekipma-server`, and `ekipma-api`, all on `rest`.
Status: done. Keep this document as historical migration context. Active follow-up work moved to `docs/app-followup-backlog.md`.

## Current checkpoint

- This pre-production project has no retained database data. Migrations are squashed into a single baseline migration for fresh installs; production startup validates schema only and never runs AutoMigrate. Apply schema with `make migrate-dev` / `make migrate-prod` before starting the server.
- Server: Go toolchain 1.25.7, Fiber 3.0.0. The executable is Fiber-only and listens at `HTTP_ADDR` (default `127.0.0.1:8085`); real readiness, shutdown, request IDs, recovery, limits, deadlines, version checking, and explicit `HTTP_ALLOWED_ORIGINS` are implemented. Forwarded IPs are not trusted. The gRPC adapter, middleware, and helpers are removed; `go.mod` no longer contains gRPC, protobuf, or `ekipma-api` modules.
- Shared `server/service/auth.go`: login, refresh, profile. HTTP DTOs in `server/httpapi/` are handwritten. `ekipma-api/openapi/ekipma.v1.yaml` now documents the implemented REST routes, schemas, error envelope, record variants, and request fixtures. Do not run `compile.sh` casually because it publishes.
- App: REST is the only transport. Handwritten `lib/models/api_types.dart` owns auth and record/payment enums; Dio-backed `RestClient` owns HTTP auth/profile/friends/records/store/avatar calls, JSON encoding, timeouts, and multipart upload. The generated API package, gRPC/protobuf dependencies, client channel, legacy fallback branches, protobuf form-error parsing, gRPC stream/error helpers, and direct `package:http` transport code are removed.
- Crypto payments are removed from app/server runtime. Balances, plan upgrades and asset spending remain. No replacement provider is enabled. Unused non-crypto helper is preserved at `server/payments/zarinpal`.
- Historical wallet tables/columns and SQL migrations remain untouched; hashing for passwords/record integrity is unrelated to crypto payments and stays.
- REST friends list/manual add/remove, sequential contact-import batches, plan/assets, avatar upload, and record routes are wired on the server. Server auth/user/error and persisted record model types are transport-neutral. Record mutations append journal rows in their database transaction. Flutter records, friends, user/auth, and UI use REST DTOs only. Record HTTP contract/sync tests cover cursor restart, tombstones, account isolation, timestamp ties, and concurrent writes.

## Endpoint status (prefix `/api/v1`)

| Feature | REST status | App status |
| --- | --- | --- |
| POST `/auth/login`, POST `/auth/refresh`, GET `/me` | Implemented | REST only |
| POST `/auth/otp/send`, `/auth/otp/verify`, `/auth/register`, PATCH `/me` | Implemented | REST only |
| GET/POST `/me/friends`, DELETE `/me/friends/{id}` | Implemented | REST only |
| POST `/me/friends/import` | Implemented | REST only |
| POST `/records`, GET `/records/changes`, DELETE `/records/{id}` | Implemented; contract/sync tests added | REST only |
| POST `/records/{id}/repay/accept`, `/records/{id}/turn/advance` | Implemented; documented in OpenAPI | REST only |
| PUT `/me/avatar` (multipart JPEG) | Implemented | REST only |
| POST `/me/plan/upgrade`, `/me/assets/purchase` | Implemented | REST only |

Do not implement wallet/crypto endpoints. Existing unsupported token transfer, integrity, lost-record lookup, and repay rejection stay unsupported. OTP delivery supports registration only; reject other operations before any side effects.

## Run and verify

App URL: `--dart-define=EKIPMA_API_URL=http://127.0.0.1:8085`.
Choose a reachable dev host on devices; use verified HTTPS for remote/release traffic. Record UI requires a database that has the existing journal migration; there is no fallback transport.

Available local executables:
- Go: `/home/garfield/go/pkg/mod/golang.org/toolchain@v0.0.1-go1.25.7.linux-amd64/bin/go` (`GOCACHE=/tmp/ekipma-gocache` avoids workspace sandbox cache errors).
- Flutter: `/home/garfield/flutter-sdk/flutter/bin/flutter` (SDK/cache writes may require escalation).

Last verified: `make test` in `ekipma-server`; `ekipma-api/openapi/ekipma.v1.yaml` parses as YAML; `flutter test --no-pub test/rest_client_test.dart test/rest_user_test.dart` passes after allowing Flutter SDK cache writes. Flutter analysis is still a release-gate check.

```sh
# server
 go test ./...
 go build ./...
# app
 flutter test --no-pub test/rest_client_test.dart test/rest_user_test.dart
 flutter analyze --no-pub --no-fatal-infos
# both
 git diff --check
 git diff --cached --check
```

Use fake providers/isolated fixtures; never call production SMS/payment services during verification. Dependencies are cached now; no local replacements belong in go.mod.

## Contract and correctness rules

- Versioned camelCase JSON; decimal strings for uint64 IDs/balances/prices; UTC RFC3339 timestamps; stable enum strings with unknown handling. Explicit DTOs, never GORM JSON or protobuf JSON. Keep Friend visibility separate from User.
- Current app stores numeric IDs; HTTP parsing rejects values above 2^53−1 rather than rounding. Full string-backed ID/BigInt and persisted-cache migration remains required before cutover. Preserve `accessToken`/`refreshToken` storage keys and cached account data.
- Bearer access token; refresh validates its own token independently. `X-Version: v0.8.1` initially; incompatible versions return 426 `VER_ERR`, never trigger refresh. Error envelope: `{error:{code,message,fields,requestId}}`; preserve localized symbolic codes, redact private errors and credentials.
- Services own application orchestration; HTTP handlers own headers, validation, and rate limits. Do not add a second transport.
- PATCH must distinguish omitted from false/empty, reject null/unknown/server-controlled fields, and mutate only editable profile fields (`name,email,ccNo,public`).
- No timeout retry or automatic transport fallback for writes. Only eligible token rejection **before the handler mutates** can permit one authenticated replay. Otherwise idempotency must be durable and scoped to user/operation/payload.
- Fiber reuses contexts: copy retained values, use bounded standard contexts, and independent bounded contexts for accepted background work. Preserve 512 KiB JPEG limit; decode real bytes, stage/atomically replace, clean failures, return committed photo URL.
- JWT environment loading was fixed to assign signing keys (previously only changed a local slice). Affected deployed sessions require reauthentication; never accept nil-key tokens as fallback.

## Follow-up backlog

The Fiber REST migration is complete. Remaining rollout checks, app-side unimplemented features, and open app TODOs are tracked in `docs/app-followup-backlog.md`.
