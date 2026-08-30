# CommercePulse_AI_Network

**Owner:** Ayush Anand  
**Type:** Full-stack Node.js AI/network intelligence dashboard  
**Deployment:** Render Docker Web Service  
**Database:** Local JSON persistence with optional Render persistent disk  

CommercePulse_AI_Network is a portfolio-ready AI commerce/network intelligence platform that combines marketplace-style carbon and environmental asset workflows, role-based task routing, live data/API integrations, evidence dashboards, and operational decision support into a single deployable web application.

The system is built as a pure Node.js backend that serves a rich browser dashboard from `public/` and exposes API endpoints under `/api/*`. It can run without paid services because optional integrations fall back to deterministic demo responses when API keys are missing.

## Highlights

- Role-based workflow experience with login/session handling.
- Marketplace and operational intelligence flows for credits, claims, verification, alerts, and stakeholder handoffs.
- API-backed evidence views using optional OpenAI, NASA FIRMS, Sentinel Hub, Open-Meteo, GBIF/iNaturalist, Wikipedia, and related public data providers.
- Persistent JSON data layer suitable for demo deployment with a Render disk.
- Single-service deployment: no separate frontend/backend split required.
- GitHub Pages redirect support for portfolio links.

## Local Run

```bash
node --version   # recommended: Node 20
node server.js
```

Open:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

## Environment

Copy `.env.example` to `.env` for local development. All external keys are optional.

```bash
cp .env.example .env
```

## Deployment Summary

Use Render as a **Docker Web Service**.

```text
Name: commercepulse-ai-network
Runtime: Docker
Root Directory: .
Dockerfile Path: Dockerfile
Persistent Disk: /var/data
Environment:
DATA_DIR=/var/data
NODE_ENV=production
CORS_ORIGINS=*
```

MongoDB, Firebase, and Google OAuth are **not required** for this project.

## Ownership

© 2026 Ayush Anand · CommercePulse_AI_Network™ · All rights reserved.
