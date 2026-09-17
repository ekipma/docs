# Flutter token packages and 30-day Premium through Zibal

Date: 2026-09-17. Status: confirmed product rules; implementation planned. No application code changed.

This is the single plan for token packages, Premium behavior, backend changes, and Flutter checkout. The separate Premium discussion document has been consolidated here.

## Confirmed product rules

Users can purchase only **10, 20, 50, or 100 tokens**. There is no custom quantity, exact-shortfall top-up, or 5-token package: the smallest available purchase is 10 tokens. Enforce this on the backend, not just in Flutter.

Every newly fulfilled package purchase performs the same operation:

```text
tokenBalance += purchasedPackage.quantity
plan = Premium
premiumExpiresAt = fulfillmentTime + 30 days
```

This applies to free, expired, and already-Premium users. Each purchase resets Premium to exactly 30 days remaining; it does not add 30 days to the previous expiry. All packages have the same Premium benefit. No minimum-threshold or active/inactive eligibility branch is necessary because every allowed package includes the benefit.

Example: a user with 12 days remaining buys 20 tokens. They receive all 20 tokens and now have 30 days remaining, not 42. An unusual existing expiry more than 30 days away would also be replaced with the new 30-day expiry under this literal reset rule. Show the resulting reset behavior clearly; do not silently change it to `max(oldExpiry, newExpiry)`.

Token balance, owned items, and Premium access remain independent:

- Tokens buy named cards and other shop items; activating Premium spends none of them.
- Premium enables professional charts and selected tools.
- Spending tokens does not change Premium expiry.
- Premium expiry does not remove tokens, purchased cards, or user data.
- Holding tokens does not renew Premium. Only a new successfully fulfilled purchase resets expiry.
- There is no automatic billing or separate Premium purchase in this release.

## Packages and pricing

| Tokens | Price in toman | Backend amount in IRR | Premium benefit |
| ---: | ---: | ---: | --- |
| 10 | 100,000 | 1,000,000 | Reset to 30 days remaining |
| 20 | 200,000 | 2,000,000 | Reset to 30 days remaining |
| 50 | 500,000 | 5,000,000 | Reset to 30 days remaining |
| 100 | 1,000,000 | 10,000,000 | Reset to 30 days remaining |

Prices use the current server rate of 100,000 Rials per token. No discount was requested. Display toman explicitly in Persian UI; keep integer Rial amounts on the backend. Do not label larger packs “best value” while the unit price is identical.

Maintain one small backend package catalog as the source for both display and validation. Keep existing `tokens` API/model names and use consistent token terminology in the UI. An admin editor and a general promotion engine are unnecessary for these four fixed packages.

## Backend contract

Add authenticated `GET /api/v1/me/token-purchase-options`:

```json
{
  "enabled": true,
  "currency": "IRR",
  "premiumDurationSeconds": 2592000,
  "premiumExpiryPolicy": "reset_from_fulfillment",
  "offerVersion": "token-packages-v1",
  "packages": [
    {"quantity": 10, "amountIRR": "1000000"},
    {"quantity": 20, "amountIRR": "2000000"},
    {"quantity": 50, "amountIRR": "5000000"},
    {"quantity": 100, "amountIRR": "10000000"}
  ]
}
```

Retain `POST /api/v1/me/token-purchases` with a numeric body such as `{ "quantity": 20 }` to minimize API churn. Validate quantity against the catalog's exact allowlist before creating any order or calling Zibal. Reject all other values, including 1, 5, 15, 25, and 101; a min/max range is insufficient. Never accept client-supplied amounts or Premium duration.

Store the selected quantity, server amount, and applicable offer version/duration on the order. Use the creation response as the final payable amount. If the catalog changed, require confirmation of the returned price before browser launch and reuse the same saved order. Pending orders retain their promised terms. Existing pre-release pending orders require explicit legacy handling; do not retrospectively reject or relabel an already-created payment when introducing the package restriction. Already-fulfilled historical orders must never be reprocessed to award Premium.

Add stored `fulfilledAt` and `premiumExpiresAtAfterPurchase` fields (or equivalent) to the authenticated purchase response. The latter records that purchase's effect; `/api/v1/me` supplies current entitlement after subsequent purchases. Do not expose private profile fields through the public receipt endpoint.

## Atomic fulfillment and exact reset semantics

Reuse the existing payment verification and token-credit transaction. Do not create a separate eligibility system or a second app-triggered activation request.

