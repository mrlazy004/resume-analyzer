import { useState, useCallback, useContext, createContext, useRef } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from "recharts";

// ─── Context ──────────────────────────────────────────────────────────────────
const ResumeContext = createContext(null);
const useResume = () => useContext(ResumeContext);

function ResumeProvider({ children }) {
  const [state, setState] = useState({
    resumeText: "",
    fileName: "",
    jobDescription: "",
    analysis: null,
    loading: false,
    step: "upload",
  });
  const update = (patch) => setState((s) => ({ ...s, ...patch }));
  return (
    <ResumeContext.Provider value={{ state, update }}>
      {children}
    </ResumeContext.Provider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #07080d;
    --surface: #0f1117;
    --surface2: #161820;
    --border: #1e2030;
    --accent: #c8f03e;
    --accent2: #3ef0b4;
    --accent3: #f03e8a;
    --text: #e8eaf0;
    --muted: #6b7090;
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --radius: 12px;
    --radius-lg: 20px;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px;
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
    background: rgba(7,8,13,0.85);
    backdrop-filter: blur(20px);
  }
  .logo { font-family: var(--font-display); font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
  .logo span { color: var(--accent); }
  .step-indicator { display: flex; gap: 8px; align-items: center; }
  .step-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); transition: all .3s; }
  .step-dot.active { background: var(--accent); box-shadow: 0 0 10px var(--accent); }
  .step-dot.done { background: var(--accent2); }

  .main { flex: 1; padding: 60px 40px; max-width: 1100px; margin: 0 auto; width: 100%; }

  .section-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; }
  .section-title { font-family: var(--font-display); font-size: clamp(28px, 5vw, 48px); font-weight: 800; line-height: 1.1; letter-spacing: -1px; margin-bottom: 8px; }
  .section-sub { color: var(--muted); font-size: 15px; line-height: 1.6; max-width: 500px; margin-bottom: 40px; }

  .upload-area {
    border: 2px dashed var(--border); border-radius: var(--radius-lg);
    padding: 60px 40px; text-align: center; cursor: pointer;
    transition: all .25s; position: relative; overflow: hidden;
  }
  .upload-area::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(200,240,62,0.04) 0%, transparent 70%);
    pointer-events: none;
  }
  .upload-area:hover, .upload-area.drag { border-color: var(--accent); background: rgba(200,240,62,0.03); }
  .upload-icon { width: 64px; height: 64px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background: var(--surface2); border-radius: 16px; border: 1px solid var(--border); }
  .upload-icon svg { width: 28px; height: 28px; stroke: var(--accent); }
  .upload-label { font-family: var(--font-display); font-size: 20px; font-weight: 700; margin-bottom: 6px; }
  .upload-sub { color: var(--muted); font-size: 14px; }
  .upload-badge { display: inline-block; margin-top: 20px; padding: 6px 14px; border-radius: 100px; background: rgba(200,240,62,0.1); border: 1px solid rgba(200,240,62,0.25); color: var(--accent); font-size: 12px; font-weight: 600; }

  .file-chip { display: flex; align-items: center; gap: 12px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 18px; margin-top: 16px; }
  .file-chip-icon { color: var(--accent2); }
  .file-chip-name { font-size: 14px; font-weight: 500; }
  .file-chip-size { font-size: 12px; color: var(--muted); margin-left: auto; }

  .jd-wrap { display: flex; flex-direction: column; gap: 20px; }
  .textarea { width: 100%; min-height: 260px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; color: var(--text); font-family: var(--font-body); font-size: 14px; line-height: 1.7; resize: vertical; outline: none; transition: border-color .2s; }
  .textarea::placeholder { color: var(--muted); }
  .textarea:focus { border-color: var(--accent); }

  .btn { font-family: var(--font-display); font-weight: 700; font-size: 14px; letter-spacing: 0.3px; padding: 14px 28px; border-radius: 10px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all .2s; }
  .btn-primary { background: var(--accent); color: #07080d; }
  .btn-primary:hover { background: #d9ff55; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,240,62,0.3); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-ghost { background: var(--surface2); color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { color: var(--text); border-color: var(--muted); }

  .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 20px; }
  .spinner { width: 48px; height: 48px; border-radius: 50%; border: 3px solid var(--border); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-family: var(--font-display); font-size: 18px; color: var(--muted); }

  .score-ring-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; width: 160px; height: 160px; }
  .score-ring-val { position: absolute; font-family: var(--font-display); font-size: 36px; font-weight: 800; }
  .score-ring-label { font-size: 11px; color: var(--muted); margin-top: -4px; }

  .results-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; }
  .results-grid .span2 { grid-column: span 2; }

  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; position: relative; overflow: hidden; }
  .card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: 0; transition: opacity .3s; }
  .card:hover::after { opacity: 1; }
  .card-title { font-family: var(--font-display); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 20px; }

  .score-hero { display: flex; align-items: center; gap: 40px; flex-wrap: wrap; }
  .score-meta { flex: 1; min-width: 200px; }
  .score-headline { font-family: var(--font-display); font-size: 28px; font-weight: 800; line-height: 1.2; margin-bottom: 8px; }
  .score-headline span { color: var(--accent); }
  .score-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }
  .score-stats { display: flex; gap: 24px; margin-top: 20px; flex-wrap: wrap; }
  .stat { display: flex; flex-direction: column; }
  .stat-val { font-family: var(--font-display); font-size: 22px; font-weight: 800; }
  .stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }

  .tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .tag { padding: 5px 12px; border-radius: 100px; font-size: 12px; font-weight: 500; letter-spacing: 0.3px; }
  .tag-found { background: rgba(62,240,180,0.1); border: 1px solid rgba(62,240,180,0.25); color: var(--accent2); }
  .tag-missing { background: rgba(240,62,138,0.1); border: 1px solid rgba(240,62,138,0.25); color: var(--accent3); }
  .tag-neutral { background: var(--surface2); border: 1px solid var(--border); color: var(--muted); }

  .suggestion-list { display: flex; flex-direction: column; gap: 12px; }
  .suggestion-item { display: flex; align-items: flex-start; gap: 12px; background: var(--surface2); border-radius: var(--radius); padding: 14px; border: 1px solid var(--border); }
  .suggestion-bullet { width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; margin-top: 1px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; }
  .sug-high { background: rgba(240,62,138,0.15); color: var(--accent3); }
  .sug-med { background: rgba(255,180,50,0.15); color: #ffb432; }
  .sug-low { background: rgba(200,240,62,0.15); color: var(--accent); }
  .suggestion-text { font-size: 13px; line-height: 1.6; }
  .suggestion-text strong { color: var(--text); font-weight: 600; }

  .custom-tooltip { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; font-size: 13px; }

  .progress-list { display: flex; flex-direction: column; gap: 14px; }
  .progress-item { display: flex; flex-direction: column; gap: 6px; }
  .progress-header { display: flex; justify-content: space-between; font-size: 13px; }
  .progress-bar-bg { height: 6px; border-radius: 100px; background: var(--border); overflow: hidden; }
  .progress-bar-fill { height: 100%; border-radius: 100px; transition: width 1s cubic-bezier(0.25,1,0.5,1); }

  .actions { display: flex; gap: 12px; align-items: center; }

  @media (max-width: 700px) {
    .header { padding: 16px 20px; }
    .main { padding: 40px 20px; }
    .results-grid { grid-template-columns: 1fr; }
    .results-grid .span2 { grid-column: span 1; }
    .score-hero { gap: 24px; }
  }

  .fade-in { animation: fadeIn 0.5s ease both; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function extractTextFromPDF(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const readable = text.replace(/[^\x20-\x7E\n]/g, ' ')
          .replace(/\s{3,}/g, '\n')
          .split('\n')
          .filter(l => l.trim().length > 3)
          .join('\n');
        resolve(readable.length > 100 ? readable : "Resume text extracted from " + file.name);
      } catch {
        resolve("Resume content from " + file.name);
      }
    };
    reader.readAsBinaryString(file);
  });
}

