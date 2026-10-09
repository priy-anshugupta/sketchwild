# Deploy SketchWild

The Express server serves the built React frontend and `/api/*` routes together. Deploy one Node web service; a separate frontend service or database is unnecessary for the current browser-local journal.

## Local setup

Install Node 22 and Ollama, then run:

```sh
npm ci
ollama pull gemma3:4b
```

Copy `.env.example` to `.env`, start Ollama, and run `npm run dev`. Open `http://127.0.0.1:5173`. Keep the terminal running while testing. For a production-style local preview, run `npm run build` followed by `npm start` and open `http://127.0.0.1:3001`.

Local inference runs on the computer hosting Express. A deployed server cannot reach the Ollama instance on a visitor's laptop through its own `127.0.0.1` address.

## Render web service

Connect this GitHub repository in Render and create a Blueprint using `render.yaml`, or create a Node web service with:

| Setting | Value |
| --- | --- |
| Build | `npm ci --include=dev && npm run build` |
| Start | `npm start` |
| Health check | `/api/health` |
| Node version | `22.18.0` |
| HOST | `0.0.0.0` |

The blueprint selects paid compute. Review pricing and credits before creating resources. Render supplies `PORT`; do not set it to your laptop's development port.

## Hosted inference configuration

Choose and verify an HTTPS OpenAI-compatible **open-weight vision** endpoint. Compatibility means accepting two image parts in `/v1/chat/completions`; it does not require using an OpenAI model. A provider has not been selected or validated for this repository's public deployment.

Set these in Render's environment settings:

```text
AI_PROVIDER=hosted
AI_BASE_URL=https://PROVIDER_HOST/v1
AI_MODEL=EXACT_VISION_MODEL_ID
AI_API_KEY=YOUR_SERVER_SECRET
AI_RETENTION_NOTICE=VERIFIED_PROVIDER_RETENTION_DESCRIPTION
AI_TIMEOUT_MS=45000
AI_IMAGE_MAX_EDGE=1280
AI_DAILY_REQUEST_LIMIT=100
```

Replace the placeholders. Never add the secret to frontend code or Git. Hosting credits and inference-provider charges are separate. A small Render web service runs the app, not the model weights.

## Verify before sharing

1. `/api/health` should return `ok: true`.
2. `/api/capabilities` should show the intended model and configuration. Hosted configuration readiness does not prove upstream compatibility.
3. Upload a distinct subject/sketch pair and obtain a real result. Check its model identity, feedback, and latency.
4. Save and reload an entry; check export and mobile navigation.
5. Confirm the displayed photo-processing notice matches the actual provider policy.

Browser journals are tied to the site's origin and browser profile. Moving from localhost to a deployed URL does not transfer existing entries automatically. Export important entries first.

Reference: [Render Node deployment](https://render.com/docs/deploy-node-express-app).
