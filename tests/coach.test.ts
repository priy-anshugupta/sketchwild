import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { categories } from '../shared/catalog';
import { parseFeedback, coachingPrompt, analyze, ApiError, type AIConfig } from '../server/coach';
const valid = { schemaVersion: '1', subjectCategory: 'leaves', status: 'coach', feature: 'edge', referenceEvidence: 'The edge has small teeth.', sketchEvidence: 'The drawing edge is hard to distinguish.', invitation: 'Look closely at one section of the edge.', uncertainty: 'Faint marks may not be visible.' };
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
test('rejects confident coaching without evidence from both images', () => {
  assert.throws(() => parseFeedback(JSON.stringify({ ...valid, sketchEvidence: '' }), 'leaves'));
});
test('rejects feature and category mismatches', () => {
  assert.throws(() => parseFeedback(JSON.stringify({ ...valid, subjectCategory: 'rocks', feature: 'veins' }), 'rocks'));
  assert.throws(() => parseFeedback(JSON.stringify(valid), 'flowers'));
});
test('accepts uncertainty without fabricating evidence', () => {
  const result = parseFeedback(JSON.stringify({ ...valid, status: 'uncertain', feature: 'none', referenceEvidence: '', sketchEvidence: '' }), 'leaves');
  assert.equal(result.status, 'uncertain');
});
test('subject policies differ and preserve A/B roles', () => {
  for (const category of categories) {
    const prompt = coachingPrompt(category.id, 'texture');
    assert.ok(prompt.includes(`(${category.id})`));
    assert.ok(prompt.includes('first image is A'));
    assert.ok(prompt.includes(category.features.join(', ')));
  }
  assert.notEqual(coachingPrompt('scenes', 'shapes'), coachingPrompt('leaves', 'shapes'));
});
test('Ollama receives two images in order and returns live metadata', async () => {
  let request: Record<string, any> | undefined;
  globalThis.fetch = (async (_url: unknown, options: RequestInit) => { request = JSON.parse(String(options.body)); return new Response(JSON.stringify({ message: { content: JSON.stringify(valid) } })); }) as typeof fetch;
  const config: AIConfig = { provider: 'ollama', model: 'test-vision', baseUrl: 'http://localhost:11434', apiKey: '', timeoutMs: 1000, supportsThinking: true };
  const output = await analyze(config, 'leaves', 'observation', [Buffer.from('subject'), Buffer.from('sketch')], new AbortController().signal);
  assert.deepEqual(request?.messages[0].images, [Buffer.from('subject').toString('base64'), Buffer.from('sketch').toString('base64')]);
  assert.equal(request?.think, false, 'Short feedback should not spend its entire output budget on hidden reasoning');
  assert.equal(output.meta.source, 'live_ai');
  assert.equal(output.meta.model, 'test-vision');
});
test('hosted adapter sends two image parts and protects invalid output', async () => {
  globalThis.fetch = (async (_url: unknown, options: RequestInit) => {
    const body = JSON.parse(String(options.body));
    assert.equal(body.messages[0].content.filter((p: any) => p.type === 'image_url').length, 2);
    return new Response(JSON.stringify({ choices: [{ message: { content: 'not json' } }] }));
  }) as typeof fetch;
  await assert.rejects(analyze({ provider: 'hosted', model: 'test-open-vision', baseUrl: 'https://example.invalid/v1', apiKey: 'test', timeoutMs: 1000 }, 'leaves', 'observation', [Buffer.from('a'), Buffer.from('b')], new AbortController().signal), (error: unknown) => error instanceof ApiError && error.code === 'INVALID_OUTPUT');
});
test('upstream failure is recoverable and never replaced with sample feedback', async () => {
  globalThis.fetch = (async () => new Response('busy', { status: 429 })) as typeof fetch;
  await assert.rejects(analyze({ provider: 'ollama', model: 'test-vision', baseUrl: 'http://localhost:11434', apiKey: '', timeoutMs: 1000 }, 'leaves', 'observation', [Buffer.from('a'), Buffer.from('b')], new AbortController().signal), (error: unknown) => error instanceof ApiError && error.status === 429);
});
test('malformed upstream HTTP bodies become a recoverable typed error', async () => {
  globalThis.fetch = (async () => new Response('upstream HTML error page')) as typeof fetch;
  await assert.rejects(analyze({ provider: 'hosted', model: 'test', baseUrl: 'https://example.invalid/v1', apiKey: 'test', timeoutMs: 1000 }, 'leaves', 'observation', [Buffer.from('a'), Buffer.from('b')], new AbortController().signal), (error: unknown) => error instanceof ApiError && error.code === 'INVALID_OUTPUT');
});
