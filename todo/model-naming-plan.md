# Model naming improvement plan

Created: 2026-09-18.
Status: Phase 1 completed; Phases 2–5 pending.

## Scope

Improve model, field, enum, and function names across the Go server and Flutter app, updating API and web references where needed.

Preserve existing behavior, calculations, validation, relationships, and UI flows, including current handling of self-directed expenses and repayments. Suspected logic issues are outside this task.

The project is in development. Rename database and API identifiers directly where appropriate. No backward-compatible aliases, legacy JSON readers, data backfills, or staged rollout are required. This does not authorize deleting databases or other stored data.

## Naming rules

- Use nouns for models and verbs for operations: repayment is a thing; repay is an action.
- Expand abbreviations when their meaning is unclear.
- Use ID in Go and Id in Dart for identifier fields; distinguish IDs from loaded objects.
- Include known units, such as periodHours.
- Use consistent vocabulary across server, app, API, and tests, respecting each language's casing.
- Keep names that already fit. Do not restructure models to make a proposed name fit.

## ✅ Phase 1 — Core record types

Sources: server/models/record_model.go, server/models/record_ops.go, app/lib/models/record.dart, and app/lib/models/api_types.dart.

| Current | Proposed | Reason |
| --- | --- | --- |
| Go Rec | Record | Matches Flutter; removes abbreviation |
| Pay | Payment | Existing payload covers expenses and repayments |
| PayInput | PaymentInput | Matches the payload vocabulary |
| PayType | PaymentType | Distinguishes kinds of payment records |
| normal / repay | expense / repayment | Names the categories explicitly |
| RecordType.pay | RecordType.payment | Names the shared category |
| PayUnit | Currency | Treat USD and IRTT as distinct currencies in the app |

Apply corresponding Go names such as RecordTypePayment, PaymentTypeExpense, and PaymentTypeRepayment. Keep enum ordering and numeric values unchanged.

Keep RecordValue and the existing embedded Go fields and Flutter inheritance structure. Do not introduce separate Expense and Repayment tables or classes as part of this rename.

### Phase 1 implementation notes

Completed: 2026-09-18.

Verification: `go test ./...`, `go vet ./...`, Go/Dart formatting, diff whitespace checks, and GORM schema generation passed; Atlas checksums verified. Five focused Flutter tests pass for numeric enum stability, REST parsing, and Payment serialization across both payment kinds and currencies. Full Flutter suite: 23 passed, 4 failed; the same counter smoke-test failure (missing UICubit) and three premium golden mismatches reproduce on an isolated unchanged HEAD. Flutter analysis reports 280 findings (279 infos, one existing null-aware-operator warning), with no errors. These unrelated failures/findings are outside this rename.

- Renamed core Go and Flutter types and their callers; numeric enum values and embedded/inherited structures are unchanged.
- REST record kind is now `payment`. Updated the development baseline to `records` and `record_assignees.record_id`, including raw SQL and the migration checksum. No database was modified or reset. An existing database using the previous baseline needs deliberate schema reconciliation before running this version; the edited baseline does not upgrade an already-applied database.
- Field names such as `payType`/`payUnit` and accessors such as `pay` remain for Phases 2–3. Web presentation labels and historical completed-plan documents remain unchanged.
- No new cache reset is required by the Phase 1 numeric enum/type renames. Separately discovered existing issue: `Record.toJson` serializes payment `amount`, but `Record.fromJson` reads `total`; full record cache round trips already fail for payment records with participants. This behavior was preserved and needs a separate fix. Payment payload round trips are covered independently.

## ⏳ Phase 2 — Record fields

| Current | Proposed | Notes |
| --- | --- | --- |
| repaidBy / RepaidBy | repaymentRecordId / RepaymentRecordID | Identifies a record, not a person |
| toRepay / ToRepay | expenseRecordIds / ExpenseRecordIDs | Original expense records covered by repayment |
| payType | paymentType | Matches renamed enum |
| payUnit / PayUnit | currency / Currency | Matches renamed enum; preserve existing values and amount scale |
| Go Total | TotalAmount | Full amount before splitting |
| Flutter amount | shareAmount | Existing total divided by participant count; repayments currently have one participant |
| signedAmount | signedShareAmount | Keep its exact calculation |
| PayWhat / what | BalanceDirection / balanceDirection | Existing account-relative classification |
| toSend / toReceive / none | payable / receivable / none | Owed by me / owed to me / neither; preserve classification logic |
| Flutter author, assignee, group, account | authorId, assigneeId, groupId, accountId | These fields hold IDs |
| Go record/input Group | GroupID | Holds an ID |
| Flutter assignees | participantIds | List of IDs |
| Go Assignees containing User objects | Participants | List of loaded objects |
| Go input Assignees containing IDs | ParticipantIDs | List of IDs |
| assingeesCount | participantCount | Fix spelling; retain current storage/calculation |
| desc / Desc | description / Description | Expand abbreviation |

