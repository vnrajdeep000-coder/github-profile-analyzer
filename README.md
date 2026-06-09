# GitHub Profile Analyzer API

A RESTful API that fetches GitHub user data, extracts key insights, and persists them in MySQL. Built with Node.js, Express.js, MySQL, Axios, and TypeScript following MVC architecture.

---

## Folder Structure

```
artifacts/api-server/
├── src/
│   ├── config/
│   │   └── database.ts          # MySQL connection pool
│   ├── controllers/
│   │   └── profileController.ts # Request handlers (analyzeProfile, listProfiles, getProfile)
│   ├── models/
│   │   └── Profile.ts           # TypeScript interfaces
│   ├── services/
│   │   ├── githubService.ts     # GitHub API calls via Axios
│   │   └── profileService.ts    # MySQL CRUD operations
│   ├── routes/
│   │   ├── index.ts             # Root router
│   │   ├── health.ts            # GET /api/healthz
│   │   └── profiles.ts          # Profile routes
│   ├── lib/
│   │   ├── logger.ts            # Pino logger singleton
│   │   └── response.ts          # Standardised API response helpers
│   ├── app.ts                   # Express app setup
│   └── index.ts                 # Entry point (starts server)
├── schema.sql                   # MySQL schema
├── .env.example                 # Environment variable template
├── github_analyzer.postman_collection.json
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ (Node 24 recommended)
- **pnpm** 9+
- **MySQL** 8.0+

---

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up the database

Connect to MySQL and run the schema:

```bash
mysql -u root -p < artifacts/api-server/schema.sql
```

This creates the `github_analyzer` database and the `profiles` table.

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
```

Edit `.env`:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=github_analyzer

# Optional — unauthenticated rate limit is 60 req/hour
# Create at https://github.com/settings/tokens (no scopes needed)
GITHUB_TOKEN=
```

### 4. Start the server

```bash
pnpm --filter @workspace/api-server run dev
```

The server starts on `http://localhost:5000` (or the `PORT` you set).

---

## API Reference

All responses follow a standard envelope:

```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

### POST `/api/analyze/:username`

Fetch a GitHub user and persist their profile.

```bash
curl -X POST http://localhost:5000/api/analyze/torvalds
```

**Response 201** — profile created  
**Response 404** — GitHub user not found  
**Response 409** — profile already stored  
**Response 502** — GitHub API failure

---

### GET `/api/profiles`

Return all stored profiles with optional search and pagination.

| Query param | Type   | Default | Description                       |
|-------------|--------|---------|-----------------------------------|
| `page`      | number | 1       | Page number                       |
| `limit`     | number | 10      | Results per page (max 100)        |
| `search`    | string | —       | Filter by username or name        |

```bash
curl "http://localhost:5000/api/profiles?page=1&limit=5&search=linux"
```

---

### GET `/api/profiles/:id`

Return a single profile by its numeric database ID.

```bash
curl http://localhost:5000/api/profiles/1
```

**Response 200** — profile found  
**Response 404** — profile not found

---

### GET `/api/healthz`

Server health check — returns `200 OK`.

---

## Postman Collection

Import `github_analyzer.postman_collection.json` into Postman. Set the `base_url` variable to `http://localhost:5000` and start making requests.

---

## Error Codes

| Code                    | HTTP | Meaning                          |
|-------------------------|------|----------------------------------|
| `GITHUB_USER_NOT_FOUND` | 404  | Username does not exist on GitHub |
| `GITHUB_API_ERROR`      | 502  | GitHub API returned an error     |
| `DUPLICATE_PROFILE`     | 409  | Profile already analyzed         |
| `PROFILE_NOT_FOUND`     | 404  | No DB record for the given ID    |
| `INVALID_ID`            | 400  | `:id` is not a valid integer     |
| `DATABASE_ERROR`        | 500  | MySQL query failed               |
| `INTERNAL_ERROR`        | 500  | Unexpected server error          |

---

## Rate Limits

Unauthenticated GitHub API calls are limited to **60 requests/hour**. Set `GITHUB_TOKEN` in `.env` to raise this to **5 000 requests/hour** (no special scopes required — a fine-grained PAT with no permissions is sufficient).
