# Strapi to Payload CMS Migration Plan

## 1. Objective

Replace Strapi with Payload CMS without changing public URLs, rendered content,
media availability, SEO output, editorial workflow, or the reliability of the
public website.

The selected architecture uses:

- one Payload CMS deployment;
- one production Payload D1 database;
- one production R2 media store;
- one protected preview website that reads the latest drafts; and
- one public website that reads published versions only.

Editors write each document once. Saving a draft updates the preview website.
Publishing the same document updates the public website.

This plan covers the website repository and the current Strapi repository at:

```text
/Users/keshavsharma/Documents/Cloned Repos/epyc-website-nextjs
/Users/keshavsharma/Documents/Cloned Repos/epyc-strapi-cms
```

## 2. Target Architecture

```text
                            Editors
                               |
                               v
                    +---------------------+
                    | Payload Admin / API |
                    | cms.epyc.in         |
                    +----------+----------+
                               |
                   +-----------+-----------+
                   |                       |
                   v                       v
        +----------------------+  +----------------------+
        | PAYLOAD_DB           |  | R2 media             |
        | dedicated Cloudflare |  | images and files     |
        | D1 database          |  |                      |
        +----------------------+  +----------------------+
                               |
              +----------------+----------------+
              |                                 |
              v                                 v
   +-------------------------+       +-------------------------+
   | Protected preview site  |       | Public production site  |
   | latest draft versions   |       | published versions only |
   | noindex, no shared cache|       | ISR + webhook refresh   |
   +-------------------------+       +-------------------------+
```

Payload should run as its own OpenNext/Cloudflare Worker, not inside a
Cloudflare Container and not inside the public website Worker. The official
Payload D1 adapter consumes a native Worker D1 binding. Keeping the CMS and
website deployments separate also prevents a CMS deployment failure from
taking down the public site.

The preview website may reuse the existing staging website Worker and domain,
but its role becomes "content preview," not a separate CMS environment. Both
websites read from the same Payload database.

## 3. Environment and Resource Layout

### Payload service

Suggested resources:

```text
Worker:       epyc-payload-cms
Domain:       cms.epyc.in
D1 database:  epyc-payload-production
D1 binding:   PAYLOAD_DB
R2 bucket:    existing production media bucket, or a dedicated Payload bucket
```

Required secrets and variables include:

```text
PAYLOAD_SECRET
PAYLOAD_PUBLIC_SERVER_URL=https://cms.epyc.in
PREVIEW_SITE_URL=https://<preview-domain>
PREVIEW_SECRET
R2_BUCKET
R2_ENDPOINT
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_PUBLIC_URL
```

Exact names can follow the selected Payload storage adapter and deployment
template, but secrets must never use a `NEXT_PUBLIC_` prefix.

### Public website

```text
CMS_PROVIDER=payload
CMS_MODE=published
DEPLOYMENT_ROLE=production
PAYLOAD_URL=https://cms.epyc.in
PAYLOAD_READ_TOKEN=<published-read-only token, if public read is disabled>
NEXT_PUBLIC_MEDIA_BASE_URL=https://media.epyc.in
```

The public website must default to published-only behavior if any CMS mode
configuration is absent or invalid.

### Preview website

```text
CMS_PROVIDER=payload
CMS_MODE=draft
DEPLOYMENT_ROLE=preview
PAYLOAD_URL=https://cms.epyc.in
PAYLOAD_PREVIEW_TOKEN=<server-only draft-read token>
NEXT_PUBLIC_MEDIA_BASE_URL=https://media.epyc.in
```

Draft reads must require both `CMS_MODE=draft` and
`DEPLOYMENT_ROLE=preview`. A single accidental variable must not expose drafts
on the production domain.

### Existing application D1

The website's current `DB` binding remains exclusively responsible for contact
submissions, workshop submissions, chatbot state, and related application
data. Payload must use a separate `PAYLOAD_DB` database. Payload migrations,
restores, and development schema operations must never target the application
database.

## 4. Current CMS Surface Area

The following website behavior currently depends on Strapi and must be moved:

- `/blog`;
- `/blog/[slug]`;
- `/projects`;
- `/gallery`;
- `/gallery/[slug]`;
- blog entries in the sitemap;
- CMS-backed Markdown representations;
- blog metadata, Open Graph data, JSON-LD, and related posts;
- project sorting, filtering, redirect links, and case-study links;
- gallery images, video URLs, related items, and detail metadata;
- media URL resolution and inline rich-text images;
- published-versus-draft reads; and
- CMS cache invalidation.

