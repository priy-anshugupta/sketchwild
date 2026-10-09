import { openDB } from 'idb';
import { zipSync, strToU8 } from 'fflate';
import type { Session } from '../shared/types';
const db = () => openDB('sketchwild-journal', 1, { upgrade(database) { database.createObjectStore('sessions', { keyPath: 'id' }); } });
export async function allSessions(): Promise<Session[]> { const database = await db(); return (await database.getAll('sessions')).sort((a: Session, b: Session) => b.updatedAt.localeCompare(a.updatedAt)); }
export async function putSession(session: Session) { const database = await db(); await database.put('sessions', session); }
export async function deleteSession(id: string) { const database = await db(); await database.delete('sessions', id); }
export async function clearSessions() { const database = await db(); await database.clear('sessions'); }
export function download(blob: Blob, name: string) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000); }
export async function exportSessions(sessions: Session[]) {
  const files: Record<string, Uint8Array> = {};
  const manifest = [];
  for (const s of sessions) {
    const { subject, sketch, second, ...metadata } = s;
    const photos: Record<string, string> = {};
    for (const [name, blob] of Object.entries({ subject, sketch, second })) if (blob) {
      const filename = `${s.id}/${name}.${blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg'}`;
      photos[name] = filename; files[filename] = new Uint8Array(await blob.arrayBuffer());
    }
    manifest.push({ ...metadata, photos });
  }
  files['journal.json'] = strToU8(JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), sessions: manifest }, null, 2));
  const bytes = zipSync(files);
  download(new Blob([bytes as BlobPart], { type: 'application/zip' }), `sketchwild-${new Date().toISOString().slice(0, 10)}.zip`);
}
