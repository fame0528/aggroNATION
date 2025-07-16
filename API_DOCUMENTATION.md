# API Documentation - aggroNATION Dashboard

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require no authentication, but admin endpoints require an API key:

```
X-Admin-Key: your-admin-api-key
```

## Rate Limiting

All endpoints are rate-limited:

- Default: 100 requests per 15 minutes per IP
- Admin endpoints: 50 requests per 15 minutes

## Content Endpoints

### Get Articles

```http
GET /api/rss/articles
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `category` (string): Filter by category
- `source` (string): Filter by source
- `search` (string): Search in title and content
- `status` (string): Filter by status (active, archived)

**Response:**

```json
{
  "articles": [
    {
      "_id": "string",
      "title": "string",
      "url": "string",
      "content": "string",
      "summary": "string",
      "author": "string",
      "source": "string",
      "category": "string",
      "tags": ["string"],
      "publishedAt": "2023-12-01T00:00:00Z",
      "createdAt": "2023-12-01T00:00:00Z",
      "readTime": 5,
      "imageUrl": "string",
      "status": "active"
    }
  ],
  "total": 150,
  "hasMore": true,
  "page": 1,
  "limit": 20
}
```

### Get Videos

```http
GET /api/rss/videos
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12, max: 50)
- `category` (string): Filter by category
- `channelName` (string): Filter by channel
- `search` (string): Search in title and description

**Response:**

```json
{
  "videos": [
    {
      "_id": "string",
      "title": "string",
      "url": "string",
      "description": "string",
      "channelName": "string",
      "channelUrl": "string",
      "thumbnailUrl": "string",
      "duration": "00:10:30",
      "publishedAt": "2023-12-01T00:00:00Z",
      "category": "string",
      "tags": ["string"],
      "viewCount": 1000,
      "likeCount": 50
    }
  ],
  "total": 75,
  "hasMore": true
}
```

### Get Feeds

```http
GET /api/rss/feeds
```

**Query Parameters:**

- `type` (string): Filter by type (articles, videos)
- `active` (boolean): Filter by active status

**Response:**

```json
{
  "feeds": [
    {
      "_id": "string",
      "name": "string",
      "url": "string",
      "type": "articles",
      "category": "string",
      "isActive": true,
      "lastFetchedAt": "2023-12-01T00:00:00Z",
      "lastSuccessAt": "2023-12-01T00:00:00Z",
      "failureCount": 0,
      "healthScore": 100,
      "articlesCount": 150
    }
  ],
  "total": 25
}
```

## User Content Endpoints

### Bookmarks

#### Get Bookmarks

```http
GET /api/user-content?type=bookmarks&userId=default
```

#### Create Bookmark

```http
POST /api/user-content?type=bookmarks&userId=default
Content-Type: application/json

{
  "articleId": "string",
  "title": "string",
  "url": "string",
  "description": "string",
  "tags": ["ai", "machine-learning"],
  "category": "research"
}
```

#### Delete Bookmark

```http
DELETE /api/user-content?type=bookmarks&id=bookmark_id&userId=default
```

### Reading Lists

#### Get Reading Lists

```http
GET /api/user-content?type=reading-lists&userId=default
```

#### Create Reading List

```http
POST /api/user-content?type=reading-lists&userId=default
Content-Type: application/json

{
  "name": "AI Research Papers",
  "description": "Important papers to read",
  "articles": ["article_id_1", "article_id_2"],
  "isPublic": false
}
```

#### Update Reading List

```http
PUT /api/user-content?type=reading-lists&id=list_id&userId=default
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "articles": ["article_id_1", "article_id_2", "article_id_3"],
  "isPublic": true
}
```

## Search Endpoint

### Search Content

```http
GET /api/search?q=machine%20learning&type=all&limit=10
```

**Query Parameters:**

- `q` (string, required): Search query
- `type` (string): Content type (articles, videos, all) - default: all
- `limit` (number): Results per type (default: 10)

**Response:**

```json
{
  "results": {
    "articles": [
      {
        "_id": "string",
        "title": "string",
        "url": "string",
        "summary": "string",
        "relevanceScore": 0.95
      }
    ],
    "videos": [
      {
        "_id": "string",
        "title": "string",
        "url": "string",
        "description": "string",
        "relevanceScore": 0.88
      }
    ]
  },
  "total": {
    "articles": 25,
    "videos": 15,
    "all": 40
  },
  "query": "machine learning",
  "processingTime": 45
}
```

## Social Sharing Endpoints

### Get Share URLs

```http
GET /api/social?url=https://example.com&title=Article%20Title&description=Description&hashtags=ai,ml
```

**Response:**

