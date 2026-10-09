# SketchWild

A paper-first outdoor sketching companion. Choose an outdoor subject, draw on paper, upload a subject photograph and your drawing, and get one invitation to look again from an open vision model. Save attempts and reflections in a personal browser journal.

## Implemented

- Outdoor Missions page with six designed exercises spanning shapes, overlap, texture, light, empty space, and depth. Filter by place and available time; print an exercise to take outside.
- Field Passport with four participation milestones and one stamp per distinct completed mission. Eligible sessions require both photos and explicit self-reported outdoor completion. No art score, verified-location claim, punitive streak, or duplicate mission reward.
- Series progress and the next unfinished mission. This recommendation is deterministic, not claimed as AI-generated personalization. The open vision model continues to power picture feedback.
- Clear navigation and stronger contrast, with distinct subject colors and readable mission cards.

- Six subject exercises: leaves, flowers, trees, bark, rocks, outdoor scenes.
- Suggested durations and observation/shapes/texture focus.
- Two-photo upload, preview, rotation, bounded image processing, and metadata stripping through re-encoding.
- Open vision inference using Ollama or a configurable OpenAI-compatible hosted endpoint. “OpenAI-compatible” describes an API format; select an actual open-weight vision model for the challenge.
- Category-specific prompts, validated response structure, retake/uncertain responses, and visible experimental status.
- Local drafts, journal filtering, linked revisits, before/after view, deletion, and ZIP exports containing JSON plus images.
- Clearly labelled authored feedback example, never silently substituted for a live response.
- Mobile interface, semantic controls, reduced-motion support, and connection/privacy information.
- Render deployment blueprint, request/concurrency limits, and a daily inference-request cap.

## Start locally

Requires Node 22.18+ and npm. Install dependencies:

```sh
npm install
```

For local model feedback, install Ollama from its official site, start it, and download a vision model. The current development default is:

```sh
ollama pull gemma3:4b
```

On Windows, make sure the `ollama` command resolves to the CLI rather than the tray app. If necessary use the installed Ollama CLI path directly. Copy `.env.example` to `.env` and adjust `AI_MODEL` for your installed vision model. Default local inference works without an API key; initial app and model downloads need internet.

```sh
npm run dev
```

Open **http://127.0.0.1:5173**. Vite forwards `/api` to the local API on port 3001. The installed model must advertise the `vision` capability. A text-only Llama model does not support this task.

Production/local single-server build:

```sh
npm run build
npm start
```

Open http://127.0.0.1:3001. The server serves the generated `dist` and API together. `npm test` runs focused contract/adapter checks. Image-pair accuracy is a separate evaluation, not established by these tests.

## Model configuration

Local default: `AI_PROVIDER=ollama`, `AI_MODEL=gemma3:4b`, `OLLAMA_BASE_URL=http://127.0.0.1:11434`. Gemma 3 4B supports images; the smaller Gemma 3 1B does not. Small-model feedback is experimental; runtime memory and latency depend on images/hardware. Gemma feedback quality and speed still need testing with real subject/sketch pairs. To compare with the previous model, set `AI_MODEL=qwen3-vl:2b-instruct` and restart the server. Use the explicit Qwen Instruct tag: the unqualified `qwen3-vl:2b` alias returned empty final messages under a bounded output budget in development.

Hosted mode: `AI_PROVIDER=hosted`, `AI_BASE_URL` ending in `/v1`, `AI_MODEL` as the exact open vision model ID, `AI_API_KEY` stored only on the server. The endpoint must accept two data-URL images in `/chat/completions`. Provider compatibility, retention, cost, and model identity need a successful real request before public deployment. Fill `AI_RETENTION_NOTICE` with verified provider-specific wording.

## Render

Push this repository to your Git provider, create a Render Blueprint from `render.yaml`, and supply its secret/config values in Render. This blueprint selects a **paid 0.5 CPU / 512 MB service**; check current pricing and credit eligibility before provisioning. The model runs at a separate hosted endpoint, not in this small Render container. Render credit does not pay an unrelated inference provider. Render's assigned `PORT` is respected. See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete configuration.

Until hosted inference is configured, the app still supports guided sketching and the browser journal, but live feedback is unavailable. No hosted deployment has been created by this repository alone.

## Data and limits

Journal images and notes live in IndexedDB on the current browser/device. They are not synchronized; clearing site data removes them. Export a ZIP first. Drafts remain through a refresh, including after an interrupted request; refresh never automatically repeats a paid analysis.

For analysis, the app sends only the two selected images plus category and focus to its server. The server validates and normalizes them to JPEG at a maximum 640px edge locally / 1280px hosted. `AI_IMAGE_MAX_EDGE` controls this tradeoff: smaller local inputs improve CPU latency but may lose fine detail. Validate image size together with model accuracy. It does not intentionally persist uploads or log image content. Hosted providers have their own policies. Local mode sends inference to the configured Ollama endpoint. Privacy statements about local mode assume this endpoint is actually local.

Limits: two files ≤8 MB each before browser normalization; JPEG/PNG/WebP; decoded input ≤24MP; no animated/multi-page inputs; one simultaneous model request; six attempts per IP per ten minutes; 100 upstream attempts/day by default. Limits are in-process and reset on restart, suitable for a single-instance prototype rather than a durable distributed billing guard. Behind a proxy, do not trust arbitrary forwarded IP headers without configuring an explicit trusted proxy policy. The default conservatively groups forwarded users at the proxy address.

Default AI timeout is 300 seconds locally / 45 seconds hosted. This development laptop's CPU-only vision requests exceeded two minutes even with reduced image size, so a longer local limit is explicit; a hosted endpoint is recommended for a public demo. API failures never fabricate a success or return the sample card. Responses must pass category/evidence/schema checks; those checks do not guarantee visual truth.

## Evaluation still required

Use original/permissioned real photographs and paper drawings. Test two development pairs per category and four held-out pairs per category (three clear and one unclear/unrelated), as defined in the PRD. Keep all results, latency, prompts, model versions, and mistakes. Gather an actual outdoor pilot before claiming learning or screen-time benefits.

All six subjects are available as exercises; personalized feedback across them is currently experimental. Local live smoke tests establish pipeline operation, not validated category accuracy. No outdoor user trial, calibrated art score, species identifier, or proven improvement in learning is included.

## Design assets and research

The sketchbook banner was generated for interface decoration. It is not an actual participant image, a field trial, or model evaluation evidence. Icons are from Lucide. Fonts use Google Fonts with system fallbacks. For strict offline use, run the local app/model and use the system font fallback or vendor licensed fonts; full installable PWA caching is not implemented.

Research inspirations include [Bio Sketchbook (2021)](https://chaozhang.design/assets/biosketchbook_idc21.4a27be43.pdf) and [John Muir Laws' nature journaling practices](https://johnmuirlaws.com/in-discussion-anna-mason-and-john-muir-laws/). The implementation, interface, and task prompts here are original. Model and dependency licenses remain separate from this app's MIT license. The interface has no research-credits section.

See [SketchWild-PRD.md](./SketchWild-PRD.md) for product requirements and the challenge plan.
