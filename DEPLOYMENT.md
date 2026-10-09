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

### Public preview without an API key (default)

The committed `render.yaml` now uses `AI_PROVIDER=disabled`. This hosts the complete frontend and backend without a model or inference bill. Visitors can browse missions, upload pictures, save reflections, and export their browser journal. Live observation requests are disabled. A preview notice links to local Gemma setup and the labelled authored example; pictures are not sent to a model.

1. In Render, select **New → Blueprint**, connect `priy-anshugupta/sketchwild`, and select the `main` branch.
2. Confirm Render found `render.yaml`. Review the paid `0.5c-512mb` compute plan and check that your promotional credits are active before creating it.
3. Create the Blueprint. No inference API key or provider account is needed for this mode.
4. Wait for the build/deploy to finish, then open the assigned `https://...onrender.com` URL.
5. In the service's **Environment** settings, optionally add `DEMO_VIDEO_URL` with your HTTPS YouTube or Google Drive video link. Save and deploy. The public preview will then show **Watch walkthrough**.
6. Check `/api/health` and `/api/capabilities`: `configured` should be `false` and `provider` should be `disabled`. Verify the preview notice, disabled observation button, example link, and saving/exporting a journal entry.

Use YouTube **Unlisted** for an easy-to-watch demo that anyone with the link can open, or a Drive link with **Anyone with the link → Viewer** access. Check the link in a signed-out browser. Do not use a private video or a Drive file requiring permission.

Keep the site and video available while the submission is being reviewed, rather than assuming the deadline is the last day judges will visit. To stop spending after review, suspend or delete the service in Render. This makes the public demo unavailable.

### Service settings

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

This is optional. Only follow this section if you want live AI on the public site. Change `AI_PROVIDER` from `disabled` to `hosted` in Render's environment settings; if you continue syncing the Blueprint, also update its provider value so a later sync does not restore preview mode.

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