async function analyzeWithClaude(resumeText, jobDescription) {
  const prompt = `You are an expert resume analyzer. Analyze the resume against the job description.

RESUME:
${resumeText.slice(0, 3000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

Return ONLY a JSON object with this exact structure, no markdown, no explanation:
{
  "matchScore": <number 0-100>,
  "summary": "<2-sentence assessment>",
  "foundSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "keywordsFound": ["kw1", "kw2"],
  "keywordsMissing": ["kw1", "kw2"],
  "radarData": [
    {"subject": "Technical Skills", "score": <0-100>},
    {"subject": "Experience", "score": <0-100>},
    {"subject": "Education", "score": <0-100>},
    {"subject": "Soft Skills", "score": <0-100>},
    {"subject": "Keywords", "score": <0-100>},
    {"subject": "Formatting", "score": <0-100>}
  ],
  "suggestions": [
    {"priority": "high", "title": "<title>", "detail": "<action>"},
    {"priority": "med", "title": "<title>", "detail": "<action>"},
    {"priority": "low", "title": "<title>", "detail": "<action>"}
  ],
  "categoryScores": [
    {"name": "Technical Fit", "score": <0-100>},
    {"name": "Experience Fit", "score": <0-100>},
    {"name": "Culture Fit", "score": <0-100>},
    {"name": "Keyword Match", "score": <0-100>}
  ]
}`;

  const response = await fetch("/api/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    })
  });

  const data = await response.json();
  const raw = data.choices[0].message.content;
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 68; const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "#c8f03e" : score >= 45 ? "#ffb432" : "#f03e8a";
  return (
    <div className="score-ring-wrap">
      <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="80" cy="80" r={r} fill="none" stroke="#1e2030" strokeWidth="10" />
        <circle cx="80" cy="80" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.25,1,0.5,1)", filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
      <span className="score-ring-val" style={{ color }}>{score}%</span>
    </div>
  );
}

