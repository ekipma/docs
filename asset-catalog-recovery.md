# Asset catalog rollout and recovery

Apply the checked Atlas migrations before deploying a server that reads `assets` and `asset_ownerships`. Deploy the server, web admin, and Flutter client in that order. Keep the legacy `users.assets` hash array while older clients remain supported.

Before rollout, take a database backup and verify that it can be restored. Apply migrations first to a disposable copy with representative legacy ownership. Check that the seven seeded assets retain their UUIDs, all are active, and each legacy owner has exactly one `(user_id, asset_id)` row with the original price in `price_paid`.

If the new application must be rolled back, redeploy the previous server, web, and Flutter versions together. Leave the new tables and Atlas revision history in place: the previous server ignores them, and dropping them would erase purchases made after rollout. Reconcile any new ownership rows before attempting a later migration or data restore. If migration data is corrupt, restore the verified backup in a controlled maintenance window and account for purchases made since that backup.

Atlas migrations in this repository are forward-only. Do not edit an already applied migration or remove entries from `atlas.sum`. Corrective schema or data changes should use a new migration after inspecting the deployed revision and taking a backup.
