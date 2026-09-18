# Asset catalog rollout and recovery

Apply the checked Atlas migrations before deploying a server that reads `assets` and `asset_ownerships`. Deploy the server, web admin, and Flutter client in that order. Asset ownership is held only in `asset_ownerships`.

Before rollout, apply migrations first to a disposable copy. Check that the seven seeded assets retain their UUIDs, all are active, and each owner has exactly one `(user_id, asset_id)` row with the original price in `price_paid`.

For local development, reset the disposable database and apply the baseline again. The project is pre-production, so no ownership backfill or mixed-version rollout is supported.

Update `atlas.sum` whenever the pre-production baseline changes, then validate the migration directory before starting the server.
