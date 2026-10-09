import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { categoryIds, intents } from '../shared/catalog';
const manifestSchema = z.array(z.object({
  id: z.string().min(1), category: z.enum(categoryIds), intent: z.enum(intents).default('observation'),
  subject: z.string().min(1), sketch: z.string().min(1),
  caseType: z.enum(['clear', 'unclear', 'unrelated']).default('clear'), expectedVisibleDetails: z.string().default(''),
})).min(1).max(6);
const manifestArg = process.argv[2];
if (!manifestArg) { console.error('Usage: npm run evaluate -- path/to/pairs.json (at most six pairs per batch)'); process.exit(1); }
const manifestPath = path.resolve(manifestArg);
const pairs = manifestSchema.parse(JSON.parse(await readFile(manifestPath, 'utf8')));
const baseUrl = (process.env.EVAL_BASE_URL || 'http://127.0.0.1:3001').replace(/\/$/, '');
const records: unknown[] = [];
await mkdir('artifacts', { recursive: true });
const outputPath = path.resolve('artifacts', `evaluation-${Date.now()}.json`);
for (const pair of pairs) {
  const started = Date.now();
  const data = new FormData();
  function mime(filename: string) { return filename.toLowerCase().endsWith('.png') ? 'image/png' : filename.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/jpeg'; }
  try {
    for (const field of ['subject', 'sketch'] as const) {
      const filename = path.resolve(path.dirname(manifestPath), pair[field]);
      data.append(field, new Blob([await readFile(filename)], { type: mime(filename) }), path.basename(filename));
    }
    data.append('category', pair.category); data.append('intent', pair.intent);
    const response = await fetch(`${baseUrl}/api/coach`, { method: 'POST', body: data, signal: AbortSignal.timeout(310000) });
    const result = await response.json();
    records.push({ ...pair, httpStatus: response.status, elapsedMs: Date.now() - started, result, review: { referenceSupported: null, sketchSupported: null, actionUseful: null, respectful: null, abstentionAppropriate: null, notes: '' } });
    console.log(`${pair.id}: HTTP ${response.status}, ${((Date.now() - started) / 1000).toFixed(1)} seconds`);
    if (response.status === 429) { console.log('Stopped at the request limit. Run the remaining pairs after the window resets.'); break; }
  } catch (error) { records.push({ ...pair, elapsedMs: Date.now() - started, error: error instanceof Error ? error.message : String(error) }); console.log(`${pair.id}: request failed`); }
  await writeFile(outputPath, JSON.stringify({ recordedAt: new Date().toISOString(), baseUrl, records }, null, 2));
}
await writeFile(outputPath, JSON.stringify({ recordedAt: new Date().toISOString(), baseUrl, records }, null, 2));
console.log(`Results saved to ${outputPath}. A person must review visual correctness; HTTP success is not an accuracy score.`);
