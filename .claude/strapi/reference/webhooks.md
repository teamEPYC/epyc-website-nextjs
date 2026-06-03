# Strapi v5 Webhooks Reference

Source: https://docs.strapi.io/dev-docs/backend-customization/webhooks

---

## Setup

Configure in Strapi admin → Settings → Webhooks → Add new webhook.
Set URL, optional secret, and select which events to fire on.

Global default headers in `config/server.js`:
```js
module.exports = {
  webhooks: {
    defaultHeaders: { 'Custom-Header': 'value' }
  }
}
```

---

## Events

| Event | Trigger |
|-------|---------|
| `entry.create` | Entry created |
| `entry.update` | Entry updated |
| `entry.delete` | Entry deleted |
| `entry.publish` | Entry published (Draft & Publish) |
| `entry.unpublish` | Entry unpublished |
| `media.create` | File uploaded |
| `media.update` | File or metadata changed |
| `media.delete` | File deleted |

User content-type changes are intentionally excluded from webhooks.

---

## Payload structure

Request header: `X-Strapi-Event: entry.publish`

Body:
```json
{
  "event": "entry.publish",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "model": "blog",
  "uid": "api::blog.blog",
  "entry": {
    "id": 1,
    "documentId": "abc123",
    "title": "...",
    "publishedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

Private fields are NOT included in the payload.

---

## Security

Verify incoming webhooks with HMAC-SHA256:
1. Compute HMAC over raw body + timestamp
2. Compare signatures using constant-time comparison
3. Reject payloads older than ~5 minutes

---

## Common use case: on-demand ISR revalidation

Fire a webhook on `entry.publish` / `entry.update` → hit Next.js `/api/revalidate?path=/blogs` to purge the edge cache instead of relying solely on the 60s revalidate interval.