The following are explicitly out of scope and must remain unchanged:

- static homepage featured-project data in `data/projects.ts`;
- hand-authored case studies under `app/(my-app)/case-study/`;
- contact and workshop storage in D1;
- contact webhook queues and workers;
- chatbot application data;
- static site content outside the CMS-backed routes; and
- redesigning CMS content or changing public URL structure.

## 5. Payload Collections

The new Payload schema must match the current Strapi content contract, including
fields added after the older Payload implementation was removed. The old
Payload collections in Git history are useful references but are not the
authoritative schema.

### Users

- Payload authentication collection.
- Email and optional display name.
- Editor and administrator roles if role separation is needed.
- Secure cookies and normal login throttling.
- Existing Strapi administrator password hashes must not be migrated. Invite or
  recreate users and require new passwords.

### Media

- R2-backed upload collection.
- Image MIME types initially; add other types only when required.
- Alt text.
- Filename, width, height, MIME type, file size, and public URL/key metadata.
- Focal point only if all consumers and image processing support it.
- Generated sizes should preserve the dimensions consumed by blog/project
  cards, or consumers should reliably fall back to the original image.
- Media files must never rely on Worker or container local disk in production.

### Authors

- `name`: required text.
- `slug`: required, unique, indexed slug.
- `authorImage`: optional relationship to Media.
- Preserve a legacy Strapi document identifier for migration auditability.

Do not restore the obsolete `bio` field unless current live Strapi data or a
confirmed editorial requirement needs it.

### Blogs

- `title`: required text.
- `slug`: required, unique, indexed slug.
- `publishedDate`: optional date/time used for editorial display and sorting.
- `coverImage`: required relationship to Media for published documents.
- `coverImageAlt`: optional text.
- `author`: required relationship to Authors for published documents.
- `readTime`: optional text.
- `content`: HTML-capable field.
- `metaTitle`: optional text.
- `metaDescription`: optional textarea.
- Legacy Strapi document identifier.
- Payload drafts, versions, autosave, and scheduled publishing.

Keep the existing CKEditor-produced HTML representation during migration.
Converting all documents to Lexical in the same cutover would combine CMS
migration and content-format migration. A later project can convert rich text
after HTML parity is established.

### Projects

- `title`: required text.
- `slug`: required, unique, indexed slug.
- `thumbnail`: required relationship to Media for published documents.
- `thumbnailAlt`: optional text.
- `type`: required multi-select using the existing service/technology values.
- `industry`: required select using the current industry slugs.
- `platform`: required select using the current platform slugs.
- `redirectLink`: required URL/text field with URL validation.
- `caseStudyPath`: optional internal-path field.
- `featured`: boolean, default false, indexed.
- Legacy Strapi document identifier.
- Payload drafts and versions.

The website compatibility layer may temporarily convert the `type` array to
the existing comma-separated display string. Industry and platform slugs must
remain unchanged because website filtering depends on them.

Separate industry and platform collections are unnecessary unless editors need
to create values without a code/schema change. Controlled selects are simpler
and preserve the small, fixed vocabulary currently used by the website.

### Gallery

- `title`: required text.
- `slug`: required, unique, indexed slug.
- `videoUrl`: optional URL/text field.
- `image`: optional relationship to Media.
- `imageAlt`: optional text.
- `content`: HTML-capable field.
- `designers`: either the current comma-separated text representation or an
  array normalized behind the website adapter.
- `externalUrl`: optional URL.
- `year`: optional text.
- Legacy Strapi document identifier.
- Payload drafts and versions.

Collection validation must require at least one of `image` or `videoUrl`.
Published documents must satisfy all fields currently required by the website.
Incomplete drafts may be allowed so editors can save work in progress.

## 6. Access Control

Payload access rules must enforce:

- anonymous or public website reads return published documents only;
- the public website token, if used, can read published content and media only;
- the preview website token can read drafts but cannot create, update, or
  delete content;
- editors can create and edit drafts and publish according to their role;
- migration credentials are temporary and removed after cutover;
- no anonymous collection writes;
- media writes require an authenticated editor or migration process; and
- REST/GraphQL depth, pagination, and query complexity are bounded.

The preview website must additionally be protected by Cloudflare Access. It
must emit `noindex, nofollow`, an `X-Robots-Tag` equivalent, no public sitemap,
and no shared caching of draft responses.

## 7. Website Abstraction Before Cutover

The website must stop importing Strapi-shaped objects directly into routes.
Introduce CMS-neutral domain models:

```text
Blog
Author
Project
GalleryItem
Media
```

