## Asset Catalog Database Migration Plan

### Goal

Replace the hard-coded server-side `assetPrices` map with a database-backed asset catalog so admins can change prices, deactivate assets, and add new assets without modifying backend code.

### Final schema

```text
assets
------
id          UUID / primary key
name        string
price       unsigned integer
active      boolean
created_at  timestamp
updated_at  timestamp
```

### 1. Add the database model

Create an `Asset` model with:

- UUID primary key
- Required `name`
- Non-negative `price`
- `active` flag
- Creation and update timestamps
- Unique constraint on `name`, if names are used as stable application identifiers

Add indexes for:

- `active`
- `name`

### 2. Add the migration

Create a migration that:

1. Creates the `assets` table.
2. Inserts the seven existing assets with their current UUIDs and prices.
3. Sets all existing assets to `active = true`.
4. Uses a safe rollback that drops only the new table.

The existing UUIDs must remain unchanged so current users’ purchased asset hashes continue working.

### 3. Update the server purchase flow

Change the endpoint to accept only:

```json
{
  "id": "asset-uuid"
}
```

Remove client-provided:

- `price`
- `hash`

The service should:

1. Parse and validate the UUID.
2. Load the asset from the database.
3. Reject the purchase if it does not exist.
4. Reject the purchase if `active = false`.
5. Use the database price.
6. Recompute the ownership hash from `id:price`.
7. Deduct tokens atomically.
8. Store the resulting ownership hash.

The hard-coded `assetPrices` map should be deleted.

### 4. Preserve ownership compatibility

Existing ownership currently stores hashes generated from:

```text
uuid:price
```

Changing prices later would otherwise change the hash. To avoid breaking existing ownership:

- Keep existing hashes valid.
- Consider adding `asset_id` ownership records in a future migration.
- Do not regenerate existing user asset hashes during this change.

At minimum, the purchase service must recognize already-owned assets using the original hash format.

### 5. Add the catalog API

Add an authenticated or public endpoint:

```http
GET /api/v1/assets
```

Return only active assets for the shop:

```json
[
  {
    "id": "...",
    "name": "crown",
    "price": 5
  }
]
```

Optionally add an admin endpoint later to list inactive assets too.

### 6. Update the Flutter app

Replace the static shop catalog with data fetched from the catalog API.

The app may retain local visual configuration such as:

- Whether an asset is a frame or skin
- Image/audio paths
- Rendering configuration

However, pricing and availability must come from the server.

Update the purchase request so it sends only the asset ID.

### 7. Add admin management

Add admin functionality to:

- List assets
- Add an asset
- Change its price
- Activate/deactivate an asset

Deactivation should prevent new purchases but should not remove assets from users who already own them.

### 8. Tests

Add tests covering:

- Existing asset seed data
- Purchase with a valid active asset
- Unknown asset ID
- Inactive asset
- Price loaded from the database
- Client attempts to submit a forged price
- Client attempts to submit a forged hash
- Insufficient tokens
- Concurrent purchases
- Existing ownership after price changes

### 9. Rollout order

1. Add the model and migration.
2. Seed existing assets.
3. Add catalog read endpoint.
4. Update purchase service to use the database.
5. Update Flutter catalog and purchase request.
6. Add admin management.
7. Remove the hard-coded `assetPrices` map.
8. Run migration and integration tests in staging.

## Remaining work from the plan:
1. Flutter dynamic catalog
   Replace the static assets map used by the shop with data fetched from GET /api/v1/assets. Keep only visual/rendering metadata locally.
2. Admin asset management
   Add admin API and panel tab to:
   - List all assets, including inactive ones
   - Add assets
   - Change prices
   - Activate/deactivate assets
3. Ownership compatibility after price changes
   Current ownership is still stored as hash(uuid:price). If a price changes, the app’s ownership checks can become inconsistent. Ownership should eventually store the asset ID independently from the purchase price.
4. Dedicated tests
   Add the catalog and purchase tests specified in the plan, including inactive assets, forged values, concurrency, and price changes.
5. Migration rollout
   Apply and validate 20260918000000_assets.sql in staging/production.
6. Rollback handling
   Add a down/rollback migration if required by the project’s migration workflow.
Completed: database model, seed migration, database-based pricing, active-status validation, GET /api/v1/assets, ID-only purchase requests, and removal of the hard-coded price map.