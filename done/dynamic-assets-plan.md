# Dynamic asset catalog: status and remaining work

The goal is a server-authoritative catalog that lets admins add assets, set token prices, and control availability without changing backend code. Visuals are still bundled in the Flutter app.

## Implemented

- The `assets` model and migration seed the seven existing UUIDs and prices. The purchase endpoint takes only an asset ID, loads the database price, rejects inactive assets, and deducts tokens in a transaction.
- `GET /api/v1/assets` lists active assets. Admin API endpoints list, create, and update assets. The web admin Assets tab has create, price-edit, and activate/deactivate controls.
- The Flutter shop requests the catalog and overlays server prices onto bundled visual definitions.
- Profile and purchase responses include stable owned asset IDs alongside legacy hashes. Flutter uses IDs for ownership and displays a retry state if the catalog cannot be loaded.
- Friend responses also include stable owned IDs, so avatars and skins remain identifiable when catalog prices change.
- Admin writes validate IDs, names, prices, and update targets. The web proxy checks request origin; the panel reports errors and explains that new visuals require an app release.
- Focused Go tests cover catalog/admin HTTP access, forged purchase fields, and repeat purchase after a price change. The ownership backfill uses each legacy asset's original price for `price_paid`.
- Atlas checksum and validation pass. The asset catalog, ownership, and index migrations apply to disposable PostgreSQL; the seven assets seed as active, legacy ownership backfills at its original price after a catalog price change, and a concurrent purchase test charges once. A recovery procedure is included.
- The web production build, TypeScript, lint, formatting, and full Go tests pass. Flutter analysis and widget tests could not run because the Flutter/Dart SDK is not installed in this workspace.

## Completion status

The implementation work is complete. The remaining rollout checks are user-owned follow-ups:

1. Run Flutter analysis and widget tests on a machine with the Flutter/Dart SDK.
2. Apply the migrations in staging, exercise the catalog, admin, and purchase flows, then deploy the changes to production.

New asset names still require bundled visuals or a separate remote-media design.