Expose provider operations such as:

```text
listBlogs
getBlogBySlug
listProjects
listGalleryItems
getGalleryItemBySlug
listBlogSlugsForSitemap
```

Implement:

```text
StrapiProvider   -> current behavior
PayloadProvider  -> target behavior
```

All pages, metadata functions, sitemap generation, Markdown builders, and
normalizers must consume only the neutral interface. Provider selection remains
an environment setting until the rollback window closes.

The provider must support an explicit content state:

```text
published -> last published Payload version only
draft     -> latest available draft/version
```

Production must fail closed to `published`.

## 8. Caching and Revalidation

Keep the existing 60-second published-content ISR during and immediately after
migration. Add signed Payload webhooks for faster updates.

### Draft save

Revalidate only the preview website:

- the affected detail route;
- its collection index;
- its preview Markdown representation; and
- other preview pages that directly surface the changed item.

### Publish or unpublish

Revalidate both preview and production:

- the affected detail route;
- its collection index;
- the sitemap where applicable;
- its Markdown representation; and
- related-content pages whose selection may change.

### Delete

Revalidate both sites and all associated index/sitemap/related paths.

### Webhook security

- Sign requests with HMAC or use a strong shared secret.
- Keep the secret server-side.
- Permit only known collection and route mappings.
- Never accept an arbitrary path supplied by the caller.
- Make retries idempotent.
- Log event ID, collection, document ID, action, result, and duration without
  logging credentials or document bodies.
- Retain ISR as a recovery path for missed webhooks.

## 9. Preview Workflow

The editorial workflow is:

1. An editor creates or changes a Payload document.
2. The editor saves a draft.
3. Payload invalidates the relevant preview-site paths.
4. The protected preview site requests `draft=true` and displays the latest
   draft.
5. The public website continues displaying the last published version.
6. The editor reviews the preview site or Payload Live Preview.
7. The editor publishes the same document.
8. Payload invalidates both preview and public paths.
9. The public website begins displaying the published version.
10. Later draft edits again remain preview-only until the next publish.

Editors do not copy content between environments and do not write a post twice.

## 10. Authoritative Strapi Export

The current CSV files are historical seed inputs, not the migration source of
truth. They contain approximately 3 authors, 27 blogs, 90 projects, 83 gallery
items, 11 industries, and 2 platforms, but they can omit later editorial
changes such as `caseStudyPath`, author images, updated media, and changed
drafts.

Export from the live Strapi system:

- published documents;
- the latest draft state where one exists;
- document IDs and slugs;
- created, updated, editorial publication, and system publication timestamps;
- all relations;
- media metadata and every referenced R2 object;
- inline images referenced by rich-text HTML;
- alt text and dimensions;
- project links and case-study paths; and
- draft/published status.

Generate a machine-readable manifest containing:

- source type;
- source document ID;
- slug;
- destination collection;
- content hash;
- relationship identifiers;
- media URLs/keys and checksums;
- source status; and
- migration result.

Historical Strapi revision history is not required for initial parity unless
the business explicitly requires it. Migrate the current published version and
latest draft. Payload begins its own version history after migration.

## 11. Idempotent Payload Import

Import in dependency order:

1. Media.
2. Authors.
3. Project vocabulary values, if modeled as collections.
4. Blogs.
5. Projects.
6. Gallery items.
7. Draft/published state.

Rules:

- Upsert using `legacyStrapiDocumentId`, with slug as a secondary check.
- Never rely on Strapi numeric IDs becoming Payload IDs.
- Preserve slugs exactly.
- Preserve publication dates separately from migration timestamps.
- Resolve relationships only after their dependencies exist.
- Store import checkpoints so a failed run can resume.
- Do not duplicate media whose checksum and intended R2 key already match.
- Do not delete Strapi media.
- Parse and rewrite HTML with an HTML parser, not broad regular-expression
  replacement.
- Validate every inline image after rewriting.
- Make repeated imports result in updates, not duplicate documents.
- Produce an error report and do not silently skip invalid documents.

If a document has both a published version and a newer draft, import the
published version first and then create the latest draft so production and
preview show the correct independent states.

## 12. Media Strategy

Use R2 for all actual files and D1 only for Payload media records.

Preferred migration behavior:

1. Inventory every Strapi media record and inline media URL.
2. Resolve the underlying R2 object.
3. Compute or retrieve a checksum.
4. Reuse the object when ownership and naming are safe, otherwise copy it to a
   Payload-controlled key/prefix.
