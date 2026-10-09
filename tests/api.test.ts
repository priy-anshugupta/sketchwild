import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import sharp from 'sharp';
test('public preview exposes setup details and rejects inference without accepting uploads', async () => {
  const app = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { env: { ...process.env, AI_PROVIDER: 'disabled', AI_API_KEY: '', DEMO_VIDEO_URL: 'https://youtu.be/walkthrough', PORT: '3098', HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Preview server did not start')), 15000);
      app.once('error', error => { clearTimeout(timeout); reject(error); });
      app.stdout.on('data', chunk => { if (String(chunk).includes('listening')) { clearTimeout(timeout); resolve(); } });
    });
    const caps = await (await fetch('http://127.0.0.1:3098/api/capabilities')).json();
    assert.equal(caps.provider, 'disabled'); assert.equal(caps.configured, false);
    assert.equal(caps.demoVideoUrl, 'https://youtu.be/walkthrough');
    assert.match(caps.notice, /no pictures are sent for AI analysis/i);
    const response = await fetch('http://127.0.0.1:3098/api/coach', { method: 'POST' });
    assert.equal(response.status, 503); assert.equal((await response.json()).code, 'NOT_CONFIGURED');
  } finally { app.kill(); }
});
test('HTTP upload pipeline validates both images and returns model feedback', async () => {
  const { createServer } = await import('node:http');
  let seenImages = 0;
  const upstream = createServer(async (req, res) => {
    let bytes = ''; for await (const chunk of req) bytes += chunk;
    const body = JSON.parse(bytes);
    if (req.url === '/api/show') { res.end(JSON.stringify({ capabilities: ['vision'] })); return; }
    seenImages = body.messages[0].images.length;
    for (const picture of body.messages[0].images) {
      const meta = await sharp(Buffer.from(picture, 'base64')).metadata();
      assert.equal(meta.format, 'jpeg'); assert.ok((meta.width || 0) <= 640); assert.equal(meta.exif, undefined);
    }
    res.end(JSON.stringify({ message: { content: JSON.stringify({ schemaVersion: '1', subjectCategory: 'leaves', status: 'coach', feature: 'edge', referenceEvidence: 'Test reference detail.', sketchEvidence: 'Test sketch detail.', invitation: 'Test invitation.', uncertainty: '' }) } }));
  });
  upstream.listen(0, '127.0.0.1'); await once(upstream, 'listening');
  const address = upstream.address(); assert.ok(address && typeof address === 'object');
  const app = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { env: { ...process.env, AI_PROVIDER: 'ollama', AI_MODEL: 'mock-vision', OLLAMA_BASE_URL: `http://127.0.0.1:${address.port}`, PORT: '3099', HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Test server did not start')), 15000);
      app.once('error', reject);
      app.stdout.on('data', chunk => { if (String(chunk).includes('listening')) { clearTimeout(timeout); resolve(); } });
    });
    const image = await sharp({ create: { width: 900, height: 450, channels: 3, background: '#448855' } }).png().toBuffer();
    const data = new FormData(); data.append('category', 'leaves'); data.append('intent', 'observation');
    data.append('subject', new Blob([image], { type: 'image/png' }), 'subject.png'); data.append('sketch', new Blob([image], { type: 'image/png' }), 'sketch.png');
    const response = await fetch('http://127.0.0.1:3099/api/coach', { method: 'POST', body: data });
    assert.equal(response.status, 200); const feedback = await response.json();
    assert.equal(seenImages, 2); assert.equal(feedback.meta.source, 'live_ai'); assert.equal(feedback.meta.model, 'mock-vision');
    const rejected = await fetch('http://127.0.0.1:3099/api/coach', { method: 'POST', headers: { Origin: 'https://unrelated.invalid' }, body: new FormData() });
    assert.equal(rejected.status, 403);
    const missing = new FormData(); missing.append('category', 'leaves'); missing.append('intent', 'observation');
    const missingResponse = await fetch('http://127.0.0.1:3099/api/coach', { method: 'POST', body: missing });
    assert.equal(missingResponse.status, 400); assert.equal((await missingResponse.json()).code, 'MISSING_IMAGES');
  } finally { app.kill(); upstream.closeAllConnections(); upstream.close(); }
});
