# Deployment — CommercePulse_AI_Network

## Recommended Deployment

Use **Render Docker Web Service**.

This project is not a split frontend/backend deployment. The Node.js server handles both:

```text
1. API routes under /api/*
2. Static dashboard files from /public
```

## Render Settings

```text
Service Type: Web Service
Runtime: Docker
Name: commercepulse-ai-network
Root Directory: .
Dockerfile Path: Dockerfile
```

## Environment Variables

```text
NODE_ENV=production
DATA_DIR=/var/data
CORS_ORIGINS=*
```

## Persistent Disk

```text
Mount Path: /var/data
Size: 1 GB
```

## Not Required

```text
MongoDB Atlas
Firebase
Google OAuth
Separate React/Vite/Next frontend service
Separate FastAPI backend service
```

## GitHub Pages

GitHub Pages can only serve a redirect/landing page for this project. The actual working app should live on Render.