5. Create the Payload media record.
6. Preserve alt text, MIME type, dimensions, and filename.
7. Rewrite document references through the destination media mapping.
8. Verify the public URL, content type, content length, and image dimensions.

Keep existing media URLs reachable through the rollback window and preferably
longer, because indexed pages, social previews, cached HTML, and external links
may still reference them.

The existing media-domain abstraction should remain during migration. Changing
the CMS and public media hostname simultaneously is unnecessary risk.

## 13. Shadow Comparison

Before Payload serves users, compare it against Strapi while Strapi remains the
response source.

For each provider operation, compare normalized results in a test job or
sampled shadow read:

- document counts;
- complete slug sets;
- title and body hashes;
- published/draft state;
- dates and ordering;
- author relationships;
- project industry, platform, type, featured state, and links;
- gallery kind, designers, links, and year;
- media presence, URLs, dimensions, MIME type, and checksums;
- inline HTML media references;
- related-content selection;
- sitemap entries;
- metadata and structured data; and
- Markdown output.

Differences must be categorized as expected transformations or migration
defects. The cutover cannot proceed with unexplained differences.

## 14. Verification Matrix

### Automated checks

- TypeScript typecheck.
- Unit tests for both providers.
- Provider contract tests.
- Schema validation tests.
- Import idempotency tests.
- Published-versus-draft access tests.
- Webhook signature and route allow-list tests.
- HTML rewrite tests including `src`, `srcset`, absolute URLs, and inline media.
- Sitemap and Markdown route tests.
- Full Next.js build using the installed Next.js documentation and conventions.
- OpenNext/Cloudflare build and preview.
- Payload admin/API build.
- D1 migration status and drift checks.

### Route checks

Test every migrated slug, not only representative examples:

- HTTP status;
- canonical URL;
- title and description;
- Open Graph image;
- JSON-LD;
- visible content;
- images and video;
- internal and external links;
- related items;
- published visibility on the main domain;
- latest-draft visibility on preview; and
- Markdown representation where supported.

### Acceptance requirements

- No current published URL becomes a 404.
- No slug changes without an approved permanent redirect.
- No draft appears on the public domain.
- Preview shows the latest draft while production retains the last published
  version.
- Every media object loads successfully.
- Blog HTML is semantically and visually equivalent.
- Project ordering and filters are unchanged.
- Sitemap entries are equivalent.
- SEO metadata and structured data remain equivalent.
- Saving a draft invalidates preview only.
- Publishing invalidates both websites.
- CMS failures are observable and do not silently look like an empty site.
- Contact, workshop, chatbot, and queue behavior is unchanged.

## 15. D1 Migration Discipline

There is no persistent CMS staging database, so schema changes require a strict
production process.

For each Payload schema release:

1. Change the schema locally.
2. Generate a committed migration.
3. Review the generated SQL and Payload configuration diff.
4. Apply the migration to a temporary/local D1 database populated with a
   representative schema/data export.
5. Run Payload and the integration test suite against that database.
6. Record the production D1 Time Travel bookmark and create a longer-lived
   export to R2 when appropriate.
7. Enter a short CMS maintenance window if the schema and running application
   versions are not backward compatible.
8. Apply the production migration.
9. Deploy the matching Payload version.
10. Run admin, API, preview, publish, and public smoke tests.
11. Restore through D1 Time Travel and roll back code if the release fails.

Production schema push must be disabled. The Payload Worker must not mutate the
schema automatically on startup.

Large updates and imports must be batched. Rich-text media must remain external
R2 references rather than base64 data in D1.

## 16. Implementation Phases

### Phase A: Foundation

- Create the Payload CMS repository/service.
- Pin compatible Payload, Next.js, OpenNext, and Cloudflare package versions.
- Configure the dedicated D1 binding.
- Configure R2 storage.
- Add Users and Media.
- Add health/readiness checks and structured logging.
- Establish the migration workflow and production backup procedure.

Exit gate: Payload admin, authentication, D1, R2 upload/read/delete, and a
production-like Cloudflare preview all work.

### Phase B: Schema parity

- Implement Authors, Blogs, Projects, and Gallery.
- Add drafts, versions, scheduled publishing, validation, indexes, and access
  rules.
- Configure preview URLs and allowed origins.
- Generate and commit the initial D1 schema migration.

Exit gate: schema contract tests cover every field and state used by the
website.

### Phase C: Website provider abstraction

- Add neutral domain types and CMS provider interface.
- Move Strapi REST details behind `StrapiProvider`.
- Update pages, metadata, sitemap, Markdown, and normalizers to use the
  interface without changing output.
