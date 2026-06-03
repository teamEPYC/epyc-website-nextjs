# Strapi v5 REST API Reference

Source: https://docs.strapi.io/dev-docs/api/rest

---

## Auth

All content types are private by default. Pass the API token as a Bearer header:

```
Authorization: Bearer <STRAPI_API_TOKEN>
```

Tokens live in Strapi admin → Settings → Global Settings → API Tokens.
Token types: **Read-only** (find/findOne only), **Full access**, **Custom** (per-collection permissions).

---

## Endpoints

### Collection types
```
GET    /api/:pluralApiId               list
POST   /api/:pluralApiId               create
GET    /api/:pluralApiId/:documentId   get one
PUT    /api/:pluralApiId/:documentId   update
DELETE /api/:pluralApiId/:documentId   delete
```

### Single types
```
GET    /api/:singularApiId   get
PUT    /api/:singularApiId   update/create
DELETE /api/:singularApiId   delete
```

---

## Response shapes

### List
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123xyz",
      "title": "...",
      "slug": "...",
      "createdAt": "...",
      "updatedAt": "...",
      "publishedAt": "..."
    }
  ],
  "meta": {
    "pagination": { "start": 0, "limit": 25, "total": 42 }
  }
}
```

### Single
```json
{ "data": { "id": 1, "documentId": "abc123xyz", "title": "..." } }
```

> **v5 breaking change:** Fields are flat on the item — no nested `attributes` object like v4.

---

## documentId vs id

- `id` — internal numeric DB row. Unstable across migrations.
- `documentId` — stable alphanumeric public identifier introduced in v5. Use this for fetching by ID.

```
GET /api/blogs/abc123xyz
```

---

## Populate

Relations and media are **not returned by default** — must be explicitly populated.

```
# Single relation / media field
GET /api/blogs?populate=author
GET /api/blogs?populate=coverImage

# Multiple
GET /api/blogs?populate[0]=author&populate[1]=coverImage

# All (1 level deep — use sparingly)
GET /api/blogs?populate=*

# Deep populate
GET /api/projects?populate[industry][populate][0]=title

# Populate with field selection (reduces payload)
GET /api/blogs?populate[coverImage][fields][0]=url&populate[coverImage][fields][1]=width&populate[coverImage][fields][2]=height

# Populate with filter on relation
GET /api/projects?populate[categories][filters][name][$eq]=Branding
```

---

## Field selection

Limit which scalar fields are returned. Does **not** work on relations/media (use populate for those).

```
GET /api/blogs?fields[0]=title&fields[1]=slug&fields[2]=publishedDate
```

---

## Filtering

```
GET /api/:pluralApiId?filters[field][operator]=value
```

### Comparison operators
| Operator | Meaning |
|----------|---------|
| `$eq` | Equal |
| `$eqi` | Equal (case-insensitive) |
| `$ne` | Not equal |
| `$lt` / `$lte` | Less than / less than or equal |
| `$gt` / `$gte` | Greater than / greater than or equal |
| `$in` | In array |
| `$notIn` | Not in array |
| `$between` | Within range |
| `$null` | Is null |
| `$notNull` | Is not null |

### String operators
| Operator | Meaning |
|----------|---------|
| `$contains` | Contains (case-sensitive) |
| `$notContains` | Does not contain |
| `$containsi` | Contains (case-insensitive) |
| `$notContainsi` | Does not contain (case-insensitive) |
| `$startsWith` / `$startsWithi` | Starts with |
| `$endsWith` / `$endsWithi` | Ends with |

### Logical operators
```
# OR
?filters[$or][0][featured][$eq]=true&filters[$or][1][type][$containsi]=brand

# AND (explicit)
?filters[$and][0][featured][$eq]=true&filters[$and][1][publishedAt][$notNull]=true

# NOT
?filters[$not][slug][$eq]=draft-post
```

### Filter on relation
```
GET /api/projects?filters[industry][slug][$eq]=tech
```

---

## Sorting

```
GET /api/blogs?sort=publishedDate:desc
GET /api/blogs?sort[0]=publishedDate:desc&sort[1]=title:asc
```

---

## Pagination

### Offset-based (default)
```
GET /api/blogs?pagination[start]=0&pagination[limit]=10
```
Response meta: `{ pagination: { start, limit, total } }`

### Page-based
```
GET /api/blogs?pagination[page]=1&pagination[pageSize]=10
```
Response meta: `{ pagination: { page, pageSize, pageCount, total } }`

---

## Draft & Publish

Only entries with `publishedAt != null` are returned by default.

```
GET /api/blogs?status=published   # default
GET /api/blogs?status=draft       # requires token with draft permission
```

---

## Media fields

Media is a relation — populate it explicitly:

```json
{
  "coverImage": {
    "id": 5,
    "documentId": "...",
    "url": "https://pub-xxx.r2.dev/image.jpg",
    "width": 1200,
    "height": 630,
    "alternativeText": "Alt text",
    "formats": {
      "thumbnail": { "url": "...", "width": 156, "height": 98 },
      "small":     { "url": "...", "width": 500, "height": 313 },
      "medium":    { "url": "...", "width": 750, "height": 469 },
      "large":     { "url": "...", "width": 1000, "height": 625 }
    }
  }
}
```

Not all formats are guaranteed — always check for existence before use.

---

## Creating entries (POST)

```
POST /api/submissions
Content-Type: application/json
Authorization: Bearer <token>

{ "data": { "name": "...", "email": "...", "message": "..." } }
```

Response: `{ "data": { "id": 1, "documentId": "...", ... } }`

---

## Error responses

```json
{ "data": null, "error": { "status": 404, "name": "NotFoundError", "message": "Not Found" } }
```

| Status | Meaning |
|--------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Missing or invalid token |
| 403 | Token lacks permission |
| 404 | Entry not found |
| 500 | Server error |
