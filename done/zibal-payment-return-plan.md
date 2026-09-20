# Zibal payment return experience — implementation plan

Status: browser callback redirect and web result page implemented; mobile return link remains planned.
Date: 2026-09-16.

## Goal

After a token purchase attempt, show the payer a clear success, failure, or still-checking page and offer a way back to Ekipma. The backend remains responsible for asking Zibal to verify the payment and crediting tokens. Loading the result page must never be required for crediting.

Keep the Zibal callback on the API domain:

```env
ZIBAL_CALLBACK_URL=https://api.ekipma.ir/payments/zibal/callback
```

The API domain and path above are examples; the deployed hostname must route to the Go server. Configure the friendly result page separately, for example `https://ekipma.ir/payment/result`. Do not set Zibal's callback directly to the result page.

## Current state

- `POST /api/v1/me/token-purchases` creates an order and returns Zibal's hosted payment URL. `GET /api/v1/me/token-purchases/:id` provides authenticated status.
- `GET /payments/zibal/callback` receives Zibal's browser redirect as query parameters, checks Zibal through inquiry/verify, credits an eligible purchase once, then redirects the browser to the web result page.
- A backend sweep reconciles pending purchases when the browser never reaches the callback. The web result page is available at `/payment/result`. The mobile app has no payment deep-link registration or purchase UI yet.
- Zibal's [IPG documentation](https://help.zibal.ir/ipg/) defines the normal callback as a `GET` containing `trackId`, `orderId`, `success`, and `status`. Its start URL requires a matching `Referer`; future mobile checkout must account for this.

## Target browser flow

1. The client creates a token purchase. Backend stores the expected token quantity and Rial amount, requests payment from Zibal, and returns the hosted URL.
2. The payer opens Zibal's hosted payment page. After the attempt, Zibal redirects the browser to `ZIBAL_CALLBACK_URL`.
3. The callback locates the stored purchase by `orderId`, checks the `trackId`, and asks Zibal for the authoritative status. It verifies a paid but unverified transaction. Only a matching verified amount and order ID can trigger the existing one-time credit transaction. Callback query values are hints, never proof of payment.
4. The callback responds with `303 See Other` to the configured result page. It selects a server-owned destination; it never accepts an arbitrary return URL from the callback query. Repeated callbacks may redirect again but cannot add credit again.
5. The result page reads a narrow, read-only purchase outcome and displays one of: **Paid — tokens added**, **Payment unsuccessful**, or **Checking payment**. For an unknown provider result, timeout, or temporary verification error, show **Checking payment** rather than claiming failure. It can refresh while pending.
6. Later, when mobile checkout exists, the page's **Return to app** button opens a registered HTTPS app link or deep link carrying the purchase ID. The app then calls its authenticated purchase-status endpoint and refreshes the profile balance. The deep link itself does not grant tokens or carry payment credentials.

## Backend work

1. Add a configured `PAYMENT_RESULT_URL` pointing to the exact web route. Validate its scheme and host at startup; in production require HTTPS. Construct the redirect URL from this fixed base and the purchase ID. Set `Cache-Control: no-store` and a restrictive referrer policy on the callback response.
2. Keep the current inquiry, verify, amount check, order check, transaction, and pending reconciliation paths. Change only the browser response after reconciliation. Map `paid` to success, `failed` to failure, and `created`/`pending`/provider-unavailable to checking. Invalid or unknown callback input should lead to a safe generic result page or a clear error response without revealing another person's purchase.
3. Provide a way for the web result page to read only the outcome without a mobile bearer token. Recommended: issue a random, short-lived receipt capability tied to the purchase, store only its hash, and expose a rate-limited read-only result endpoint requiring that capability. Return only status and safe display fields such as quantity; never return user identity, mobile number, card data, or an access token. Keep the existing authenticated status endpoint for the app. A public lookup by purchase ID alone is insufficient.
4. Preserve recovery if the web site is unavailable: verification and crediting complete before redirect. A failed redirect cannot undo a credited payment, and the authenticated status endpoint and background sweep still recover state.
5. Add tests for paid, canceled, pending, provider outage, malformed/forged callback, amount mismatch, duplicate callback, result-link expiry, and attempts to use a result token for another purchase. Confirm the redirect is always to the configured web origin.

## Web work

1. Add `/payment/result` in the existing Next.js `web` project. Use the current site's styling and support Persian and English. Show purchase quantity and final status only after the read-only result lookup; do not trust a `status=success` query parameter as proof.
2. While the backend reports pending, show a checking state and retry the read-only status briefly, then offer a manual refresh. Treat an unavailable result service as temporarily unknown. Do not call Zibal or any crediting endpoint from this page.
3. Provide a **Return to app** button once the app link exists. Until then, use a safe destination such as the Ekipma home page; do not display a broken app link. Include a way to return home or contact support if the status remains unresolved.
4. Avoid third-party scripts on the result page and prevent the receipt capability in its URL from being sent as a referrer to other sites. Do not index or cache purchase-result pages.

## Later mobile work

- Register and handle a payment return link on Android and iOS. The app should recognize the purchase ID, fetch authenticated purchase status, and refresh the user's token balance; it should display pending rather than assume success from the link.
- Decide how the hosted Zibal page will be opened with the required `Referer` matching the registered site. A same-domain web handoff/start page is one option; verify it against Zibal's current requirements before enabling mobile checkout.
- Handle cases where the app is not installed or the payer closes the browser. The web result page must remain useful without the app.

## Rollout order and acceptance

1. Deploy the backend redirect and read-only result lookup, with tests. Configure `PAYMENT_RESULT_URL` and keep `ZIBAL_CALLBACK_URL` on the API domain.
2. Deploy and test the web result page before sending real users through checkout. Verify the complete redirect path with Zibal's test merchant and a public HTTPS callback; do not use the test merchant in production.
3. Add app links and mobile checkout later. Test return-to-app on Android and iOS, including a cold app start.

Done for the browser release means a payer sees a useful page for success, failure, and pending; tokens are credited only after backend verification; repeat visits do not double-credit; and a missing page load or closed browser does not prevent eventual reconciliation.
