# Dynamic asset catalog: status and remaining work

The goal is a server-authoritative catalog that lets admins add assets, set token prices, and control availability without changing backend code. Visuals are still bundled in the Flutter app.

## Implemented

- The `assets` model and migration seed the seven existing UUIDs and prices. The purchase endpoint takes only an asset ID, loads the database price, rejects inactive assets, and deducts tokens in a transaction.
- `GET /api/v1/assets` lists active assets. Admin API endpoints list, create, and update assets. The web admin Assets tab has create, price-edit, and activate/deactivate controls.
- The Flutter shop requests the catalog and overlays server prices onto bundled visual definitions.
- Profile and purchase responses include stable owned asset IDs alongside legacy hashes. Flutter uses IDs for ownership and displays a retry state if the catalog cannot be loaded.
- An `asset_ownerships` model and migration were added to give ownership an ID independent of price; the migration includes a backfill for the seven original asset hashes.
- The Go suite passed in the previous implementation turn; web TypeScript checking also passed. These checks do not establish that the catalog, ownership migration, or admin mutations work end to end.

## Remaining work

1. **Harden admin writes and catalog rules.** Validate UUIDs, names, prices, and update targets on the server; return useful errors for invalid or duplicate entries. Review the web mutation flow for failed requests and authentication/CSRF protection. Creating an asset whose visuals are absent from the app must not imply it is immediately visible there.
2. **Verify ownership migration and purchase behavior.** Test seed data, active/unknown/inactive assets, database pricing, forged price/hash fields, insufficient tokens, repeat and concurrent purchases, and ownership after a price change. Backfill must use the original purchase price for `price_paid`, and repeated purchases must neither charge again nor duplicate ownership. Add catalog and admin authorization/mutation HTTP tests.
3. **Complete migration safety.** The new ownership migration is not in `migrations/atlas.sum`; validate and hash the full directory with Atlas. The repository uses forward-only Atlas SQL migrations, so document or add a compatible recovery procedure for both new tables instead of assuming a down migration exists. Apply to a disposable PostgreSQL database and inspect the backfilled rows before production.
4. **Run client/build checks.** Run Flutter analysis and relevant widget tests with the SDK installed. Run the web production build in an environment where Next.js can start its build workers; the prior sandbox build failed on process/port permissions. Re-run Go tests after fixes.
5. **Stage and deploy.** Apply both migrations in staging, exercise catalog/admin/purchase flows, then deploy server, web, and Flutter changes in a compatible order. Production migration and verification require access to the intended database and deployment environment.

The open work is **five workstreams**. New asset names still require bundled visuals or a separate remote-media design.
