import { useState } from 'react';
import { Award, Check, Clock, Compass, MapPin, Pencil, BookOpen, Eye, LockKeyhole } from 'lucide-react';
import { missions, nextMission, passportProgress, type Mission, type Place } from '../shared/missions';
import { categoryById } from '../shared/catalog';
import type { Session } from '../shared/types';
export function Challenges({ sessions, onStart, onPassport }: { sessions: Session[]; onStart: (mission: Mission) => void; onPassport: () => void }) {
  const [place, setPlace] = useState<Place>('anywhere');
  const [time, setTime] = useState(20);
  const progress = passportProgress(sessions);
  const recommended = nextMission(sessions);
  const shown = missions.filter(m => m.minutes <= time && (place === 'anywhere' || m.places.includes(place)));
  return <section className="challenge-board">
    <div className="section-heading"><div><span className="eyebrow">THE OUTDOOR DRAWING SERIES</span><h2>Six ways to see more.</h2><p>Take a mission outside. Complete them in any order, at your own pace.</p></div><button className="button secondary" onClick={onPassport}><Award size={18} />My field passport</button></div>
    <div className="series-summary"><div><Compass size={24} /><span><strong>{progress.missionIds.size} of 6 missions completed</strong><small>Next in the series: {recommended.title}</small></span></div><div className="series-track" role="progressbar" aria-label="Drawing series completion" aria-valuemin={0} aria-valuemax={6} aria-valuenow={progress.missionIds.size}>{missions.map(m => <span className={progress.missionIds.has(m.id) ? 'filled' : ''} key={m.id} />)}</div></div>
    <div className="mission-filters"><label><MapPin size={17} />Where can you go?<select value={place} onChange={e => setPlace(e.target.value as Place)}><option value="anywhere">Any outdoor spot</option><option value="courtyard">Courtyard or balcony garden</option><option value="garden">Garden</option><option value="park">Park</option></select></label><label><Clock size={17} />Time available<select value={time} onChange={e => setTime(Number(e.target.value))}>{[5,10,15,20].map(t => <option key={t} value={t}>Up to {t} minutes</option>)}</select></label><p>Choose an accessible subject nearby. You can swap missions if it isn’t there.</p></div>
    <div className="mission-grid">{shown.map(m => { const done = progress.missionIds.has(m.id); const category = categoryById(m.category); return <article className={`mission-card ${category.tone}`} key={m.id}><div className="mission-top"><span className="eyebrow">{m.skill}</span><span className="mission-duration"><Clock size={14} />{m.minutes} min</span></div><h3>{m.title}</h3><p>{m.instruction}</p><div className="mission-footer"><span>{category.name}</span><button className={`button ${done ? 'secondary' : 'primary'}`} onClick={() => onStart(m)}>{done ? <Check size={16} /> : <Pencil size={16} />}{done ? 'Try again' : 'Take this mission'}</button></div>{done && <div className="mission-earned"><Check size={14} />Mission stamp earned</div>}</article>; })}</div>
    {!shown.length && <div className="empty-state"><h3>No missions fit these choices.</h3><p>Choose another spot or allow a little more time.</p></div>}
    <p className="mission-disclosure">These are designed exercises. AI reviews your subject and drawing after you return; it doesn’t verify your location.</p>
  </section>;
}
export function Passport({ sessions, onMissions }: { sessions: Session[]; onMissions: () => void }) {
  const p = passportProgress(sessions);
  return <><div className="page-heading heading-row"><div><div className="eyebrow">COLLECT EXPERIENCES, NOT ART SCORES</div><h1>Your field passport.</h1><p>Small milestones for going outside and looking again.</p></div><button className="button primary" onClick={onMissions}><Compass size={18} />Choose a mission</button></div>
    <div className="passport-banner"><Award size={46} strokeWidth={1.4} /><div><h2>Every closer look counts.</h2><p>Stamps reward participation and curiosity. Your drawing never gets a grade.</p></div></div>
    <div className="passport-stats"><div><BookOpen /><strong>{p.eligible.length}</strong><span>Outdoor sketches</span></div><div><Compass /><strong>{p.subjects.size} / 6</strong><span>Subjects explored</span></div><div><Eye /><strong>{p.secondLooks}</strong><span>Second looks recorded</span></div></div>
    <div className="stamp-grid">{p.stamps.map(stamp => <article className={`stamp-card ${stamp.earned ? 'earned' : ''}`} key={stamp.id}><div className="stamp-symbol">{stamp.earned ? <Award size={35} /> : <LockKeyhole size={28} />}</div><span className="stamp-status">{stamp.earned ? 'EARNED' : 'TO DISCOVER'}</span><h3>{stamp.title}</h3><p>{stamp.description}</p></article>)}</div>
    <section className="passport-series"><h2>Your mission stamps</h2><div>{missions.map(m => <span className={p.missionIds.has(m.id) ? 'earned' : ''} key={m.id}>{p.missionIds.has(m.id) ? <Check size={16} /> : <Pencil size={16} />}{categoryById(m.category).name}</span>)}</div></section>
    <p className="storage-note">Outdoor completion is self-reported. A saved session needs a subject photo and sketch photo to count. Each mission earns its stamp once; repeat sketches can still count toward participation milestones. Deleting entries recalculates your passport.</p>
  </>;
}