1. Verify provider status, amount, and order identity using existing backend logic.
2. Lock the purchase and user consistently. If already fulfilled, return its stored result without changing balance or expiry.
3. After acquiring the locks, capture backend UTC fulfillment time. Credit the package quantity, set Premium, and set expiry to that timestamp plus exactly 2,592,000 seconds.
4. Persist the token movement, fulfilled order, and before/after plan timestamps for audit in the same transaction. A failure rolls back all changes.
5. Return the committed outcome. Flutter refreshes the profile and renders the server balance and expiry.

Using time captured after locking serializes distinct concurrent purchases correctly: both credit their tokens and each resets from its own fulfillment timestamp. Neither adds a full month to the prior expiry. A callback retry, status poll, app restart, or duplicate provider event is not a new purchase and cannot reset Premium again—even after it expires. Existing idempotency protection remains essential despite the simpler product rule.

Use fulfillment time so delayed verification gives the user the full 30 days. Display the UTC expiry in the user's locale/timezone and label the offer **30-day Premium**, not a calendar-month subscription. Audit every backend Premium check and Flutter gate for expiry awareness. Refresh on resume and expiry.

The current legacy upgrade spends 10 tokens for 30 days. Remove it from the new UI: Premium entry opens package selection instead. Define a deliberate old-client migration/version response before disabling that API; do not silently debit tokens or reinterpret its request. Existing balances and access remain untouched until an actual new purchase applies the reset rule.

For a future refund/reversal, use stored purchase provenance rather than restoring an old expiry over later purchases. Automated refunds and a general entitlement ledger are not assumed or required by this plan.

## Current implementation evidence

- The backend currently accepts quantities from 1 through 1,000; exact package validation is new work.
- `GET /api/v1/me/token-purchases/:id` checks ownership and reconciles pending payments. Callback verification and a background sweep can credit without the app running.
- Responses contain `id`, `quantity`, `amountIRR`, and `status`, with optional `trackId` and `refNumber`; creation adds `paymentURL`. Numeric response quantities and amounts are decimal strings; request quantity is numeric.
- Statuses are `created`, `pending`, `paid`, `failed`, and `amount_mismatch`. Crediting already has duplicate protection; Premium reset must join that transaction.
- `/payment/result` is implemented for browser results with a short-lived receipt capability.
- Flutter has Dio `RestClient`, `UserCubit`, GoRouter, `url_launcher`, HydratedBloc, and shared preferences. Purchase UI, purchase methods, and payment return links are absent.
- Interactive `XPrice`, insufficient-balance Premium, and insufficient-balance asset actions currently show `payments_unavailable`.

## Distribution and scope

