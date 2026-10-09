import { BookOpen, ExternalLink, Play, Sparkles } from 'lucide-react';

export function PreviewNotice({ onExample, videoUrl }: { onExample: () => void; videoUrl?: string }) {
  return <section className="preview-notice" aria-labelledby="preview-title">
    <div className="preview-notice-heading"><Sparkles size={22} /><div><span className="eyebrow">PUBLIC PREVIEW · LOCAL AI AVAILABLE</span><h2 id="preview-title">Explore here. Get Gemma coaching on your laptop.</h2></div></div>
    <p>Choose a mission, draw outside, upload your pictures, and save your journal here. Live AI observations are turned off in this preview. To compare your subject and sketch with Gemma 3, run SketchWild locally with Ollama. No API key is required.</p>
    <div className="preview-notice-actions">
      <a className="button primary" href="https://github.com/priy-anshugupta/sketchwild#run-it-on-your-laptop" target="_blank" rel="noopener noreferrer"><ExternalLink size={17} />Run locally</a>
      {videoUrl && <a className="button secondary" href={videoUrl} target="_blank" rel="noopener noreferrer"><Play size={17} />Watch walkthrough</a>}
      <button className="text-button" onClick={onExample}><BookOpen size={17} />View example feedback</button>
    </div>
    <p className="preview-notice-footnote">The example is an authored explanation, not a live result. Your pictures stay in this browser in preview mode. Installing Ollama alone does not connect this public website to your laptop.</p>
  </section>;
}
