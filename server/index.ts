import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { analyze, ApiError, type AIConfig } from './coach';
import { normalizeImage } from './images';
import { requestSchema, type Capabilities } from '../shared/types';
const app = express();
app.disable('x-powered-by');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const provider = process.env.AI_PROVIDER || 'ollama';
const imageMaxEdge = Math.min(1800, Math.max(256, Number(process.env.AI_IMAGE_MAX_EDGE) || (provider === 'ollama' ? 640 : 1280)));
const config: AIConfig = {
  provider, model: process.env.AI_MODEL || 'gemma3:4b',
  baseUrl: (provider === 'ollama' ? process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434' : process.env.AI_BASE_URL || '').replace(/\/$/, ''),
  apiKey: process.env.AI_API_KEY || '',
  timeoutMs: Math.min(300000, Math.max(5000, Number(process.env.AI_TIMEOUT_MS) || (provider === 'ollama' ? 300000 : 45000))),
};
let capabilityCache: { time: number; value: Capabilities } | undefined;
async function capabilities(): Promise<Capabilities> {
  if (capabilityCache && Date.now() - capabilityCache.time < 10000) return capabilityCache.value;
  let configured = false, reason = '';
  if (provider === 'ollama') {
    try {
      const result = await fetch(`${config.baseUrl}/api/show`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: config.model }), signal: AbortSignal.timeout(3000) });
      const data = await result.json();
      config.supportsThinking = Array.isArray(data.capabilities) && data.capabilities.includes('thinking');
      configured = result.ok && Array.isArray(data.capabilities) && data.capabilities.includes('vision');
      reason = configured ? '' : 'The configured vision model is not downloaded or does not support images.';
    } catch { reason = 'Start Ollama and download the configured vision model to enable feedback.'; }
  } else if (provider === 'hosted') {
    try { const parsed = new URL(config.baseUrl); configured = parsed.protocol === 'https:' && !!config.apiKey && !!config.model; } catch { configured = false; }
    reason = configured ? '' : 'A hosted open vision endpoint, model, and server API key are required.';
  } else reason = 'This public preview has no live model. Run SketchWild locally with Ollama and Gemma 3 for AI observations; no API key is required.';
  let demoVideoUrl: string | undefined;
  try { const video = new URL(process.env.DEMO_VIDEO_URL || 'https://youtu.be/K3OrR_PUB0c'); if (video.protocol === 'https:') demoVideoUrl = video.href; } catch { /* Invalid overrides are not shown. */ }
  const value: Capabilities = { provider: provider === 'ollama' ? 'ollama' : provider === 'hosted' ? 'hosted' : 'disabled', configured, model: config.model, timeoutMs: config.timeoutMs, readiness: 'experimental', reason,
    demoVideoUrl,
    notice: provider === 'ollama' ? 'Photos are processed by Ollama on this app’s computer. On CPU, two photos can take several minutes. Journal entries stay in your browser.' : provider === 'hosted' ? `These two photos are sent through the app server to the configured AI provider. ${process.env.AI_RETENTION_NOTICE || 'Provider retention has not been verified. Use non-sensitive subject and sketch photos.'} Journal entries stay in your browser.` : 'Live AI is turned off in this preview. Uploaded pictures and journal entries stay in this browser; no pictures are sent for AI analysis.' };
  capabilityCache = { time: Date.now(), value }; return value;
}
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/capabilities', async (_req, res) => res.json(await capabilities()));
app.use((_req, res, next) => { res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'same-origin'); next(); });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 2, fields: 3, parts: 5 }, fileFilter: (_req, file, cb) => { if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true); else cb(new ApiError(400, 'IMAGE_TYPE', 'Choose a JPEG, PNG, or WebP photo. HEIC needs conversion first.')); } });
const visitors = new Map<string, { count: number; until: number }>();
let active = 0, daily = 0, day = new Date().toISOString().slice(0, 10);
const limit = Math.max(1, Number(process.env.AI_DAILY_REQUEST_LIMIT) || 100);
app.post('/api/coach', (req, _res, next) => {
  if (provider !== 'ollama' && provider !== 'hosted') return next(new ApiError(503, 'NOT_CONFIGURED', 'Live AI is turned off in this preview. Run SketchWild locally with Ollama and Gemma 3.'));
  // Same-origin browser requests only. Non-browser local clients may omit Origin.
  const origin = req.get('origin');
  if (origin) { try { if (new URL(origin).host !== req.get('host')) throw new Error(); } catch { return next(new ApiError(403, 'ORIGIN', 'This request must come from the SketchWild app.')); } }
  const now = Date.now();
  for (const [key, value] of visitors) if (value.until < now) visitors.delete(key);
  const key = req.ip || 'unknown';
  const visit = visitors.get(key) || { count: 0, until: now + 10 * 60 * 1000 };
  if (visit.count >= 6) return next(new ApiError(429, 'RATE_LIMIT', 'You’ve reached six attempts in ten minutes. Please try again later.'));
  visit.count++; visitors.set(key, visit); next();
}, upload.fields([{ name: 'subject', maxCount: 1 }, { name: 'sketch', maxCount: 1 }]), async (req, res, next) => {
  let acquired = false;
  try {
    const validated = requestSchema.safeParse(req.body);
    if (!validated.success) throw new ApiError(400, 'INPUT', 'Choose a supported subject and sketching focus.');
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    if (!files?.subject?.[0] || !files?.sketch?.[0]) throw new ApiError(400, 'MISSING_IMAGES', 'Add both the subject photo and your drawing.');
    const caps = await capabilities();
    if (!caps.configured) throw new ApiError(503, 'NOT_CONFIGURED', caps.reason || 'Live feedback is not configured.');
    if (active >= 1) throw new ApiError(429, 'BUSY', 'Another sketch is being reviewed. Please try again in a moment.');
    const currentDay = new Date().toISOString().slice(0, 10); if (currentDay !== day) { day = currentDay; daily = 0; }
    if (daily >= limit) throw new ApiError(429, 'BUDGET', 'Today’s model request allowance has been reached. You can still save your sketch.');
    active++; acquired = true;
    const images = await Promise.all([files.subject[0], files.sketch[0]].map(file => normalizeImage(file.buffer, imageMaxEdge)));
    daily++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);
    const abort = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', abort);
    try { res.json(await analyze(config, validated.data.category, validated.data.intent, images, controller.signal)); }
    finally { clearTimeout(timer); res.off('close', abort); }
  } catch (error) { next(error); }
  finally { if (acquired) active--; }
});
if (existsSync(path.join(root, 'dist'))) {
  app.use(express.static(path.join(root, 'dist')));
  app.get('/{*path}', (req, res) => { if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Unknown API endpoint' }); res.sendFile(path.join(root, 'dist/index.html')); });
}
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (res.headersSent) return;
  if (error instanceof ApiError) return res.status(error.status).json({ code: error.code, error: error.message });
  if (error instanceof multer.MulterError) return res.status(400).json({ code: 'UPLOAD_LIMIT', error: 'Upload exactly two photos, each under 8 MB.' });
  console.error('Request failed:', error instanceof Error ? error.name : 'Unknown error');
  res.status(500).json({ code: 'SERVER_ERROR', error: 'Something went wrong. Your local draft is safe.' });
});
const port = Number(process.env.PORT) || 3001;
app.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`SketchWild API listening on port ${port} (${provider})`));
