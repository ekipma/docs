# Breathe Pastel — product flow coverage

This is a **design prototype**, not a Flutter implementation or a live client. Actions use sample data in memory. Reload or Reset demo restores it. Only the light/dark appearance preference is stored. No credentials, contacts, API commands, purchases, or invitations are sent.

The approved Home orb, pastel materials, welcome artwork, navigation glyphs, lighting, and external appearance switch remain the visual foundation. Home now also offers two recent records below its people section. The additional tools live in Circles, record details, and Your space.

## Connected flows

| Area | Preview coverage |
| --- | --- |
| Account access | Welcome → registration → phone verification → profile → Home; returning login; validation, wrong-code feedback, resend, logout confirmation |
| People | Search, hide settled friends, add by phone, sample contact selection, remove friend, direct shared record without a Circle |
| Circles | Create, join with code/link, invalid invitation, member roster, admin member removal, copied preview invitation, renew code, admin deletion/member leaving |
| Record creation | Payments, turns and plans; Circle or individual participants; descriptions; equal split; turn interval; plan time/place; review; draft or publish |
| Record lifecycle | Draft review, sample balance updates, deletion, record timeline; current-user turn completion and next participant |
| Repayments | Debtor records a repayment; pending state preserves balance; creditor confirms receipt; confirmed history. The external design menu can simulate the other person's confirmation. |
| Plans | Existing RSVP study, location action, downloadable calendar file, deletion |
| Statistics | Week/month/year illustrations, expense chart with text values, heatmap, record mix, free/Plus states |
| Account | Personal details, local image preview, spacing, reminders, language study, refresh, clear-cache presentation |
| Notifications / invites | Designed empty states, matching the current app's empty implementations |
| Premium / shop | Plus presentation, token packs, purchase review, waiting/success/failure/manual-review states, purchase history, token debits for sample assets, owned state; a successful token purchase includes Plus |
| Reliability | Loading, offline cached Home, retry, sync error, empty Activity, empty search results |

## Deliberate limits and corrections to the first audit

- The existing app does **not** have a payment payer selector or currency picker. It creates payments as the current user, using a fixed Toman unit. The established English preview keeps its USD sample values. Do not interpret that as production currency conversion or multi-currency balance support.
- Group editing exists at the server level but is not exposed by the current Flutter client. This pass represents the client's create/join/member/invite/leave/delete controls.
- Only the author can delete eligible unrepaid records within 24 hours in the app. The sample Grocery record is attributed to Sara and therefore has no delete control. Newly created sample records and the Friday pizza sample represent eligible records.
- The current participant completes a turn. After completing your sample turn, the action disappears until it is your turn again.
- The current notifications and invited-people screens contain empty states. Populated feeds are not claimed as existing features.
- The statistics screen has real expense calculations and several illustrative/unfinished widgets. Preview charts are intentionally illustrative, not derived from its sample ledger; unused radar source is not an active screen feature.
- The current Premium screen includes 30 days with a token purchase. Plus is the proposed design name. Sample asset names/prices are not the production catalog.
- QR artwork is a **non-scannable layout placeholder**. Copy invitation produces a link back to this preview with the sample code; it is not a live Ekipma invite. Real QR encoding belongs to app integration.
- Persian is a dedicated RTL/typography/Toman study, not a fully translated prototype. This follows the earlier decision to complete English first.
- Privacy/terms text is an explicitly labeled placeholder for approved legal copy.
- Payment outcomes and membership entitlement can be changed in the **external design menu**. No payment gateway is opened. Map links and calendar downloads run only when explicitly clicked.
- Login accepts valid sample inputs without authenticating. The sample OTP is **123456**. Sample join code **SUNDAY** previews a new Circle; copied codes demonstrate existing Circles and code renewal.
- Background synchronization and durable account storage belong to the real application, not this HTML study. The preview demonstrates their visible states.

## Review entry points

Use the design menu or hashes in `breath-pastel.html`:

- `#add`, `#record/coffee`, `#repayment/sara`, `#repayment/nima`
- `#new-circle`, `#join`, `#add-friend`, `#members/crew`, `#invite/crew`
- `#login`, `#register`, `#profile`, `#preferences`
- `#stats`, `#premium`, `#shop`, `#tokens`, `#purchases`
- `#language`, `#states`

Scenarios that need a prior step (record review, purchase review, payment results) are reached through their forms. On `#checkout`, complete a purchase review first; then the design menu offers outcome controls. On a pending repayment, the design menu offers a friend's confirmation.