function ProgressBar({ name, score }) {
  const color = score >= 70 ? "#c8f03e" : score >= 45 ? "#ffb432" : "#f03e8a";
  return (
    <div className="progress-item">
      <div className="progress-header">
        <span style={{ fontWeight: 500 }}>{name}</span>
        <span style={{ color, fontWeight: 700 }}>{score}%</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: score + "%", background: color }} />
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <strong>{payload[0]?.name || payload[0]?.dataKey}</strong>: {payload[0]?.value}%
    </div>
  );
};

// ─── Step 1: Upload ───────────────────────────────────────────────────────────
function UploadStep() {
  const { update } = useResume();
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState(null);
  const inputRef = useRef();

  const handleFile = async (f) => {
    if (!f || f.type !== "application/pdf") return;
    setFile(f);
    const text = await extractTextFromPDF(f);
    update({ resumeText: text, fileName: f.name });
  };

  return (
    <div className="fade-in">
      <p className="section-eyebrow">Step 01</p>
      <h1 className="section-title">Upload Your<br /><span style={{ color: "var(--accent)" }}>Resume</span></h1>
      <p className="section-sub">Drop your PDF resume to get an AI-powered analysis against any job description.</p>

      <div
        className={`upload-area ${drag ? "drag" : ""}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
      >
        <div className="upload-icon">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <polyline points="9 15 12 12 15 15" />
          </svg>
        </div>
        <p className="upload-label">Drop your PDF here</p>
        <p className="upload-sub">or click to browse files</p>
        <span className="upload-badge">PDF only · Max 10MB</span>
        <input ref={inputRef} type="file" accept="application/pdf" style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      {file && (
        <div className="file-chip">
          <span className="file-chip-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="file-chip-name">{file.name}</span>
          <span className="file-chip-size">{(file.size / 1024).toFixed(0)} KB</span>
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <button className="btn btn-primary" disabled={!file}
          onClick={() => update({ step: "jd" })}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Job Description ──────────────────────────────────────────────────
function JDStep() {
  const { state, update } = useResume();
  const [jd, setJd] = useState(state.jobDescription);

  const handleAnalyze = async () => {
    update({ jobDescription: jd, loading: true, step: "results" });
    try {
      const analysis = await analyzeWithClaude(state.resumeText, jd);
      update({ analysis, loading: false });
    } catch (e) {
      console.error(e);
      update({ loading: false });
    }
  };

  return (
    <div className="fade-in">
      <p className="section-eyebrow">Step 02</p>
      <h1 className="section-title">Paste Job<br /><span style={{ color: "var(--accent)" }}>Description</span></h1>
      <p className="section-sub">Paste the full job posting to get a precise match score and skill gap analysis.</p>

      <div className="jd-wrap">
        <textarea className="textarea"
          placeholder="Paste the job description here — requirements, responsibilities, preferred qualifications…"
          value={jd} onChange={(e) => setJd(e.target.value)} />

        <div className="actions">
          <button className="btn btn-ghost" onClick={() => update({ step: "upload" })}>← Back</button>
          <button className="btn btn-primary" disabled={jd.trim().length < 30} onClick={handleAnalyze}>
            Analyze Resume →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Results ──────────────────────────────────────────────────────────
function ResultsStep() {
  const { state, update } = useResume();
  const { loading, analysis } = state;

  if (loading) return (
    <div className="loading-wrap">
      <div className="spinner" />
      <p className="loading-text">Analyzing your resume…</p>
    </div>
  );

  if (!analysis) return (
    <div className="loading-wrap">
      <p className="loading-text">Something went wrong. Please try again.</p>
      <button className="btn btn-ghost" onClick={() => update({ step: "jd" })}>← Go Back</button>
    </div>
  );

  const a = analysis;
  const ACCENT_COLORS = ["#c8f03e", "#3ef0b4", "#f03e8a", "#ffb432"];

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p className="section-eyebrow">Analysis Complete</p>
          <h1 className="section-title" style={{ marginBottom: 0 }}>Your Results</h1>
        </div>
        <button className="btn btn-ghost" onClick={() => update({ step: "upload", analysis: null, resumeText: "", fileName: "", jobDescription: "" })}>
          Start Over
        </button>
      </div>

      <div className="results-grid">
        <div className="card span2" style={{ background: "linear-gradient(135deg, #0f1117 0%, #121620 100%)" }}>
          <p className="card-title">Match Score</p>
          <div className="score-hero">
            <ScoreRing score={a.matchScore} />
            <div className="score-meta">
              <h2 className="score-headline">
                {a.matchScore >= 70 ? "Strong" : a.matchScore >= 45 ? "Moderate" : "Weak"} <span>Match</span>
              </h2>
              <p className="score-desc">{a.summary}</p>
              <div className="score-stats">
                <div className="stat">
                  <span className="stat-val" style={{ color: "var(--accent2)" }}>{a.foundSkills?.length || 0}</span>
                  <span className="stat-label">Skills Found</span>
                </div>
                <div className="stat">
                  <span className="stat-val" style={{ color: "var(--accent3)" }}>{a.missingSkills?.length || 0}</span>
                  <span className="stat-label">Skills Missing</span>
                </div>
                <div className="stat">
                  <span className="stat-val" style={{ color: "var(--accent)" }}>{a.keywordsFound?.length || 0}</span>
                  <span className="stat-label">Keywords Hit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <p className="card-title">Skill Radar</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={a.radarData}>
              <PolarGrid stroke="#1e2030" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7090", fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="score" stroke="#c8f03e" fill="#c8f03e" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <p className="card-title">Category Scores</p>
          <div className="progress-list" style={{ marginTop: 8 }}>
            {a.categoryScores?.map((c, i) => <ProgressBar key={i} name={c.name} score={c.score} />)}
          </div>
        </div>

        <div className="card">
          <p className="card-title">✓ Matched Skills</p>
          <div className="tags">
            {a.foundSkills?.map((s, i) => <span key={i} className="tag tag-found">{s}</span>)}
          </div>
        </div>

        <div className="card">
          <p className="card-title">✗ Missing Skills</p>
          <div className="tags">
            {a.missingSkills?.map((s, i) => <span key={i} className="tag tag-missing">{s}</span>)}
          </div>
        </div>

        <div className="card span2">
          <p className="card-title">Category Breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={a.categoryScores} barSize={36}>
              <XAxis dataKey="name" tick={{ fill: "#6b7090", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {a.categoryScores?.map((_, i) => (
                  <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card span2">
          <p className="card-title">Keyword Analysis</p>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, display: "block" }}>Found in resume</span>
            <div className="tags">
              {a.keywordsFound?.map((k, i) => <span key={i} className="tag tag-found">{k}</span>)}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, display: "block" }}>Missing from resume</span>
            <div className="tags">
              {a.keywordsMissing?.map((k, i) => <span key={i} className="tag tag-missing">{k}</span>)}
            </div>
          </div>
        </div>

        <div className="card span2">
          <p className="card-title">AI Recommendations</p>
          <div className="suggestion-list">
            {a.suggestions?.map((s, i) => {
              const cls = s.priority === "high" ? "sug-high" : s.priority === "med" ? "sug-med" : "sug-low";
              const label = s.priority === "high" ? "!" : s.priority === "med" ? "~" : "↑";
              return (
                <div key={i} className="suggestion-item">
                  <div className={`suggestion-bullet ${cls}`}>{label}</div>
                  <p className="suggestion-text"><strong>{s.title}:</strong> {s.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
function StepContent() {
  const { state } = useResume();
  if (state.step === "upload") return <UploadStep />;
  if (state.step === "jd") return <JDStep />;
  return <ResultsStep />;
}

function StepDots() {
  const { state } = useResume();
  const steps = ["upload", "jd", "results"];
  return (
    <div className="step-indicator">
      {steps.map((s) => (
        <div key={s} className={`step-dot ${state.step === s ? "active" : steps.indexOf(state.step) > steps.indexOf(s) ? "done" : ""}`} />
      ))}
    </div>
  );
}

export default function App() {
  return (
    <ResumeProvider>
      <style>{css}</style>
      <div className="app">
        <header className="header">
          <div className="logo">resume<span>·ai</span></div>
          <StepDots />
        </header>
        <main className="main">
          <StepContent />
        </main>
      </div>
    </ResumeProvider>
  );
}
