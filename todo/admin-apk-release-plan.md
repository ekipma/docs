# Admin APK upload and public downloads

Status: implementation paused for plan review. Last reviewed: 2026-09-20.

Checked items below mean code or configuration has been written locally, not that it has been tested, deployed, or verified against MinIO. No buckets have been provisioned by this work yet.

## Goal

Allow an administrator to upload a signed Android APK through the web admin panel and publish it as the website's latest download. Failed or interrupted uploads must leave the existing public release available.

## 1. Admin panel

- [x] Add an **App releases** navigation entry at `/admin/releases`.
- [x] Scaffold the page under the existing protected admin layout.
- [ ] Implement `ReleasesPanel` using the existing shadcn/ui components. The scaffold currently imports this missing component, so the web implementation is incomplete.
- [ ] Display the current version, file size, publication date, and download link.
- [ ] Add a version field (for example, `0.8.2`) and an APK file picker, with a 200 MiB maximum.
- [ ] Show upload progress, validation/publishing status, success, and actionable error messages.
- [ ] Handle loading, unavailable storage, expired sessions, and no published release.
- [ ] Prevent duplicate submissions while uploading or publishing; allow retries after failure.
- [ ] Verify responsive layout, accessible labels/status messages, and applicable RTL behavior.

## 2. Storage buckets

- [x] Update Docker Compose's `minio-init` to create private `app-staging` and public-read `downloads` buckets.
- [x] Configure one-day lifecycle expiry for abandoned staging uploads.
- [x] Keep bucket names consistent in the release store, initialization script, and Nginx routes.
- [x] Reuse existing S3 settings from the server's `env` package; no new environment variables added.
- [ ] Verify initialization succeeds on both a fresh installation and an existing MinIO instance.
- [ ] Verify anonymous users can download published APKs but cannot upload, overwrite, or access staging objects.
- [ ] Verify server storage credentials can sign staging uploads, inspect/copy objects, and delete staging objects.
- [ ] Review startup validation and disabled-storage behavior. If configuration changes are needed, update `env`, its tests, and the documented environment example together.

## 3. Download URLs

Stable latest-release URL:

`https://cdn.ekipma.ir/downloads/android/ekipma.apk`

Proposed unique URL for each retained release:

`https://cdn.ekipma.ir/downloads/android/releases/<version>/<release-id>/ekipma.apk`

- [x] Update the website's APK link to the new stable URL.
- [x] Use `android/ekipma.apk` in the `downloads` bucket for the latest release.
- [x] Configure no-store caching for the stable download and an APK attachment filename during publication.
- [ ] Retain each validated release under a unique versioned object key before promoting it to latest. Current code only copies to the stable key.
- [ ] Configure immutable, long-lived caching for unique release URLs. Current Nginx configuration applies no-store to all downloads.
- [ ] Verify first-release behavior and clear admin messaging before any APK has been published.

## 4. Direct browser upload

The web app requests a signed upload form from the API, then sends the APK directly to MinIO. Large binaries do not pass through Next.js or the Go API, and storage credentials never reach the browser.

- [x] Add the release store and wire it into the production API backend.
- [x] Add admin-authorized `GET /api/v1/admin/releases` for current release metadata.
- [x] Add admin-authorized `POST /api/v1/admin/releases/uploads` accepting version and size.
- [x] Generate a signed POST policy constrained to one staging key, exact declared size, APK content type, and a 15-minute expiration.
- [x] Add corresponding Next.js proxy routes using the existing session-refresh and mutation-origin checks.
- [ ] Implement browser upload using the returned URL and form fields, including progress reporting.
- [ ] Verify MinIO cross-origin uploads from the actual web origin; configure CORS if required.
- [ ] Verify request timeouts and retry behavior with realistically sized APKs.

## 5. Validation