```json
{
  "shareUrls": {
    "twitter": "https://twitter.com/intent/tweet?url=...",
    "facebook": "https://www.facebook.com/sharer/sharer.php?u=...",
    "linkedin": "https://www.linkedin.com/sharing/share-offsite/?url=...",
    "reddit": "https://www.reddit.com/submit?url=...",
    "email": "mailto:?subject=...&body=...",
    "whatsapp": "https://wa.me/?text=...",
    "telegram": "https://t.me/share/url?url=...",
    "copy": "https://example.com"
  },
  "metadata": {
    "url": "https://example.com",
    "title": "Article Title",
    "description": "Description",
    "hashtags": ["ai", "ml"]
  }
}
```

### Record Share

```http
POST /api/social
Content-Type: application/json

{
  "url": "https://example.com",
  "title": "Article Title",
  "platform": "twitter",
  "hashtags": ["ai", "ml"]
}
```

## Admin Endpoints

### Get Admin Stats

```http
GET /api/admin?action=stats
X-Admin-Key: your-admin-key
```

**Response:**

```json
{
  "system": {
    "uptime": 86400,
    "memory": {
      "used": 1073741824,
      "total": 8589934592,
      "percentage": 12.5
    },
    "cpu": {
      "usage": 0.15
    }
  },
  "database": {
    "totalArticles": 15000,
    "totalVideos": 2500,
    "totalFeeds": 150,
    "activeFeeds": 145,
    "failedFeeds": 5,
    "totalUsers": 1250,
    "totalBookmarks": 8500,
    "totalReadingLists": 1200
  },
  "activity": {
    "last24h": {
      "articles": 45,
      "videos": 12,
      "pageViews": 2500,
      "searches": 180,
      "errors": 3
    }
  },
  "performance": {
    "avgResponseTime": 250,
    "errorRate": 0.02,
    "successRate": 0.98
  }
}
```

### Manage Feeds

```http
POST /api/admin?action=feeds
X-Admin-Key: your-admin-key
Content-Type: application/json

{
  "action": "activate|deactivate|refresh",
  "feedId": "feed_id"
}
```

## Developer Tools Endpoints

### Get API Keys

```http
GET /api/developer-tools?type=api-keys&userId=default
```

### Create API Key

```http
POST /api/developer-tools?type=api-keys&userId=default
Content-Type: application/json

{
  "name": "My API Key",
  "permissions": ["read:articles", "read:videos"],
  "expiresAt": "2024-12-01T00:00:00Z"
}
```

### Get Webhooks

```http
GET /api/developer-tools?type=webhooks&userId=default
```

### Create Webhook

```http
POST /api/developer-tools?type=webhooks&userId=default
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["article.created", "video.created"],
  "headers": {
    "Authorization": "Bearer your-token"
  },
  "active": true
}
```

## Real-time Events (SSE)

### Subscribe to Events

```http
GET /api/events
Accept: text/event-stream
Cache-Control: no-cache
```

**Event Types:**

- `article.created`
- `article.updated`
- `video.created`
- `video.updated`
- `feed.updated`
- `feed.error`
- `system.status`

**Event Format:**

```
event: article.created
data: {"id": "article_id", "title": "Article Title", "timestamp": "2023-12-01T00:00:00Z"}

event: feed.error
data: {"feedId": "feed_id", "error": "Connection timeout", "timestamp": "2023-12-01T00:00:00Z"}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "code": 400,
  "timestamp": "2023-12-01T00:00:00Z"
}
```

**Common Error Codes:**

- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Webhooks

When configured, webhooks will receive POST requests with the following format:

```json
{
  "event": "article.created",
  "data": {
    "id": "article_id",
    "title": "Article Title",
    "url": "https://example.com",
    "category": "AI Research",
    "publishedAt": "2023-12-01T00:00:00Z"
  },
  "timestamp": "2023-12-01T00:00:00Z"
}
```

## SDK Examples

### JavaScript/Node.js

```javascript
const AggroNationAPI = {
  baseURL: 'https://your-domain.com/api',

  async getArticles(params = {}) {
    const url = new URL('/rss/articles', this.baseURL);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

    const response = await fetch(url);
    return response.json();
  },

  async createBookmark(userId, bookmark) {
    const response = await fetch(`${this.baseURL}/user-content?type=bookmarks&userId=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookmark),
    });
    return response.json();
  },
};

// Usage
const articles = await AggroNationAPI.getArticles({
  page: 1,
  limit: 20,
  category: 'AI Research',
});
```

### Python

```python
import requests

class AggroNationAPI:
    def __init__(self, base_url):
        self.base_url = base_url

    def get_articles(self, **params):
        response = requests.get(f"{self.base_url}/rss/articles", params=params)
        return response.json()

    def create_bookmark(self, user_id, bookmark_data):
        url = f"{self.base_url}/user-content"
        params = {"type": "bookmarks", "userId": user_id}
        response = requests.post(url, params=params, json=bookmark_data)
        return response.json()

# Usage
api = AggroNationAPI('https://your-domain.com/api')
articles = api.get_articles(page=1, limit=20, category='AI Research')
```
