# Frontend Component Plan

## 1. Components

| Component | Description |
|-----------|-------------|
| **FeatureBriefForm** | Input form with file upload for creating a new feature brief (product name, description, images, target audience) |
| **ContentPreview** | Displays generated captions and images returned from the AI generation endpoint; allows editing before publishing |
| **PlatformSelector** | Checkbox group for LinkedIn, Twitter, Instagram, WhatsApp — used in the Launch flow to pick target platforms |
| **ContentGallery** | Grid layout showing thumbnails/titles of all past content launches with quick status badges |
| **Dashboard** | Home page component showing summary stats (total launches, recent activity, platform distribution) |

## 2. Pages

| Page | Route | Components Used | Description |
|------|-------|-----------------|-------------|
| Home | `/` | `Dashboard` | Landing page with stats and quick-launch button |
| Launch | `/launch` | `FeatureBriefForm`, `PlatformSelector`, `ContentPreview` | Multi-step flow: submit brief → preview content → publish |
| History | `/history` | `ContentGallery` | Browse all previously generated content launches |

## 3. Services (`src/services/api.js`)

```js
// All functions use axios with base URL from env:
// REACT_APP_API_URL (default http://localhost:5000)

submitBrief(formData)       // POST /api/briefs         — multipart (text + images)
getPreview(briefId)         // POST /api/content/generate — returns captions + images
publishToSocial(contentId)  // POST /api/publish         — sends to selected platforms
getHistory()                // GET  /api/content         — returns list of past launches
```

## 4. State Management

- React Context for global auth/theme state
- `useState` + `useReducer` locally per page/component
- No Redux or external state library

## 5. Backend Endpoints

| Method | Endpoint | Request Body | Response | Component |
|--------|----------|--------------|----------|-----------|
| `POST` | `/api/briefs` | `FormData` (name, description, files, audience) | `{ briefId, status }` | `FeatureBriefForm` |
| `POST` | `/api/content/generate` | `{ briefId, platforms[] }` | `{ contentId, captions[], images[] }` | `ContentPreview` |
| `GET` | `/api/content/:id` | — | `{ captions, images, platforms, status }` | `ContentPreview` |
| `POST` | `/api/publish` | `{ contentId, platforms[] }` | `{ success, postUrls[] }` | `ContentPreview` (publish button) |
| `GET` | `/api/content` | — | `[{ id, title, status, createdAt, thumbnail }]` | `ContentGallery` / `Dashboard` |
