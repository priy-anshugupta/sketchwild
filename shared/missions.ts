import type { CategoryId } from './catalog';
import type { Session } from './types';
export type Place = 'anywhere' | 'courtyard' | 'garden' | 'park';
export type Mission = { id: string; category: CategoryId; title: string; skill: string; minutes: number; instruction: string; places: Place[]; intent: Session['intent'] };
export const missions: Mission[] = [
  { id: 'shape-finder', category: 'leaves', title: 'Find a shape you walk past', skill: '01 · Shapes', minutes: 5, instruction: 'Go outside and find an accessible leaf. Draw its outline on paper. Look again and add a small sketch of its tip or edge. Leave the leaf where it grows.', places: ['courtyard', 'garden', 'park'], intent: 'shapes' },
  { id: 'petal-overlap', category: 'flowers', title: 'Follow an overlapping petal', skill: '02 · Overlap', minutes: 10, instruction: 'Find a flower outside. Sketch it from one viewpoint. Look for two visible petals that overlap and make a close-up drawing of that boundary.', places: ['courtyard', 'garden', 'park'], intent: 'observation' },
  { id: 'bark-pattern', category: 'bark', title: 'Meet a tiny bark landscape', skill: '03 · Texture', minutes: 10, instruction: 'Find an accessible tree trunk outside. Choose a small patch of bark and draw three cracks or ridges. Look again and add one change in their direction or spacing.', places: ['garden', 'park'], intent: 'texture' },
  { id: 'rock-light', category: 'rocks', title: 'Catch a shadow on a rock', skill: '04 · Light', minutes: 10, instruction: 'Find a rock outside that you can observe without moving. Draw its contour and one light or dark surface. Look again and record where two visible surfaces meet.', places: ['courtyard', 'garden', 'park'], intent: 'shapes' },
  { id: 'branch-window', category: 'trees', title: 'Draw the space between branches', skill: '05 · Empty space', minutes: 15, instruction: 'Choose a tree from a comfortable spot outside. Draw its trunk and canopy as large shapes. Look again and sketch one gap between visible branches.', places: ['garden', 'park'], intent: 'observation' },
  { id: 'small-scene', category: 'scenes', title: 'Frame your own little outside', skill: '06 · Depth', minutes: 20, instruction: 'Choose a small view of a courtyard, garden, or park. Draw three large shapes. Look again and add one boundary where something nearby overlaps something farther away.', places: ['courtyard', 'garden', 'park'], intent: 'shapes' },
];
export function missionById(id?: string) { return missions.find(m => m.id === id); }
export function eligibleSessions(sessions: Session[]) {
  const unique = new Map(sessions.map(s => [s.id, s]));
  return [...unique.values()].filter(s => s.status === 'completed' && s.outdoorConfirmed === true && !!s.subject && !!s.sketch);
}
export function passportProgress(sessions: Session[]) {
  const eligible = eligibleSessions(sessions);
  const missionIds = new Set(eligible.map(s => s.missionId).filter(id => missionById(id)));
  const subjects = new Set(eligible.map(s => s.category));
  const secondLooks = eligible.filter(s => !!s.second || s.reflection.trim().length > 0).length;
  return { eligible, missionIds, subjects, secondLooks, stamps: [
    { id: 'first', title: 'First field sketch', description: 'Save one outdoor sketch with both photos.', earned: eligible.length >= 1 },
    { id: 'curious', title: 'Curious explorer', description: 'Sketch three different subject categories outside.', earned: subjects.size >= 3 },
    { id: 'second', title: 'Second-look collector', description: 'Record a second drawing or discovery in five outdoor sessions.', earned: secondLooks >= 5 },
    { id: 'series', title: 'Six ways of seeing', description: 'Complete all six missions in the guided series.', earned: missionIds.size === missions.length },
  ] };
}
export function nextMission(sessions: Session[]) {
  const { missionIds } = passportProgress(sessions);
  return missions.find(m => !missionIds.has(m.id)) || missions[0];
}