Document the existing repaymentRecordId convention: an expense points to its repayment, while a confirmed repayment points to itself. Preserve that convention and zero-value handling. Do not add confirmation fields or statuses.

Keep authorId and assigneeId as shared record fields because their roles vary by record kind. Add short comments explaining current roles instead of renaming every assignee to debtor or recipient.

## ⏳ Phase 3 — Operations and callers

| Current | Proposed |
| --- | --- |
| createPayRecord | createPaymentRecord |
| createRepayRecord | createRepaymentRecord |
| AcceptRepay / acceptRepay | ConfirmRepayment / confirmRepayment |
| isPay | isPayment |
| isRepay | isRepayment |
| isRepayAccepted | isRepaymentConfirmed |
| canAcceptRepay | canConfirmRepayment |
| pendingRepay | isPendingRepaymentByMe |
| RepayDialog | RepaymentDialog |

Preserve every predicate's existing conditions. For example, pendingRepay includes an author-is-current-account check; retain that specificity.

Align payload accessors, form/widget names, filenames, imports, REST handler names, and translation-key references. Keep displayed wording and interactions unchanged, except straightforward grammatical corrections if needed.

## ⏳ Phase 4 — Other models

| Current | Proposed | Reason |
| --- | --- | --- |
| Notify | Notification | Noun for stored object |
| Go Otp | OTP | Acronym casing |
| OTP ExpiredAt | ExpiresAt | Scheduled expiration timestamp |
| Token-pair Auth in api_types.dart | AuthTokens | Access and refresh tokens |
| Auth in auth.dart | AuthSession | Tokens plus authorization state |
| AuthSession.token | accessToken | Distinguishes token kinds |
| Turn.period | periodHours | Creation form specifies hours |
| Plan | ScheduledEvent | Dated activity with a location |
| Plan.dueAt | scheduledAt | Scheduled time rather than deadline |
| lat / long / latLong | latitude / longitude / coordinates | Clear coordinate names; keep existing types |
| PayDatum | PaymentStatsBucket | Aggregated totals and counts for a time bucket |
| Stats | RecordStatsCalculator | Computes statistics from records |
| FriendRecords.total | netBalance | Signed aggregate; retain its current formula and inputs |

Stats is in app/lib/models/stats.dart, at line 62 when reviewed. Update chart/screen callers and rename the file accordingly.

Keep the two Auth classes separate; this task renames them rather than redesigning or merging them.

Align RecordType.plan, PlanInput, payload accessors/keys, and creation methods with ScheduledEvent in the same change. Product-facing “plan” wording can remain.

Keep Turn, FriendRecords, User, Group, GroupMember, Asset, AssetOwnership, TokenPurchase, TokenMovement, RecordChange, Money, and Failure.

Defer names whose intended meaning is not established, such as Turn.iter or unclear legacy abbreviations. Trace their uses before choosing a name. If meaning remains unclear, leave the field unchanged and record the question. Do not change behavior to justify a name.

## ⏳ Phase 5 — Update references and development contracts

1. Search declarations and all references, including raw SQL, GORM tags, associations, JSON maps, local serialization, fixtures, tests, and docs.
2. Update server declarations, database schema definitions, SQL references, REST requests/responses, and Flutter serialization together. Update affected web consumers.
3. Use new table/column names consistently where model renames affect them. No old-name aliases or data-preservation migration are required. Do not reset a database as an incidental rename step.
4. Rename serialized keys and record-kind strings directly. Supporting old builds or old cache formats is unnecessary; document any development cache reset needed for testing.
5. Keep numeric enum values, field types, defaults, relationships, validation, and calculations unchanged.
6. Check remaining old-name occurrences individually, distinguishing intentional product wording from missed references.

## Verification

- Run relevant existing Go and Flutter tests, Flutter analysis, and formatting checks. Run web checks if its consumers change.
- Update test references and payload names without changing behavioral expectations.
- Verify request/response and local serialization round trips with the new names.
- Review the diff for accidental changes to arithmetic, conditionals, filters, permissions, and repayment state handling.
- Report separately discovered logic concerns without fixing them in this task.

## Completion criteria

Names consistently describe stored objects, IDs, amounts, units, and actions. Server, app, and affected API/web consumers agree on the new names. Existing behavior remains unchanged, and no backward-compatibility layer is introduced.
