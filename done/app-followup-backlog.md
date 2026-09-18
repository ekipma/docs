# App follow-up backlog

Created: 2026-09-14. This file collects work that remains after the Fiber REST migration was completed. Keep this as the active backlog for app/product follow-ups; `fiber-migration-plan.md` is now historical.

## Release gates moved from Fiber migration

1. Configure and verify HTTPS API ingress.
   - Expected app API URL: `https://api.ekipma.ir`.
   - Build release app with `--dart-define=EKIPMA_API_URL=https://api.ekipma.ir`.
   - Verify `https://api.ekipma.ir/health/ready`.
   - Verify `/api/v1` version rejection returns `426 VER_ERR`.
   - Verify CORS preflight from the shipped app/web origin.

2. Verify avatar/CDN delivery.
   - Server `CDN_URL` currently points at `https://cdn.ekipma.ir`.
   - Checked-in nginx serves `/images/` from server uploads.
   - After deploy, upload an avatar and confirm the returned `photoUrl` is reachable over HTTPS from every target platform.

3. Verify target platforms and telemetry.
   - Android has internet permission.
   - iOS has no insecure transport exception, so release builds must use HTTPS.
   - Sentry is enabled with `tracesSampleRate = 1.0`; choose a production sampling rate before release.

4. Finish release validation.
   - Run `flutter analyze --no-pub --no-fatal-infos`.
   - Run targeted REST tests: `flutter test --no-pub test/rest_client_test.dart test/rest_user_test.dart`.
   - Run server tests before app release if the API contract changes: `make test` in `ekipma-server`.

## App-side features mentioned but not implemented

1. Groups entry point exists in the home chips UI, but the groups feature has no action wired.
  Source: `lib/modules/features/chips_feature.dart`.

2. Invite QR widget renders a placeholder value (`"some url"`) instead of a real invite/referral/deep-link URL.
  Source: `lib/modules/x_widgets/x_invite_qr.dart`.

3. Premium upgrade flow upgrades immediately when the user has enough tokens; confirmation UI is marked but not implemented.
  Source: `lib/screens/external/premium_screen.dart`.

4. Registration country picker still has hard-coded/provider-coupled behavior and incomplete state cleanup.
  Source: `lib/screens/register/mobile_tab.dart`.

5. Route edge cases for missing `friendId` / `recordId` parameters are noted but not tested.
  Source: `lib/router.dart`.

6. User status empty/null handling is a placeholder.
  Source: `lib/modules/features/user_status_feature.dart`.

7. Profile form still treats `public` as nullable in UI initialization even though REST profile now returns a required boolean.
  Source: `lib/screens/settings/profile_screen.dart`.

8. Numeric IDs are still stored as Dart `int`; REST parsing rejects values above `2^53 - 1`. Full string-backed ID/BigInt model and persisted-cache migration remain before any environment can produce larger IDs.
  Source: `lib/models/user.dart`, `lib/models/record.dart`, `test/rest_user_test.dart`.

9. App/product references to token balance, plan upgrade, and asset spending are implemented against the REST store endpoints, but replacement real-money payment/provider UX is not enabled. The current app shows payments unavailable when the user lacks tokens.
  Sources: `lib/screens/external/shop_screen.dart`, `lib/screens/external/premium_screen.dart`, `lib/modules/cards/asset_card.dart`.

10. Intentionally unsupported legacy features remain unsupported unless product scope changes: wallet/crypto endpoints, token transfer, record integrity lookup, lost-record lookup, and repay rejection.

## Undone TODO inventory in `ekipma-app`

1. `lib/router.dart:164` - Add/test behavior for missing `friendId` route parameter.
2. `lib/router.dart:182` - Add/test behavior for missing `recordId` route parameter.
3. `lib/modules/x_widgets/x_invite_qr.dart:20` - Replace placeholder QR value with a real invite/referral URL.
4. `lib/modules/features/user_status_feature.dart:27` - Replace placeholder null-user rendering.
5. `lib/modules/features/chips_feature.dart:59` - Wire or remove the groups chip action.
6. `lib/screens/register/register_screen.dart:27` - Sync register tabs with `go_router` for back navigation.
7. `lib/screens/register/mobile_tab.dart:58` - Remove hard-coded country code/provider coupling.
8. `lib/screens/register/mobile_tab.dart:108` - Replace broad `setState` with focused state update.
9. `lib/screens/external/premium_screen.dart:35` - Add premium purchase confirmation dialog.
10. `lib/screens/settings/profile_screen.dart:74` - Remove nullable `public` fallback once model/UI contract is cleaned.

## Notes

- Do not reintroduce gRPC/protobuf transport or wallet/crypto endpoints as part of these follow-ups.
- Keep `accessToken` / `refreshToken` storage keys stable.
- Any server schema changes still go through the current migration workflow.