- [x] Validate version syntax and enforce a 200 MiB maximum.
- [x] Restrict staging keys to the authenticated administrator and expected version/UUID structure.
- [x] Check the uploaded object's actual size before publication.
- [x] Inspect ZIP structure for nonempty `AndroidManifest.xml` and `classes.dex` entries without decompressing entries.
- [x] Use ETag conditions when reading and copying so a staging overwrite cannot substitute different bytes after validation.
- [ ] Test these checks against valid signed APKs and malformed/oversized inputs.

These are structural checks, not Android signature verification. Signing-certificate verification, package-name verification, and extracting/comparing the embedded APK version are outside the initial scope. Administrators must upload a signed release from the existing build process; the version field is administrator-supplied metadata.

## 6. Publication and failure handling

Intended sequence: validate staging object → retain a unique public release → atomically replace the stable latest object with version metadata → clean up staging → report success.

- [x] Add admin-authorized `POST /api/v1/admin/releases/publish` and its Next.js proxy route.
- [x] Implement validated server-side copying to the stable object with version metadata and download headers.
- [x] Return version, size, publication date, and public URL.
- [x] Attempt staging cleanup after publication, with lifecycle expiry covering abandoned uploads and cleanup failures.
- [ ] Add the unique release copy before promotion to latest.
- [ ] Verify failed uploads, validation, and copies leave the previous latest object intact.
- [ ] Define and test retry behavior when publication succeeds but the response is lost.
- [ ] Verify simultaneous publications behave consistently; the final successful promotion determines latest.

Previous release files will remain available once retention is implemented. A browsable release history and rollback UI are separate follow-up work.

## 7. Nginx and access controls

- [x] Add `/app-staging/` on the uploads host, with a 201 MiB request limit for multipart overhead, request buffering disabled, and proxy timeouts.
- [x] Add `/downloads/` on the CDN host, restricted to GET and HEAD.
- [x] Enforce existing admin authorization on release API routes.
- [x] Preserve existing web mutation-origin checks and session refresh through shared proxy helpers.
- [ ] Validate Nginx and Compose configuration and verify signed uploads through the deployed hostname.
- [ ] Confirm any external reverse proxy/CDN accepts the intended upload size and timeouts and honors latest-release cache policy.

## 8. Verification

No tests, formatting, lint, build, or deployment checks have been run for these changes yet.

- [ ] Add meaningful Go tests for unauthenticated/non-admin requests and unavailable storage.
- [ ] Test invalid versions, sizes, keys, another administrator's key, malformed ZIPs, and missing APK entries.
- [ ] Test first publication and current-release metadata retrieval.
- [ ] Test successful publication, changed staging ETags, storage failures, and preservation of the previous release.
- [ ] Run Go formatting and relevant Go tests/checks.
- [ ] Run web formatting, format checks, lint, TypeScript checks, and production build as appropriate.
- [ ] Exercise the complete admin upload flow against MinIO with a real signed APK.
- [ ] Verify public download bytes, content type, attachment filename, caching, and unauthenticated access.
- [ ] Verify the website's download link and install the downloaded APK on Android.

## 9. Documentation and deployment

- [x] Save this plan with progress markers in `docs/todo`.
- [ ] Document storage permissions, bucket initialization, upload limits, signed-build requirements, and publication/recovery steps in the relevant project documentation.
- [ ] Deploy API, web, and Nginx changes after validation.
- [ ] Rerun `minio-init` to provision the buckets and policies; verify successful execution.
- [ ] Publish the first signed APK through the admin panel and verify the live website download and installation.

## Scope boundary

The initial feature includes upload, validation, publication, current-release details, a stable website download, and retention of previous APK files. It does not build or sign APKs, force app updates, or provide release-history/rollback management screens.

## Local implementation locations

- Server: `releasestore/store.go`, `httpapi/releases.go`, `httpapi/httpapi.go`, `docker-compose.yml`, `nginx/nginx.conf`.
- Web: `app/admin/_components/admin-dashboard.tsx`, `app/admin/(protected)/releases/page.tsx`, `app/api/admin/releases/`, `app/site-config.ts`.
- Still missing: `app/admin/_components/releases-panel.tsx`, release retention, tests, and operational documentation.

Implementation remains paused until the plan review is complete.
