import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { Leaf, Flower2, Trees, Mountain, ScanLine, Image as ImageIcon, Compass, BookOpen, Settings, Plus, Check, X, Clock, Pencil, Camera, RotateCw, Download, Trash2, ChevronRight, Menu, Sparkles, Eye, CircleHelp, LoaderCircle, RefreshCw, ShieldCheck, Sun, Award, Printer } from 'lucide-react';
import { categories, categoryById, type CategoryId } from '../shared/catalog';
import type { Analysis, Capabilities, Session } from '../shared/types';
import { allSessions, clearSessions, deleteSession, exportSessions, putSession } from './storage';
import { Challenges, Passport } from './Challenges';
import { PreviewNotice } from './PreviewNotice';
import { missionById, passportProgress, type Mission } from '../shared/missions';

const icons = { leaf: Leaf, flower: Flower2, tree: Trees, texture: ScanLine, rock: Mountain, scene: ImageIcon };
const date = (value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
function usePhoto(blob?: Blob) {
  const [url, setUrl] = useState('');
  useEffect(() => { if (!blob) { setUrl(''); return; } const next = URL.createObjectURL(blob); setUrl(next); return () => URL.revokeObjectURL(next); }, [blob]);
  return url;
}
function Photo({ blob, alt, className = '' }: { blob?: Blob; alt: string; className?: string }) {
  const url = usePhoto(blob);
  return url ? <img src={url} alt={alt} className={className} /> : <div className={`photo-placeholder ${className}`}><Pencil size={28} /><span>No picture yet</span></div>;
}
async function imageBlob(file: Blob, rotation = 0): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale), h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas'); canvas.width = rotation % 180 ? h : w; canvas.height = rotation % 180 ? w : h;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.translate(canvas.width / 2, canvas.height / 2); context.rotate(rotation * Math.PI / 180); context.drawImage(bitmap, -w / 2, -h / 2, w, h); bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('The photo could not be saved.')), 'image/jpeg', .9));
}
function Uploader({ label, hint, value, onChange, onError }: { label: string; hint: string; value?: Blob; onChange: (blob: Blob) => void; onError: (text: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [working, setWorking] = useState(false);
  async function select(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return onError('Please choose a JPEG, PNG, or WebP picture. Convert HEIC photos first.');
    if (file.size > 8 * 1024 * 1024) return onError('This picture is over 8 MB. Please choose a smaller photo.');
    setWorking(true);
    try { onChange(await imageBlob(file)); } catch { onError('This photo could not be read. Try another image.'); } finally { setWorking(false); }
  }
  async function rotate() { if (!value) return; setWorking(true); try { onChange(await imageBlob(value, 90)); } catch { onError('Could not rotate the photo.'); } finally { setWorking(false); } }
  return <div className="upload-block"><div className="upload-label"><strong>{label}</strong><span>{hint}</span></div>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={select} aria-label={`Upload ${label.toLowerCase()}`} hidden />
    {value ? <><div className="uploaded-photo"><Photo blob={value} alt={label} /></div><div className="photo-actions"><button className="text-button" onClick={() => input.current?.click()} disabled={working}><RefreshCw size={15} />Replace</button><button className="text-button" onClick={rotate} disabled={working}><RotateCw size={15} />Rotate</button></div></> : <button className="upload-zone" onClick={() => input.current?.click()} disabled={working}><span className="upload-icon"><Camera size={26} /></span><strong>Add a photo</strong><span>Take a picture or choose a file</span><small>JPG, PNG, WebP · up to 8 MB</small></button>}
    {working && <span className="small muted" role="status">Preparing picture…</span>}
  </div>;
}
function Modal({ title, children, close }: { title: string; children: React.ReactNode; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} aria-labelledby={titleId} onCancel={close} onClick={e => { if (e.target === e.currentTarget) close(); }}><div className="dialog-head"><h2 id={titleId}>{title}</h2><button className="icon-button" onClick={close} aria-label="Close dialog"><X /></button></div>{children}</dialog>;
}
function FeedbackCard({ feedback }: { feedback: Analysis }) {
  const coaching = feedback.status === 'coach';
  return <div className="feedback-card"><div className="eyebrow"><Eye size={17} />{coaching ? 'YOUR SECOND LOOK' : 'LET’S TAKE ANOTHER LOOK'}</div>
    <h2>{coaching ? 'A little detail worth noticing.' : feedback.status.startsWith('retake') ? 'A clearer photo would help.' : 'This pair is hard to compare.'}</h2>
    {feedback.referenceEvidence && <div className="evidence"><span>In the subject</span><p>{feedback.referenceEvidence}</p></div>}
    {feedback.sketchEvidence && <div className="evidence"><span>In your sketch</span><p>{feedback.sketchEvidence}</p></div>}
    <div className="invitation"><Pencil size={20} /><p>{feedback.invitation}</p></div>
    {feedback.uncertainty && <p className="uncertainty"><CircleHelp size={15} />{feedback.uncertainty}</p>}
    <div className="feedback-meta">{feedback.meta.source === 'example' ? 'Authored example · not a live AI response' : `${feedback.meta.model} · ${(feedback.meta.elapsedMs / 1000).toFixed(1)}s · experimental feedback`}</div>
  </div>;
}

export default function App() {
  const [view, setView] = useState<'explore' | 'missions' | 'passport' | 'journal' | 'session' | 'detail' | 'example'>('explore');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [current, setCurrent] = useState<Session>();
  const [caps, setCaps] = useState<Capabilities>();
  const [settings, setSettings] = useState(false);
  const [help, setHelp] = useState(false);
  const [newSketch, setNewSketch] = useState(false);
  const [menu, setMenu] = useState(false);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 850px)').matches);
  const [filter, setFilter] = useState<CategoryId | 'all'>('all');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirm, setConfirm] = useState<'all' | Session>();
  const [analyzing, setAnalyzing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const abortRef = useRef<AbortController | undefined>(undefined);
  const writeQueue = useRef(Promise.resolve());
  const currentRef = useRef(current); currentRef.current = current;
  const sessionsRef = useRef(sessions); sessionsRef.current = sessions;
  const navItems = [
    { view: 'explore' as const, label: 'Explore & sketch', short: 'Sketch', icon: Compass },
    { view: 'missions' as const, label: 'Outdoor missions', short: 'Missions', icon: Pencil },
    { view: 'passport' as const, label: 'Field passport', short: 'Passport', icon: Award },
    { view: 'journal' as const, label: 'My journal', short: 'Journal', icon: BookOpen },
  ];
  useEffect(() => {
    const media = window.matchMedia('(max-width: 850px)');
    const change = () => setCompact(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menu]);

  async function refreshCapabilities() { try { const response = await fetch('/api/capabilities'); if (!response.ok) throw new Error(); setCaps(await response.json()); } catch { setCaps({ provider: 'disabled', configured: false, model: '', timeoutMs: 120000, readiness: 'experimental', notice: 'Live feedback is unavailable. Your journal still works.', reason: 'The app server could not be reached.' }); } }
  useEffect(() => {
    refreshCapabilities();
    allSessions().then(values => {
      setSessions(values);
      const hash = location.hash.slice(1);
      if (hash === 'journal' || hash === 'missions' || hash === 'passport' || hash === 'example') setView(hash);
      else if (hash.startsWith('session/')) { const saved = values.find(s => s.id === hash.slice(8)); if (saved) { setCurrent(saved); setView(saved.status === 'completed' ? 'detail' : 'session'); } }
    }).catch(() => setError('Your browser could not open the journal. You can sketch, but export your work before leaving.')).finally(() => setLoaded(true));
    return () => abortRef.current?.abort();
  }, []);
  useEffect(() => {
    if (!current || !loaded || view === 'detail') return;
    const saving = current;
    writeQueue.current = writeQueue.current.then(async () => { await putSession(saving); setSessions(await allSessions()); }).catch(() => setError('This draft could not be saved in your browser. Export it before closing the page.'));
  }, [current, loaded, view]);
  useEffect(() => { if (!analyzing) return; setSeconds(0); const timer = setInterval(() => setSeconds(v => v + 1), 1000); return () => clearInterval(timer); }, [analyzing]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 5000); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    if (!loaded) return;
    function routeFromHash() {
      abortRef.current?.abort();
      setAnalyzing(false);
      const hash = location.hash.slice(1);
      if (hash.startsWith('session/')) {
        const id = hash.slice(8);
        const session = currentRef.current?.id === id ? currentRef.current : sessionsRef.current.find(s => s.id === id);
        if (session) { setCurrent(session); setView(session.status === 'completed' ? 'detail' : 'session'); }
      } else setView(hash === 'journal' || hash === 'missions' || hash === 'passport' || hash === 'example' ? hash : 'explore');
      setMenu(false);
    }
    window.addEventListener('hashchange', routeFromHash);
    return () => window.removeEventListener('hashchange', routeFromHash);
  }, [loaded]);
  function go(next: typeof view) { if (analyzing) { abortRef.current?.abort(); setAnalyzing(false); } setView(next); setMenu(false); setError(''); location.hash = (next === 'session' || next === 'detail') && current ? `session/${current.id}` : next === 'explore' ? '' : next; window.scrollTo({ top: 0, behavior: 'instant' }); }
  function start(category: CategoryId, parentId?: string, mission?: Mission) {
    const now = new Date().toISOString();
    const session: Session = { id: crypto.randomUUID(), parentId, category, missionId: mission?.id, createdAt: now, updatedAt: now, minutes: mission?.minutes || 10, intent: mission?.intent || 'observation', stage: 'draw', status: 'draft', reflection: '', title: mission?.title || '' };
    currentRef.current = session; setCurrent(session); setView('session'); setError(''); setMenu(false); location.hash = `session/${session.id}`; window.scrollTo(0, 0);
  }
  function update(patch: Partial<Session>) { setCurrent(previous => previous ? { ...previous, ...patch, updatedAt: new Date().toISOString() } : previous); }
  function open(session: Session) { currentRef.current = session; setCurrent(session); setView(session.status === 'completed' ? 'detail' : 'session'); setError(''); location.hash = `session/${session.id}`; window.scrollTo(0, 0); }
  async function getFeedback() {
    if (!caps?.configured) return;
    if (!current?.subject || !current.sketch) return;
    setError(''); setAnalyzing(true);
    const id = current.id; const controller = new AbortController(); abortRef.current = controller;
    const timer = setTimeout(() => controller.abort('timeout'), (caps?.timeoutMs || 120000) + 5000);
    const data = new FormData(); data.append('subject', current.subject, 'subject.jpg'); data.append('sketch', current.sketch, 'sketch.jpg'); data.append('category', current.category); data.append('intent', current.intent);
    try {
      const response = await fetch('/api/coach', { method: 'POST', body: data, signal: controller.signal }); const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not review this pair.');
      if (!controller.signal.aborted && currentRef.current?.id === id) update({ feedback: payload, stage: 'feedback' });
    } catch (failure) { if (abortRef.current === controller) { if (controller.signal.aborted) { if (controller.signal.reason === 'timeout') setError('The model took too long. Your pictures are saved; you can retry.'); } else setError(failure instanceof Error ? failure.message : 'Could not connect. Please try again.'); } }
    finally { clearTimeout(timer); if (abortRef.current === controller) { abortRef.current = undefined; setAnalyzing(false); } }
  }
  async function finish() {
    if (!current) return;
    const saved = { ...current, status: 'completed' as const, updatedAt: new Date().toISOString() };
    try { await writeQueue.current; const before = passportProgress(sessions); await putSession(saved); setCurrent(saved); const latest = await allSessions(); setSessions(latest); setView('detail'); const after = passportProgress(latest); const newStamp = after.stamps.find(s => s.earned && !before.stamps.find(b => b.id === s.id)?.earned); setNotice(newStamp ? `Sketch saved. Stamp earned: ${newStamp.title}!` : 'Your sketch is saved in this browser.'); } catch { setError('Could not save this session. Export it to keep a copy.'); }
  }
  async function remove() {
    if (!confirm) return;
    try { await writeQueue.current; if (confirm === 'all') { await clearSessions(); setCurrent(undefined); } else { await deleteSession(confirm.id); if (current?.id === confirm.id) setCurrent(undefined); } setSessions(await allSessions()); setConfirm(undefined); setView('journal'); location.hash = 'journal'; setNotice('Journal updated.'); } catch { setError('Could not delete this entry.'); }
  }
  async function exportWork(values: Session[]) { try { await exportSessions(values); } catch { setError('Could not export the journal. Please try again.'); } }
  const completed = sessions.filter(s => s.status === 'completed');
  const drafts = sessions.filter(s => s.status === 'draft');
  const subject = current ? categoryById(current.category) : undefined;
  const CurrentIcon = subject ? icons[subject.icon] : Leaf;
  const mission = missionById(current?.missionId);
  const example: Analysis = { schemaVersion: '1', subjectCategory: 'leaves', status: 'coach', feature: 'edge', referenceEvidence: 'Imagine a leaf with a gently toothed edge.', sketchEvidence: 'Imagine that your first drawing records only its smooth outline.', invitation: 'Look at a short section of the real edge. Draw three of its small teeth beside your first sketch.', uncertainty: 'This is an authored demonstration, not an analysis of a real pair of pictures.', meta: { source: 'example', model: 'Authored example', promptVersion: 'example', elapsedMs: 0, createdAt: '', requestId: 'example' } };

  return <div className="app-shell">
    <aside id="main-sidebar" className={`sidebar ${menu ? 'is-open' : ''}`} inert={compact && !menu}>
      <button className="brand" onClick={() => go('explore')} aria-label="SketchWild home"><span className="brand-mark"><Leaf size={25} strokeWidth={1.8} /></span><span>Sketch<span className="brand-wild">Wild</span><small>AN OUTDOOR SKETCHBOOK</small></span></button>
      <div className="nav-caption">YOUR SPACE</div>
      <nav aria-label="Main navigation"><button className={view === 'explore' ? 'active' : ''} onClick={() => go('explore')}><Compass size={20} />Explore & sketch</button><button className={view === 'missions' ? 'active' : ''} onClick={() => go('missions')}><Pencil size={20} />Outdoor missions</button><button className={view === 'passport' ? 'active' : ''} onClick={() => go('passport')}><Award size={20} />Field passport</button><button className={view === 'journal' || view === 'detail' ? 'active' : ''} onClick={() => go('journal')}><BookOpen size={20} />My journal<span className="nav-count">{completed.length}</span></button></nav>
      <div className="sidebar-card"><span className="tiny-icon"><Sun size={20} /></span><h3>A little outside time.</h3><p>Paper, a pencil, and something worth a second look.</p><button className="text-button" onClick={() => setHelp(true)}>How it works <ChevronRight size={15} /></button></div>
      <div className="sidebar-bottom"><button onClick={() => setSettings(true)}><Settings size={19} />Preferences & privacy</button><div className="local-label"><ShieldCheck size={15} />Your journal stays on your device</div></div>
    </aside>
    {menu && <button className="mobile-shade" aria-label="Close navigation" onClick={() => setMenu(false)} />}
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-toggle" aria-label="Open navigation" aria-expanded={menu} aria-controls="main-sidebar" onClick={() => setMenu(v => !v)}><Menu size={22} /></button><span>{view === 'journal' || view === 'detail' ? 'My journal' : view === 'missions' ? 'Outdoor missions' : view === 'passport' ? 'Field passport' : view === 'session' ? 'Sketch session' : view === 'example' ? 'A second-look example' : 'Explore & sketch'}</span></div><div className="top-actions"><span className="small muted desktop-only">Make the screen the shortest part.</span><button className="icon-button" aria-label="How SketchWild works" onClick={() => setHelp(true)}><CircleHelp size={20} /></button><button type="button" className="profile-mark" aria-label="Start a new sketch" title="Start a new sketch" aria-haspopup="dialog" disabled={!loaded} onClick={() => setNewSketch(true)}><Pencil size={18} /></button></div></header>
      <nav className="mobile-tabs" aria-label="Quick navigation">{navItems.map(item => { const active = view === item.view || (item.view === 'journal' && view === 'detail'); const Icon = item.icon; return <button key={item.view} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} onClick={() => go(item.view)}><Icon size={19} /><span>{item.short}</span></button>; })}</nav>
      <main>
        {error && <div className="alert" role="alert"><CircleHelp size={19} /><span>{error}</span><button className="icon-button" aria-label="Dismiss error" onClick={() => setError('')}><X size={17} /></button></div>}
        {!loaded ? <div className="loading-page"><LoaderCircle className="spin" />Opening your sketchbook…</div> : <>
        {caps?.provider === 'disabled' && <PreviewNotice onExample={() => go('example')} videoUrl={caps.demoVideoUrl} />}
        {view === 'missions' && <><div className="page-heading"><div className="eyebrow">A REASON TO STEP OUTSIDE</div><h1>Your next outdoor mission.</h1><p>Pick a place and a little time. Take paper and a pencil, then come back with your sketch.</p></div><Challenges sessions={sessions} onStart={m => start(m.category, undefined, m)} onPassport={() => go('passport')} /></>}
        {view === 'passport' && <Passport sessions={sessions} onMissions={() => go('missions')} />}
        {view === 'explore' && <>
          <div className="page-heading"><div className="eyebrow">A MOMENT TO NOTICE</div><h1>Look a little closer.</h1><p>Pick something outside. Draw it on paper. See what you notice next.</p></div>
          <div className="quick-path"><span><strong>1</strong>Choose a mission</span><span><strong>2</strong>Draw outside</span><span><strong>3</strong>Look again & save</span></div>
          <section className="hero-card"><div className="hero-copy"><span className="hero-kicker"><Pencil size={16} />FROM SCREEN TO SKETCHBOOK</span><h2>Your next sketch<br />is just outside.</h2><p>You don’t need to be an artist.<br />Just a little curiosity and a pencil.</p><button className="button light" onClick={() => go('missions')}><Compass size={18} />Choose an outdoor mission</button><button className="hero-example" onClick={() => go('example')}>See a feedback example</button></div><div className="hero-image" role="img" aria-label="Illustration of an outdoor sketchbook and nature study" /><div className="hero-note"><span>01 / OBSERVE</span><strong>Slow down.<br />There’s more to see.</strong></div></section>
          <div className="home-mission-link"><div><span className="eyebrow">A GUIDED SERIES · AT YOUR OWN PACE</span><h2>Collect six different ways of seeing.</h2><p>Short outdoor missions, a second look, and a stamp for each completed experience.</p></div><button className="button primary" onClick={() => go('missions')}><Compass size={18} />Browse missions</button></div>
          <div className="section-heading"><div><h2>Or choose your own subject.</h2><p>Start a free sketch with a short observation exercise.</p></div><span className="pill"><Clock size={14} />5–20 minute sessions</span></div>
          <div className="category-grid">{categories.map((category, index) => { const Icon = icons[category.icon]; return <button className={`category-card ${category.tone}`} key={category.id} onClick={() => start(category.id)}><div className="category-top"><span className="category-icon"><Icon size={28} strokeWidth={1.5} /></span><span className="category-number">0{index + 1}</span></div><h3>{category.name}</h3><p>{category.subtitle}</p><div className="category-bottom"><span>{category.focus}</span><span className="category-open"><Plus size={17} /></span></div></button>; })}</div>
          <div className="bottom-grid"><section className="recent-section"><div className="section-heading compact"><h2>{drafts.length ? 'Pick up where you left off' : 'Your sketchbook begins here'}</h2>{sessions.length > 0 && <button className="text-button" onClick={() => go('journal')}>View journal <ChevronRight size={16} /></button>}</div>{drafts.length ? <div className="draft-row">{drafts.slice(0, 2).map(s => <button className="draft-item" key={s.id} onClick={() => open(s)}><span className={`mini-icon ${categoryById(s.category).tone}`}><Pencil size={20} /></span><span><strong>{s.title || categoryById(s.category).name + ' study'}</strong><small>Draft · {date(s.updatedAt)}</small></span><ChevronRight size={18} /></button>)}</div> : <div className="journal-empty-mini"><BookOpen size={29} strokeWidth={1.4} /><p>Your drawings, second looks, and little discoveries will live here.</p></div>}</section><section className="practice-note"><span className="eyebrow">A FIELD NOTE</span><p>“Draw what you notice.<br />Then notice a little more.”</p><span>Try one detail, not a perfect picture.</span></section></div>
        </>}

        {view === 'journal' && <><div className="page-heading heading-row"><div><div className="eyebrow">YOUR LITTLE DISCOVERIES</div><h1>My sketch journal.</h1><p>A record of where your attention wandered.</p></div><button className="button primary" onClick={() => go('explore')}><Plus size={18} />New sketch</button></div><div className="journal-toolbar"><div className="filter-list" aria-label="Filter journal by subject"><button className={filter === 'all' ? 'selected' : ''} onClick={() => setFilter('all')}>All entries <span>{sessions.length}</span></button>{categories.map(c => <button key={c.id} className={filter === c.id ? 'selected' : ''} onClick={() => setFilter(c.id)}>{c.name}</button>)}</div><button className="text-button" disabled={!sessions.length} onClick={() => exportWork(sessions)}><Download size={16} />Export journal</button></div>
          {!sessions.filter(s => filter === 'all' || s.category === filter).length ? <div className="empty-state"><BookOpen size={42} strokeWidth={1.3} /><h2>{sessions.length ? 'No sketches in this subject yet.' : 'A blank page is a good beginning.'}</h2><p>Start a session outside. Your pictures and notes will be saved here, on this device.</p><button className="button primary" onClick={() => filter === 'all' ? go('explore') : start(filter)}><Plus size={18} />Start sketching</button></div> : <div className="journal-grid">{sessions.filter(s => filter === 'all' || s.category === filter).map(s => <article className="journal-card" key={s.id}><button className="journal-open" onClick={() => open(s)}><div className="journal-cover"><Photo blob={s.second || s.sketch || s.subject} alt={`${categoryById(s.category).name} journal entry`} /><span className="entry-status">{s.status === 'draft' ? 'In progress' : 'Saved sketch'}</span></div><div className="journal-card-copy"><div className="eyebrow">{categoryById(s.category).name} <span>{date(s.createdAt)}</span></div><h3>{s.title || categoryById(s.category).name + ' study'}</h3><p>{s.reflection || 'A little time to look closer.'}</p></div></button><div className="journal-card-footer"><button className="text-button" onClick={() => open(s)}>{s.status === 'draft' ? 'Continue sketch' : 'Open entry'}<ChevronRight size={15} /></button><button className="icon-button" aria-label={`Delete ${s.title || 'entry'}`} onClick={() => setConfirm(s)}><Trash2 size={16} /></button></div></article>)}</div>}
          <p className="storage-note"><ShieldCheck size={15} />Saved in this browser. Export a copy before clearing browser data or switching devices.</p>
        </>}

        {view === 'session' && current && subject && <>
          <div className="session-heading"><button className="text-button" onClick={() => go('explore')}>Explore</button><ChevronRight size={14} /><span>{subject.name}</span><span className="draft-label"><Check size={14} />Local draft</span></div>
          <div className="page-heading"><div className="eyebrow">{subject.name.toUpperCase()} STUDY</div><h1>{current.stage === 'draw' ? 'Make time for a closer look.' : current.stage === 'photos' ? 'Show us what you noticed.' : current.stage === 'feedback' ? 'One detail. A second look.' : 'Keep your little discovery.'}</h1><p>{current.stage === 'draw' ? 'Your paper sketchbook does the important part.' : current.stage === 'photos' ? 'Two pictures help the coach understand your subject and your sketch.' : current.stage === 'feedback' ? 'Read the card, then let the real world have your attention.' : 'An extra detail counts. You don’t need to redraw the whole page.'}</p></div>
          <ol className="stepper">{['Draw outside', 'Add photos', 'Look again', 'Reflect & save'].map((label, i) => { const selected = ['draw', 'photos', 'feedback', 'reflect'].indexOf(current.stage); return <li className={i === selected ? 'current' : i < selected ? 'done' : ''} key={label}><span>{i < selected ? <Check size={15} /> : i + 1}</span>{label}</li>; })}</ol>
          {current.stage === 'draw' && <div className="session-layout"><section className="task-card"><span className={`subject-badge ${subject.tone}`}><CurrentIcon size={28} /></span><span className="eyebrow">YOUR OBSERVATION EXERCISE</span><h2>{mission?.title || `${subject.name}, with fresh eyes.`}</h2><p className="task-text">{mission?.instruction || subject.task}</p><div className="task-focus"><Eye size={18} /><span>{subject.focus}</span></div><div className="task-controls"><fieldset><legend>Make a little time</legend><div className="segment">{[5, 10, 15, 20].map(m => <button className={current.minutes === m ? 'selected' : ''} key={m} onClick={() => update({ minutes: m })}>{m} min</button>)}</div></fieldset><label className="field-label">What would you like to explore?<select value={current.intent} onChange={e => update({ intent: e.target.value as Session['intent'] })}><option value="observation">Noticing details</option><option value="shapes">Shapes & proportions</option><option value="texture">Patterns & texture</option></select></label></div><button className="button primary" onClick={() => update({ stage: 'photos' })}><Camera size={18} />I’ve sketched. Add photos.</button><button className="text-button print-mission" onClick={() => window.print()}><Printer size={16} />Print this exercise</button><p className="small muted">Suggested time, not a timer. Leave the app and come back whenever you’re ready.</p></section><aside className="field-guide"><span className="eyebrow">TAKE WITH YOU</span><h3>Keep it simple.</h3><ul><li><Pencil size={19} /><span>Paper and a pencil</span></li><li><Sun size={19} /><span>A comfortable spot outside</span></li><li><Eye size={19} /><span>A little curiosity</span></li></ul><div className="guide-tip"><strong>A gentle reminder</strong><p>Observe where things are. Leave plants, rocks, and habitats undisturbed.</p></div><p>Look more than you draw. A rough sketch and a few words are enough.</p></aside></div>}
          {current.stage === 'photos' && <section className="photo-stage"><div className="upload-grid"><Uploader label="01 · The real subject" hint="Frame it clearly, from your drawing viewpoint." value={current.subject} onChange={blob => update({ subject: blob, feedback: undefined })} onError={setError} /><Uploader label="02 · Your paper sketch" hint="Use even light so pencil lines are visible." value={current.sketch} onChange={blob => update({ sketch: blob, feedback: undefined })} onError={setError} /></div><div className="processing-notice"><ShieldCheck size={18} /><p>{caps?.notice || 'Checking where your photos will be processed…'}</p></div><div className="stage-actions"><button className="button secondary" onClick={() => update({ stage: 'draw' })} disabled={analyzing}>Back to exercise</button>{analyzing ? <div className="analysis-wait" role="status"><LoaderCircle size={20} className="spin" /><span>Looking at your two pictures… {seconds}s</span><button className="text-button" onClick={() => { abortRef.current?.abort(); setAnalyzing(false); }}>Cancel</button></div> : <button className="button primary" disabled={!current.subject || !current.sketch || !caps?.configured} title={!caps?.configured ? "Live AI is unavailable. You can still save your sketch." : undefined} onClick={getFeedback}><Sparkles size={18} />Get one observation</button>}</div>{!caps?.configured && caps?.provider !== 'disabled' && <div className="setup-message"><CircleHelp size={17} /><span>Live photo feedback is unavailable right now. You can continue with the guided exercise and save your work.</span><button className="text-button" onClick={() => { refreshCapabilities(); setSettings(true); }}>Check connection</button></div>}<div className="skip-actions"><button className="text-button" onClick={() => update({ stage: 'reflect' })} disabled={analyzing}>Save without AI feedback</button></div></section>}
          {current.stage === 'feedback' && current.feedback && <div className="session-layout"><FeedbackCard feedback={current.feedback} /><aside className="field-guide"><span className="eyebrow">BACK TO THE REAL WORLD</span><h3>Put the phone away.</h3><p>Return to your subject. Try a small detail sketch or annotate your first drawing.</p>{current.feedback.status === 'coach' ? <button className="button primary" onClick={() => update({ stage: 'reflect' })}><Pencil size={18} />I’m ready to look again</button> : <button className="button primary" onClick={() => update({ stage: 'photos' })}><Camera size={18} />Review my photos</button>}<button className="text-button spaced" onClick={() => update({ stage: 'reflect' })}>Continue to reflection</button><fieldset className="rating"><legend>Was this useful?</legend><div>{(['helpful', 'unclear', 'inaccurate'] as const).map(r => <button className={current.rating === r ? 'selected' : ''} key={r} onClick={() => update({ rating: r })}>{r}</button>)}</div></fieldset><p className="small muted">Feedback can be wrong. Your observation matters more.</p></aside></div>}
          {current.stage === 'reflect' && <div className="session-layout"><section className="reflection-card"><label className="field-label">Give this study a name<input placeholder={`${subject.name} in the afternoon`} maxLength={100} value={current.title} onChange={e => update({ title: e.target.value })} /></label><Uploader label="Your second look (optional)" hint="A new sketch, a detail, or an annotated page." value={current.second} onChange={blob => update({ second: blob })} onError={setError} /><label className="field-label">What did you notice?<textarea rows={4} maxLength={2000} value={current.reflection} onChange={e => update({ reflection: e.target.value })} placeholder="I hadn’t noticed…" /></label><label className="completion-check"><input type="checkbox" checked={current.outdoorConfirmed || false} onChange={e => update({ outdoorConfirmed: e.target.checked })} /><span>I did this sketch outside.<small>With both photos added, this session counts toward my field passport. Demo uploads do not count as outdoor experiences.</small></span></label><div className="stage-actions"><button className="button secondary" onClick={() => update({ stage: current.feedback ? 'feedback' : 'photos' })}>Back</button><button className="button primary" onClick={finish}><BookOpen size={18} />Save to my journal</button></div></section><aside className="field-guide"><h3>Little observations count.</h3><p>A changed line, a new question, or a detail you hadn’t seen before. Keep what felt meaningful to you.</p>{current.sketch && <div className="first-attempt"><span className="eyebrow">YOUR FIRST SKETCH</span><Photo blob={current.sketch} alt="Your first sketch" /></div>}<button className="text-button" onClick={() => exportWork([current])}><Download size={16} />Export this draft</button></aside></div>}
        </>}

        {view === 'detail' && current && subject && <><div className="page-heading heading-row"><div><div className="eyebrow">{subject.name.toUpperCase()} · {date(current.createdAt)}</div><h1>{current.title || `${subject.name} study`}</h1><p>{current.parentId ? 'Another visit to a familiar subject.' : 'A little record of a closer look.'}</p></div><button className="button secondary" onClick={() => start(current.category, current.id)}><RefreshCw size={17} />Sketch this again</button></div><div className="comparison-grid">{([{ blob: current.subject, label: 'The real subject' }, { blob: current.sketch, label: 'My first sketch' }, { blob: current.second, label: 'My second look' }]).map(item => <section className="comparison-item" key={item.label}><span className="eyebrow">{item.label}</span><Photo blob={item.blob} alt={item.label} /></section>)}</div><div className="detail-bottom">{current.feedback && <FeedbackCard feedback={current.feedback} />}<section className="reflection-card"><span className="eyebrow">MY FIELD NOTE</span><p className="reflection-text">{current.reflection || 'No note added. Sometimes the drawing says enough.'}</p><div className="entry-details"><span><Clock size={15} />{current.minutes}-minute suggested exercise</span><span><ShieldCheck size={15} />Saved in this browser</span>{current.rating && <span>Feedback felt {current.rating}</span>}{!current.feedback && <span>Guided session · no AI analysis</span>}</div><div className="detail-actions"><button className="button secondary" onClick={() => exportWork([current])}><Download size={17} />Export entry</button><button className="icon-button" aria-label="Delete this entry" onClick={() => setConfirm(current)}><Trash2 size={18} /></button></div></section></div><button className="text-button spaced" onClick={() => go('journal')}>Back to my journal <ChevronRight size={16} /></button></>}

        {view === 'example' && <><div className="page-heading"><div className="eyebrow">AN AUTHORED WALKTHROUGH</div><h1>What a second look feels like.</h1><p>This example explains the experience. It is not a live model response or a tested drawing comparison.</p></div><div className="session-layout"><FeedbackCard feedback={example} /><aside className="field-guide"><h3>Your drawing stays yours.</h3><p>The coach offers a question to explore. It doesn’t grade your art or draw a replacement picture.</p><p>Go back to the real subject, draw one detail, then save what you discovered.</p><button className="button primary" onClick={() => start('leaves')}><Plus size={18} />Try your own sketch</button></aside></div></>}
        </>}
        <footer><span><Leaf size={14} />SketchWild</span><span>A sketchbook for paying attention.</span><button onClick={() => setSettings(true)}>Privacy & processing</button></footer>
      </main>
    </div>
    {notice && <div className="toast" role="status"><Check size={17} />{notice}</div>}
    {newSketch && <Modal title="Start a new sketch" close={() => setNewSketch(false)}><p className="new-sketch-intro">Choose something to observe outside. Take paper and a pencil, then return with your sketch.</p><div className="new-sketch-grid">{categories.map(category => { const Icon = icons[category.icon]; return <button type="button" className={`new-sketch-choice ${category.tone}`} key={category.id} onClick={() => { setNewSketch(false); start(category.id); }}><span className="category-icon"><Icon size={24} /></span><span><strong>{category.name}</strong><small>{category.focus}</small></span><ChevronRight size={16} /></button>; })}</div><button type="button" className="button secondary full-width" onClick={() => { setNewSketch(false); go('missions'); }}><Compass size={18} />Browse outdoor missions</button></Modal>}
    {settings && <Modal title="Your sketchbook, your device." close={() => setSettings(false)}><div className="privacy-block"><ShieldCheck size={25} /><div><h3>Journal storage</h3><p>Pictures, notes, and drafts are stored in this browser. They aren’t synced to an account. Export a copy before clearing browser data.</p></div></div><div className="privacy-block"><Sparkles size={25} /><div><h3>Photo feedback</h3><p>{caps?.notice}</p><span className={`connection-pill ${caps?.configured ? 'ready' : ''}`}>{caps?.configured ? 'Model connected · experimental' : 'Model unavailable'}</span><p className="small">{caps?.model && <>Model: <strong>{caps.model}</strong><br /></>}{caps?.reason}</p><button className="text-button" onClick={refreshCapabilities}><RefreshCw size={15} />Check connection</button></div></div><div className="settings-actions"><button className="button secondary" disabled={!sessions.length} onClick={() => exportWork(sessions)}><Download size={17} />Export journal</button><button className="text-button danger" disabled={!sessions.length} onClick={() => { setSettings(false); setConfirm('all'); }}><Trash2 size={16} />Delete all entries</button></div></Modal>}
    {help && <Modal title="Outside is the studio." close={() => setHelp(false)}><ol className="help-steps"><li><span>01</span><div><h3>Find something to notice</h3><p>A flower, a rock, or a view from a park bench. Choose an exercise and take paper and a pencil.</p></div></li><li><span>02</span><div><h3>Draw on paper</h3><p>Spend a few minutes looking and sketching. A rough outline is enough to start.</p></div></li><li><span>03</span><div><h3>Get a second-look invitation</h3><p>Upload the subject and drawing. When a vision model is connected, it offers one detail to explore. Feedback is experimental and can be wrong.</p></div></li><li><span>04</span><div><h3>Look again, then save</h3><p>Put the phone away. Add a detail or a note, then keep both attempts in your journal.</p></div></li></ol><button className="button primary full-width" onClick={() => { setHelp(false); go('explore'); }}>Choose an outdoor subject</button></Modal>}
    {confirm && <Modal title={confirm === 'all' ? 'Delete your entire journal?' : 'Delete this entry?'} close={() => setConfirm(undefined)}><p>These pictures and notes will be removed from this browser. Export a copy first if you want to keep them.</p><div className="stage-actions"><button className="button secondary" onClick={() => setConfirm(undefined)}>Keep my entries</button><button className="button destructive" onClick={remove}><Trash2 size={17} />Delete permanently</button></div></Modal>}
  </div>;
}