Sales are Iran-only through the planned Zibal channel. International pricing and payment providers are deferred. Google Play/App Store distribution was previously selected; resolve the permitted checkout/link behavior for the actual release channel before enabling its purchase UI. An Iran-only audience does not alone establish a store-policy exemption. This is a release-channel decision, not a requirement to build international billing now. Sources: [Google Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en), [Apple payment guidelines](https://developer.apple.com/app-store/review/guidelines/#payments).

The research supports keeping membership and spendable currency separate; IMVU documents both [credit purchases](https://support.imvu.com/support/solutions/articles/154000197257-how-to-purchase-credits-on-imvu-desktop-and-imvu-website) and [membership packages](https://support.imvu.com/support/solutions/articles/154000197190-faq-about-vip-tiers). Ekipma's fixed packages and expiry-reset rule are explicit product decisions, not a claimed industry standard.

## User journey

Entry points:

- Tap the token balance/add button to browse all packages.
- Tap a Premium feature to see its tools and the four token packages; credit balance does not determine Premium access.
- Tap an unowned asset without enough tokens to see its shortfall and the same four packages. Suggest the smallest package covering the shortfall, but do not invent a custom quantity. If none covers it, disclose the remaining shortfall; purchases remain separate explicit checkouts.

The purchase screen shows current balance, the four packages, price with currency, selection, and **Pay with Zibal**. Display **“Every purchase resets Premium to 30 days remaining. Tokens are yours to spend separately.”** Show current Premium expiry when active; success shows the confirmed new expiry. There is no quantity field or exact-shortfall option. When entered for an item, also show its token cost and the selected package's resulting balance. Use Persian/English localization, RTL layout, accessible selection states, and explicit loading/error states. Disable checkout while creation is in flight.

```mermaid
sequenceDiagram
    participant U as User / Flutter
    participant A as Ekipma API
    participant W as Ekipma website
    participant Z as Zibal
    U->>A: Load options; create purchase for quantity
    A->>Z: Request payment with server amount
    A-->>U: Purchase ID, amount, checkout URL
    Note over U: Persist purchase before browser launch
    U->>W: Open checkout handoff in browser
    W->>Z: Browser navigates to payment page
    Z->>A: Payment callback
    A->>Z: Inquiry / verify
    Note over A: Credit once; reset Premium to fulfillment time + 30 days
    A-->>W: Redirect browser to result page
    W->>U: User taps Return to app
    U->>A: Authenticated purchase status and profile
    A-->>U: Verified outcome and current balance
```

The diagram includes proposed checkout handoff and app-return work. App resume or reopening purchases must perform the same status check even when no return link arrives.

## Browser handoff and return

The existing backend README and return plan record Zibal's requirement for a `Referer` matching the registered website when opening `/start/{trackId}`. Direct external URL launch must not be assumed sufficient. Reconfirm the provider requirement and test the complete browser path before release; the official help page could not be fetched during this planning session.

Recommended design:

1. Add an Ekipma website checkout handoff page on the registered merchant origin. The backend returns a `checkoutURL` in addition to its current `paymentURL`.
2. Bind the handoff to the stored purchase using a short-lived opaque capability. It must resolve only that order's server-stored gateway destination, never an arbitrary `next` URL. It cannot credit tokens or change quantity/amount. Provide an authenticated way to refresh an expired handoff for an eligible pending order.
3. Render an actual page with **Continue to payment** and navigate from it to Zibal. Do not assume a bare HTTP redirect creates the required referrer. Use an origin-only referrer policy for this navigation and verify the resulting header against Zibal. No bearer tokens, receipt capabilities, or handoff secrets should reach Zibal in the referrer. Keep the result page's restrictive referrer policy separate.
4. Open this page using the system browser through the existing launcher dependency. If launch fails, retain the order and offer to open the same checkout again.
5. Add a dedicated HTTPS return route, for example `https://ekipma.ir/app/payment-return?purchase=<id>`, and a **Return to app** button on the existing result page. Keep `/payment/result` browser-accessible; scope native link association to the app-return path.
6. Configure Android App Links and iOS Universal Links with the actual package/bundle identities and production signing details. Host the corresponding association files. The return URL carries only the purchase ID; Flutter retrieves the authoritative result using its authenticated endpoint.
7. Preserve the destination through splash/authentication and handle both cold and warm starts. If the app is absent, the return route shows a useful fallback rather than a dead end.

Use the existing GoRouter integration and one deep-link handler. Flutter documents both platform setup and differing cold/warm-start behavior in its [deep-linking guide](https://docs.flutter.dev/ui/navigation/deep-linking). Test against this project's installed Flutter/GoRouter versions before changing dependencies.

## Reliability and backend additions

Implement these alongside the catalog/handoff before exposing checkout broadly:

- **Idempotent creation:** persist a client-generated attempt key before POST, scoped by authenticated user. Add server support so retrying the same key and quantity returns the same order; conflicting quantities fail. Concurrent requests must converge on one order. A provider timeout is ambiguous: retain the attempt and reconcile it rather than blindly requesting another provider payment. Return a recoverable purchase ID/state even if the provider URL is not ready. Current creation has no idempotency support.
- **Recoverable orders:** add an authenticated, paginated list endpoint such as `GET /api/v1/me/token-purchases`. It allows recovery after a lost response, reinstall, or use of another device. Return safe order details and timestamps, with ownership enforcement. Define how provider-ambiguous `created` orders are investigated/recovered; the existing sweep covers `pending` orders only.
- **Authoritative pending state:** do not invent a client-side expiration or infer cancellation from closing the browser. Provider-unavailable errors remain unresolved. Only an explicit backend outcome permits failure messaging. If a mismatch returns HTTP 422 before a status payload, map `PAYMENT_MISMATCH_ERR` to the review/support state.

The current server already prevents double credit for one order; idempotent creation addresses the separate problem of accidentally creating multiple payable orders.

## Flutter implementation structure

| Area | Planned change |
| --- | --- |
| `lib/services/rest_client.dart` | Catalog, create, status, order list, and handoff refresh methods using existing authentication and `X-Version` handling |
| `lib/models/token_purchase.dart` (new) | Parse decimal-string numeric fields; typed statuses with safe unknown fallback |
| `lib/bloc/token_purchase/` (new) | Dedicated purchase Cubit/repository for selection, creation, launch, recovery, and status refresh |
| `lib/screens/external/` | Package selection, purchase result, and recent purchases views |
| `lib/modules/x_widgets/x_price.dart` | Open Buy tokens from interactive balance |
| `lib/screens/external/premium_screen.dart` | Show the package offer and 30-day reset; refresh entitlement after return |
| `lib/modules/cards/asset_card.dart` | Open the same fixed package selector; revalidate ownership/price before spending |
| `lib/bloc/user/fetch.dart` | Reuse/refactor profile refresh so lifecycle recovery is not tied to a disposed screen context |
| `lib/router.dart`, native project files | Return route, auth continuation, native link registration |
| Localization assets | Package, toman, pending, success, unavailable, failure, and recovery copy |

Persist attempt key, purchase ID, owning user ID, and optional local purchase intent before external navigation. Retain all unresolved purchases even if the user starts another checkout. Never persist a trusted success flag or increment the displayed balance locally. Isolate stored data per account and discard late responses when the session changes. Pause requests at logout; do not query another account's orders after login.

On authenticated startup, resume, payment return, or manual refresh, reconcile relevant purchases. Coalesce overlapping requests. Poll while the result screen is visible with bounded backoff, for example immediately, then after 3, 6, 12, and 24 seconds; stop in the background and offer manual refresh after the bound. Network errors do not erase the saved order or become failed payments.

| Backend outcome | App behavior |
| --- | --- |
| `created` / `pending` | Show “Checking payment”; retain for later recovery |
| `paid` | Show credited quantity and recorded Premium reset; fetch `/api/v1/me` and update `UserCubit` |
| `failed` | Show unsuccessful; a deliberate retry creates a new attempt |
| `amount_mismatch` / mismatch error | Show “Payment needs review” with purchase ID; do not encourage immediate repayment |
| Network/provider error, unknown status | Show temporarily unable to confirm; keep recovery available |
| 401 | Reauthenticate and preserve intended return |
| 404 | Generic unavailable purchase; expose no other user's details |

If payment is paid but profile refresh fails, show “Payment confirmed; refreshing balance” and retry profile retrieval. Do not ask the user to pay again. A spent or subsequently changed balance need not equal the old balance plus this purchase.

## Delivery and acceptance

1. **Contract and backend:** implement catalog, idempotent creation/recovery, and order list. Enforce the exact four-package allowlist, preserve verification invariants, add atomic Premium reset and profile/order outcome fields, and define legacy-order/client handling.
2. **Web and native return:** implement handoff and app-return route; verify referrer behavior, association files, and callback/result availability.
3. **Flutter checkout:** add models, repository/Cubit, package selection, pending persistence, and results. Wire all existing unavailable entry points.
4. **Recovery and contextual continuation:** exercise resume/restart/auth transitions, recent purchases, and refresh Premium entitlement and return to assets with explicit spending confirmation.
5. **Release validation:** run relevant unit/widget/integration tests, then end-to-end provider testing on physical devices with a public HTTPS callback before enabling the entry points.

Required acceptance cases:

- Only 10/20/50/100 are purchasable. Reject other quantities on the server before provider requests; the UI offers no custom amount.
- Each newly fulfilled purchase resets Premium to exactly fulfillment time plus 30 days for free, expired, and active users. Test existing expiries both nearer and farther than 30 days; no stacking or max-with-old-expiry.
- Duplicate callbacks/status checks, including those after expiry, do not reset Premium again. Distinct concurrent purchases each credit once and serialize their resets.
- A failed transaction credits no tokens and changes no Premium state. Spending tokens or expiring Premium leaves the other unchanged.
- Each package charges the exact server amount and credits its quantity once. Toman/Rial formatting is checked explicitly.
- Repeated taps, lost create responses, and retries do not create duplicate orders for one attempt.
- Success, explicit failure, mismatch, unknown status, and provider outage each show the correct state.
- Browser close, failed browser launch, missing callback, app termination, and cold/warm return recover without requiring another payment.
- Duplicate callback/deep link/resume events do not duplicate credits, route pushes, or spending actions.
- Expired browser receipts do not prevent authenticated status recovery. Expired handoffs can be refreshed safely.
- Another account's purchase ID is rejected; logging out while a request is running cannot update the next account's UI.
- Price changes before creation are shown for confirmation, and price changes after creation do not alter that order.
- Premium continuation refreshes entitlement; asset continuation refreshes balance and eligibility and requires confirmation before spending.

The purchase screen is ready when selecting a package, paying, returning, and recovering an interrupted checkout all work with the backend as the sole authority for price, payment outcome, and balance.

## Related implementation evidence

- [Existing browser return plan](zibal-payment-return-plan.md)
- Backend: `server/service/token_payments.go`, `server/httpapi/token_purchases.go`, `server/models/token_purchase.go`, `server/config/config.go`.
- Flutter: `app/lib/services/rest_client.dart`, `app/lib/bloc/user/purchase.dart`, `app/lib/router.dart`, and entry-point files listed above.
- [Zibal IPG documentation](https://help.zibal.ir/ipg/) — provider reference to reconfirm during handoff implementation.

Out of scope: custom quantities, exact-shortfall purchases, standalone Premium sales, auto-renewal, package discounts, a general promotion engine, and international monetization.
