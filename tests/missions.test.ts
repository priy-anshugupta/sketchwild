import test from 'node:test';
import assert from 'node:assert/strict';
import { missions, passportProgress, nextMission } from '../shared/missions';
import type { Session } from '../shared/types';
function entry(id: string, missionId = missions[0].id): Session { const m = missions.find(m => m.id === missionId)!; return { id, createdAt: '', updatedAt: '', category: m.category, minutes: m.minutes, intent: m.intent, missionId, stage: 'reflect', status: 'completed', reflection: 'I noticed a detail.', title: '', outdoorConfirmed: true, subject: new Blob(['subject']), sketch: new Blob(['sketch']) }; }
test('drafts, unconfirmed entries, and missing-photo entries do not earn stamps', () => {
  const valid = entry('one');
  for (const patch of [{status:'draft'}, {outdoorConfirmed:false}, {subject:undefined}, {sketch:undefined}]) assert.equal(passportProgress([{...valid,...patch} as Session]).eligible.length, 0);
});
test('duplicate session ids and repeated missions cannot duplicate mission stamps', () => {
  const first = entry('one'); const repeated = entry('two');
  const p = passportProgress([first, first, repeated]); assert.equal(p.eligible.length, 2); assert.equal(p.missionIds.size, 1);
  assert.equal(p.stamps.find(s => s.id === 'series')?.earned, false);
});
test('all six mission categories earn the series and explorer milestones', () => {
  const entries = missions.map((m,i) => entry(String(i),m.id)); const p = passportProgress(entries);
  assert.equal(p.missionIds.size, 6); assert.equal(p.subjects.size, 6); assert.ok(p.stamps.every(s => s.earned));
  assert.equal(passportProgress(entries.slice(0,1)).stamps.find(s => s.id === 'series')?.earned, false);
});
test('next mission advances past completed missions without art grading', () => { assert.equal(nextMission([entry('one')]).id, missions[1].id); });
test('a second-look milestone requires an observation or second drawing', () => {
  const entries = Array.from({length:5},(_,i)=>({...entry(String(i)),reflection:''}));
  assert.equal(passportProgress(entries).secondLooks,0);
  assert.equal(passportProgress(entries.map(s=>({...s,second:new Blob(['detail'])}))).stamps.find(s=>s.id==='second')?.earned,true);
});