- Add provider contract tests.

Exit gate: the website still serves Strapi with no intentional output changes.

### Phase D: Export/import tooling

- Build the live Strapi exporter and manifest.
- Build resumable, idempotent Payload importers.
- Implement media mapping and HTML rewriting.
- Import into a temporary/local validation database repeatedly.
- Produce parity reports.

Exit gate: repeated imports are clean and all source documents/media are
accounted for.

### Phase E: Payload provider and preview

- Implement `PayloadProvider`.
- Add published and draft modes with fail-closed production behavior.
- Protect the preview domain with Cloudflare Access.
- Add noindex and cache protections.
- Implement Payload preview/live-preview behavior.
- Add signed revalidation hooks and endpoints.

Exit gate: save-draft and publish workflows behave correctly end to end.

### Phase F: Shadow validation

- Run Strapi and Payload comparisons.
- Crawl all dynamic routes through both providers.
- Run metadata, sitemap, Markdown, media, link, and screenshot comparisons.
- Resolve every unexplained mismatch.
- Rehearse the production migration and rollback procedure.

Exit gate: all acceptance requirements pass and rollback has been rehearsed.

### Phase G: Production cutover

- Announce a short editorial freeze.
- Back up Strapi database and media metadata.
- Record D1 recovery state.
- Run the final Strapi export.
- Run the final idempotent Payload import.
- Validate counts, hashes, relations, status, media, and all public slugs.
- Make Strapi read-only for editors.
- Switch the protected preview website to Payload draft mode.
- Verify drafts and published versions independently.
- Switch the public website to Payload published mode.
- Purge/revalidate affected paths.
- Run the production smoke suite and monitor errors, latency, and 404s.

Exit gate: preview and production pass all critical checks with Payload as the
active provider.

### Phase H: Rollback window and cleanup

- Keep Strapi online and read-only for at least two weeks or two normal
  editorial cycles.
- Keep the provider switch available.
- Monitor CMS/API errors, webhook failures, D1 load, media failures, SEO crawl
  errors, and unexpected 404s.
- Train editors and document recovery procedures.
- After acceptance, remove Strapi code, secrets, deployment configuration, and
  shadow comparison.
- Archive the Strapi repository and retain backups according to the agreed
  retention policy.

## 17. Cutover Rollback

Rollback must remain possible without reversing Payload writes.

If the Payload cutover fails:

1. Set the public and preview websites back to `CMS_PROVIDER=strapi`.
2. Redeploy or roll back the website Worker versions.
3. Revalidate/purge CMS-backed routes.
4. Re-enable Strapi editorial access if necessary.
5. Keep Payload and its imported data intact for diagnosis.
6. Restore Payload D1 only if a Payload schema/data failure requires it.

Strapi database and media must not be deleted or modified destructively before
the rollback window ends.

## 18. Observability

Track at minimum:

- Payload API response status and latency;
- D1 errors, query latency, overload events, rows read, and rows written;
- R2 upload/read/delete failures;
- webhook attempts, failures, retries, and processing time;
- published and draft document counts;
- website CMS fetch failures;
- CMS-backed route 404s;
- sitemap entry count;
- missing or broken media; and
- preview authorization failures.

The current behavior of returning an empty CMS list on any upstream failure
must be tightened. Build-time absence may have an explicit fallback, but a
production CMS outage must be logged and surfaced to monitoring rather than
silently rendering empty indexes as a successful response.

## 19. Decisions Locked by This Plan

- One Payload CMS, not separate staging and production CMS instances.
- One dedicated production Payload D1 database.
- R2 for media.
- Payload deployed on Cloudflare Workers/OpenNext, not Containers.
- Preview and public websites read the same database.
- Preview reads latest drafts; production reads published versions only.
- Editors write content once.
- Preview is access-controlled and non-indexable.
- The existing application D1 is not reused for Payload.
- HTML rich text is preserved during the initial migration.
- Public routes and slugs do not change.
- Strapi remains available as a rollback source during the acceptance window.
- Schema changes use reviewed migrations, never production schema push.

## 20. Definition of Done

The migration is complete when:

- Payload is the only active CMS provider for preview and production;
- editors can save once, review drafts on preview, and publish to the main
  domain;
- every migrated document, relation, status, and media object is accounted for;
- all automated and route-level acceptance requirements pass;
- production has completed the rollback observation window without unresolved
  CMS regressions;
- Strapi-specific website code and secrets have been removed;
- Strapi has been archived with recoverable backups; and
- operational, publishing, migration, backup, and recovery documentation has
  been handed to the team.
