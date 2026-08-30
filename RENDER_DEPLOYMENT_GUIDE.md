# Render Deployment Guide — CommercePulse_AI_Network

Deploy this project as **one Render Docker Web Service**.

## 1. Push to GitHub

Create a GitHub repository named:

```text
CommercePulse_AI_Network
```

Upload/push the finalized project files.

## 2. Create Render Service

Go to Render:

```text
New → Web Service
```

Select the GitHub repository and use:

```text
Name: commercepulse-ai-network
Runtime: Docker
Branch: main
Root Directory: .
Dockerfile Path: Dockerfile
```

## 3. Add Persistent Disk

Add a disk so sessions, workflow state, inbox changes, and audit data persist across redeploys.

```text
Disk Name: commercepulse-data
Mount Path: /var/data
Size: 1 GB
```

## 4. Environment Variables

Required for production-safe operation:

```text
NODE_ENV=production
DATA_DIR=/var/data
CORS_ORIGINS=*
```

Optional provider keys:

```text
OPENAI_API_KEY=
NASA_FIRMS_MAP_KEY=
SENTINEL_HUB_CLIENT_ID=
SENTINEL_HUB_CLIENT_SECRET=
DATA_GOV_IN_KEY=
IUCN_TOKEN=
EBIRD_TOKEN=
```

The app works without these optional keys using demo/fallback logic.

## 5. Test

Open:

```text
https://commercepulse-ai-network.onrender.com
```

Test:

```text
https://commercepulse-ai-network.onrender.com/api/health
```

## Architecture Notes

- No MongoDB is required.
- No Google OAuth is required.
- No separate frontend service is required.
- The Node server serves both `/api/*` and the dashboard files in `public/`.
