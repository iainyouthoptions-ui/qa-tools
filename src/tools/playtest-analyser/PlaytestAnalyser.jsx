import { useState, useCallback } from "react";

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  dark: {
    bg: "#0d1117", surface: "#161b27", surfaceAlt: "#1c2235",
    border: "#252d45", accent: "#4ecdc4", accentDim: "rgba(78,205,196,0.15)",
    accentGlow: "rgba(78,205,196,0.3)", text: "#e6eaf4", textMuted: "#7a86a3",
    textDim: "#444e68", high: "#fc8181", highBg: "rgba(252,129,129,0.12)",
    med: "#f6ad55", medBg: "rgba(246,173,85,0.12)",
    low: "#68d391", lowBg: "rgba(104,211,145,0.12)",
    inputBg: "#0d1117", shadow: "0 4px 32px rgba(0,0,0,0.5)",
    btnShadow: "0 2px 12px rgba(78,205,196,0.25)",
  },
  light: {
    bg: "#f0f3fa", surface: "#ffffff", surfaceAlt: "#f5f7fd",
    border: "#dce2f0", accent: "#2a7a8c", accentDim: "rgba(42,122,140,0.1)",
    accentGlow: "rgba(42,122,140,0.2)", text: "#1a2035", textMuted: "#5a6480",
    textDim: "#9aa0b8", high: "#c53030", highBg: "rgba(197,48,48,0.08)",
    med: "#b7791f", medBg: "rgba(183,121,31,0.08)",
    low: "#276749", lowBg: "rgba(39,103,73,0.08)",
    inputBg: "#f5f7fd", shadow: "0 2px 20px rgba(0,0,0,0.07)",
    btnShadow: "0 2px 12px rgba(42,122,140,0.2)",
  },
};

const STORAGE_KEY = "yoqa-analyser-v2";

const AREA_OPTIONS = ["Controls", "UI & Menus", "Difficulty", "Story & Narrative", "Sound & Music", "Performance", "Other"];
const SEVERITY_OPTIONS = [
  { value: "Low", desc: "Players moved through the game smoothly with only minor hesitations", color: "low" },
  { value: "Moderate", desc: "Players hit noticeable friction points that interrupted the experience at times", color: "med" },
  { value: "High", desc: "Players were regularly blocked or frustrated during the session", color: "high" },
];
const OBJECTIVE_MET_OPTIONS = [
  { value: "Yes", desc: "The session found what we set out to find" },
  { value: "Partly", desc: "We found some of it but missed some areas" },
  { value: "No", desc: "The session didn't achieve what we planned" },
];
const PRIORITY_OPTIONS = ["High", "Medium", "Low"];

function load() {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
function save(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function makeParticipant(n) {
  return { id: n, enjoyed: "", confused: "", improve: "" };
}

function initState() {
  return {
    name: "", game: "", date: "", participantCount: null,
    participants: [],
    problemArea: [], problemAreaOther: "", severity: null, surprises: null, surprisesDetail: "",
    mostEnjoyed: "",
    keyFindings: "",
    recommendations: [{ id: 1, text: "", priority: "Medium" }],
    objectiveMet: null, objectiveDetail: "",
  };
}

// Build the flat step list based on current state
function buildSteps(state) {
  const steps = [];

  // 1. Game + date
  steps.push({ id: "setup", type: "setup" });

  // 2. Participant count
  steps.push({ id: "count", type: "count" });

  // 3. All participants on one screen
  steps.push({ id: "participants", type: "participants" });

  // Pattern steps
  steps.push({ id: "area", type: "area" });
  steps.push({ id: "enjoyed", type: "enjoyed" });
  steps.push({ id: "severity", type: "severity" });
  steps.push({ id: "surprises", type: "surprises" });

  // Report steps
  steps.push({ id: "findings", type: "findings" });
  steps.push({ id: "recommendations", type: "recommendations" });
  steps.push({ id: "reflection", type: "reflection" });

  return steps;
}

function isStepComplete(step, state) {
  switch (step.type) {
    case "setup": return state.name.trim() !== "" && state.game.trim() !== "" && state.date.trim() !== "";
    case "count": return state.participantCount !== null;
    case "participants": return state.participants.length > 0 && state.participants.every(p => p.enjoyed.trim() !== "" && p.confused.trim() !== "" && p.improve.trim() !== "");
    case "area": return state.problemArea.length > 0 && (!state.problemArea.includes("Other") || state.problemAreaOther.trim() !== "");
    case "enjoyed": return state.mostEnjoyed.trim() !== "";
    case "severity": return state.severity !== null;
    case "surprises": return state.surprises !== null && (state.surprises === "No" || state.surprisesDetail.trim() !== "");
    case "findings": return state.keyFindings.trim() !== "";
    case "recommendations": return state.recommendations.every(r => r.text.trim() !== "");
    case "reflection": return state.objectiveMet !== null && (state.objectiveMet === "Yes" || state.objectiveDetail.trim() !== "");
    default: return false;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PlaytestAnalyser() {
  const [theme, setTheme] = useState("dark");
  const [stepIdx, setStepIdx] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [state, setStateRaw] = useState(() => load() || initState());

  const T = C[theme];

  const setState = useCallback((fn) => {
    setStateRaw(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      save(next);
      return next;
    });
  }, []);

  const steps = buildSteps(state);
  const step = steps[stepIdx];
  const done = isStepComplete(step, state);
  const totalSteps = steps.length;
  const progress = Math.round((stepIdx / (totalSteps - 1)) * 100);

  const next = () => { if (done && stepIdx < steps.length - 1) setStepIdx(i => i + 1); };
  const back = () => { if (stepIdx > 0) setStepIdx(i => i - 1); };
  const reset = () => { setStateRaw(initState()); save(initState()); setStepIdx(0); setShowReport(false); };

  const setField = (k, v) => setState(s => ({ ...s, [k]: v }));
  const setParticipantField = (idx, k, v) => setState(s => {
    const participants = [...s.participants];
    if (!participants[idx]) participants[idx] = makeParticipant(idx);
    participants[idx] = { ...participants[idx], [k]: v };
    return { ...s, participants };
  });

  // Styles
  const sx = {
    root: { minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", transition: "background .3s, color .3s" },
    header: { background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: T.shadow },
    logoWrap: { padding: "12px 0", display: "flex", alignItems: "center", gap: 10 },
    logoBadge: { background: T.accent, color: theme === "dark" ? "#0d1117" : "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", padding: "3px 7px", borderRadius: 4, textTransform: "uppercase" },
    logoText: { fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" },
    logoSub: { fontSize: 11, color: T.textMuted },
    progressWrap: { height: 3, background: T.border },
    progressFill: { height: "100%", background: T.accent, width: `${progress}%`, transition: "width .4s ease" },
    body: { maxWidth: 640, margin: "0 auto", padding: "40px 20px 80px" },
    stepMeta: { display: "flex", alignItems: "center", gap: 8, marginBottom: 28 },
    stepNum: { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.accent },
    stepTotal: { fontSize: 11, color: T.textDim },
    question: { fontSize: 22, fontWeight: 800, lineHeight: 1.35, letterSpacing: "-0.02em", marginBottom: 8 },
    prompt: { fontSize: 14, color: T.textMuted, lineHeight: 1.65, marginBottom: 28 },
    smallInput: { width: "100%", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: 15, padding: "12px 14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", resize: "none", lineHeight: 1.6 },
    tileGrid: (cols) => ({ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }),
    tile: (selected) => ({
      background: selected ? T.accentDim : T.surface,
      border: `2px solid ${selected ? T.accent : T.border}`,
      borderRadius: 10, padding: "14px 16px", cursor: "pointer",
      color: selected ? T.accent : T.text, fontWeight: selected ? 700 : 500,
      fontSize: 14, textAlign: "center", transition: "all .15s",
      boxShadow: selected ? `0 0 0 3px ${T.accentGlow}` : "none",
    }),
    tileDesc: { fontSize: 12, color: T.textMuted, marginTop: 4, fontWeight: 400, lineHeight: 1.4 },
    countTile: (selected) => ({
      background: selected ? T.accentDim : T.surface,
      border: `2px solid ${selected ? T.accent : T.border}`,
      borderRadius: 10, padding: "18px 10px", cursor: "pointer",
      color: selected ? T.accent : T.text, fontWeight: selected ? 800 : 600,
      fontSize: 20, textAlign: "center", transition: "all .15s",
      boxShadow: selected ? `0 0 0 3px ${T.accentGlow}` : "none",
    }),
    navRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36 },
    btnPrimary: (disabled) => ({
      background: disabled ? T.border : T.accent,
      color: disabled ? T.textDim : theme === "dark" ? "#0d1117" : "#fff",
      border: "none", borderRadius: 10, padding: "13px 28px",
      fontSize: 15, fontWeight: 800, cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.5 : 1, transition: "all .2s", letterSpacing: "-0.01em",
      boxShadow: disabled ? "none" : T.btnShadow,
    }),
    btnBack: { background: T.surfaceAlt, color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 10, padding: "13px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
    btnOutline: { background: "none", color: T.accent, border: `1px solid ${T.accent}`, borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
    btnDanger: { background: "none", color: T.high, border: `1px solid ${T.high}`, borderRadius: 6, padding: "6px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
    hint: { fontSize: 12, color: T.textDim, marginTop: 4, marginBottom: 7 },
    label: { fontSize: 13, fontWeight: 600, color: T.textMuted, marginBottom: 7, display: "block" },
    fieldGroup: { marginBottom: 16 },
    pLabel: { fontSize: 12, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: T.accent, marginBottom: 20 },
    recRow: { display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 12 },
    priorityBtn: (p, sel) => {
      const map = { High: [T.high, T.highBg], Medium: [T.med, T.medBg], Low: [T.low, T.lowBg] };
      const [col, bg] = map[p];
      return { padding: "5px 10px", borderRadius: 6, border: `1px solid ${sel ? col : T.border}`, background: sel ? bg : "none", color: sel ? col : T.textDim, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .15s", flexShrink: 0 };
    },
    themeBtn: { background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textMuted, cursor: "pointer", padding: "6px 12px", fontSize: 12, fontWeight: 600 },
  };

  // ── Step renderers ───────────────────────────────────────────────────────

  const renderSetup = () => (
    <div>
      <div style={sx.stepMeta}><span style={sx.stepNum}>Step {stepIdx + 1}</span><span style={sx.stepTotal}>of {totalSteps}</span></div>
      <div style={sx.question}>Let's set up your session</div>
      <div style={sx.prompt}>Enter the basics so your report is labelled correctly.</div>
      <div style={{ marginBottom: 20 }}>
        <label style={sx.label}>Your name</label>
        <input style={sx.smallInput} value={state.name} onChange={e => setField("name", e.target.value)} placeholder="e.g. Alex Smith" />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={sx.label}>Game being tested</label>
        <input style={sx.smallInput} value={state.game} onChange={e => setField("game", e.target.value)} placeholder="e.g. Blood Reaver" />
      </div>
      <div>
        <label style={sx.label}>Session date</label>
        <input style={{ ...sx.smallInput, maxWidth: 200 }} type="date" value={state.date} onChange={e => setField("date", e.target.value)} />
      </div>
    </div>
  );

  const renderCount = () => (
    <div>
      <div style={sx.stepMeta}><span style={sx.stepNum}>Step {stepIdx + 1}</span><span style={sx.stepTotal}>of {totalSteps}</span></div>
      <div style={sx.question}>How many participants took part?</div>
      <div style={sx.prompt}>Select the number of people who played and gave feedback in your session.</div>
      <div style={sx.tileGrid(6)}>
        {[1, 2, 3, 4, 5, 6].map(n => (
          <div key={n} style={sx.countTile(state.participantCount === n)} onClick={() => {
            const participants = Array.from({ length: n }, (_, i) => state.participants[i] || makeParticipant(i));
            setState(s => ({ ...s, participantCount: n, participants }));
          }}>{n}</div>
        ))}
      </div>
      {state.participantCount === 6 && <div style={{ ...sx.hint, marginTop: 12 }}>If you had more than 6, select 6 and use the last card for any additional participants combined.</div>}
    </div>
  );

  const renderParticipants = () => (
    <div>
      <div style={sx.stepMeta}><span style={sx.stepNum}>Step {stepIdx + 1}</span><span style={sx.stepTotal}>of {totalSteps}</span></div>
      <div style={sx.question}>Participant feedback</div>
      <div style={sx.prompt}>Fill in what each participant told you and what you observed. Work through all {state.participantCount} cards before moving on.</div>
      {state.participants.map((p, i) => (
        <div key={p.id} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "20px", marginBottom: 16 }}>
          <div style={sx.pLabel}>Participant {i + 1}</div>
          <div style={sx.fieldGroup}>
            <label style={sx.label}>What did they enjoy most?</label>
            <div style={sx.hint}>What parts of the game did they say they liked, or seemed to enjoy while playing?</div>
            <textarea rows={3} style={sx.smallInput} value={p.enjoyed} onChange={e => setParticipantField(i, "enjoyed", e.target.value)} placeholder="e.g. They loved the combat animations and said the game felt fast-paced and exciting." />
          </div>
          <div style={sx.fieldGroup}>
            <label style={sx.label}>What confused or frustrated them?</label>
            <div style={sx.hint}>What did they struggle with, get stuck on, or say was unclear?</div>
            <textarea rows={3} style={sx.smallInput} value={p.confused} onChange={e => setParticipantField(i, "confused", e.target.value)} placeholder="e.g. They didn't know how to use the inventory and had to ask for help twice." />
          </div>
          <div style={{ ...sx.fieldGroup, marginBottom: 0 }}>
            <label style={sx.label}>What did they suggest improving?</label>
            <div style={sx.hint}>Any specific ideas or requests they mentioned?</div>
            <textarea rows={3} style={sx.smallInput} value={p.improve} onChange={e => setParticipantField(i, "improve", e.target.value)} placeholder="e.g. They suggested adding a tutorial for the crafting system and making the map easier to read." />
          </div>
        </div>
      ))}
    </div>
  );

  const renderArea = () => (
    <div>
      <div style={sx.stepMeta}><span style={sx.stepNum}>Step {stepIdx + 1}</span><span style={sx.stepTotal}>of {totalSteps}</span></div>
      <div style={sx.question}>Which area had the most problems?</div>
      <div style={sx.prompt}>Select all areas where participants ran into issues. You can pick more than one.</div>
      <div style={sx.tileGrid(3)}>
        {AREA_OPTIONS.map(a => {
          const sel = state.problemArea.includes(a);
          return (
            <div key={a} style={sx.tile(sel)} onClick={() => {
              setField("problemArea", sel ? state.problemArea.filter(x => x !== a) : [...state.problemArea, a]);
            }}>{a}</div>
          );
        })}
      </div>
      {state.problemArea.includes("Other") && (
        <div style={{ marginTop: 16 }}>
          <label style={sx.label}>Describe the other area</label>
          <textarea rows={2} style={sx.smallInput} value={state.problemAreaOther} onChange={e => setField("problemAreaOther", e.target.value)} placeholder="Briefly describe the area in 1–2 sentences." />
        </div>
      )}
    </div>
  );

  const renderEngagement = () => (
    <div>
      <div style={sx.stepMeta}><span style={sx.stepNum}>Step {stepIdx + 1}</span><span style={sx.stepTotal}>of {totalSteps}</span></div>
      <div style={sx.question}>When were players most engaged?</div>
      <div style={sx.prompt}>Write 1–2 sentences. Describe the moment or part of the game where participants seemed most focused, excited, or absorbed. What was happening at that point?</div>
      <textarea rows={3} style={sx.smallInput} value={state.mostEnjoyed} onChange={e => setField("mostEnjoyed", e.target.value)} placeholder="e.g. Players were most engaged during the first boss encounter — everyone leaned in and went quiet. Two participants replayed that section immediately after finishing it." />
    </div>
  );

  const renderSeverity = () => (
    <div>
      <div style={sx.stepMeta}><span style={sx.stepNum}>Step {stepIdx + 1}</span><span style={sx.stepTotal}>of {totalSteps}</span></div>
      <div style={sx.question}>How much friction did players experience?</div>
      <div style={sx.prompt}>Think about the moments where players hesitated, got stuck, or felt the experience break down. This isn't about the quality of the game — it's about how smoothly players moved through it during your session.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SEVERITY_OPTIONS.map(opt => {
          const sel = state.severity === opt.value;
          return (
            <div key={opt.value} style={{ ...sx.tile(sel), textAlign: "left", display: "flex", alignItems: "flex-start", gap: 14 }} onClick={() => setField("severity", opt.value)}>
              <div style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", border: `2px solid ${sel ? T.accent : T.border}`, background: sel ? T.accent : "none", marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: 3 }}>{opt.value}</div>
                <div style={sx.tileDesc}>{opt.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSurprises = () => (
    <div>
      <div style={sx.stepMeta}><span style={sx.stepNum}>Step {stepIdx + 1}</span><span style={sx.stepTotal}>of {totalSteps}</span></div>
      <div style={sx.question}>Did anything surprise you?</div>
      <div style={sx.prompt}>Think about what you expected to happen versus what actually happened. Was there a problem you didn't predict — or something that went better than you thought? It's fine if there were no surprises.</div>
      <div style={sx.tileGrid(2)}>
        {["Yes", "No"].map(v => (
          <div key={v} style={sx.tile(state.surprises === v)} onClick={() => setField("surprises", v)}>{v}</div>
        ))}
      </div>
      {state.surprises === "Yes" && (
        <div style={{ marginTop: 20 }}>
          <div style={sx.prompt}>Briefly describe what surprised you.</div>
          <textarea rows={3} style={sx.smallInput} value={state.surprisesDetail} onChange={e => setField("surprisesDetail", e.target.value)} placeholder="e.g. I expected the difficulty to be a major complaint, but no one mentioned it. Players actually found the challenge level satisfying." />
        </div>
      )}
    </div>
  );

  const renderFindings = () => (
    <div>
      <div style={sx.stepMeta}><span style={sx.stepNum}>Step {stepIdx + 1}</span><span style={sx.stepTotal}>of {totalSteps}</span></div>
      <div style={sx.question}>Write your key findings</div>
      <div style={sx.prompt}>Summarise what you discovered in 2–4 sentences. What worked? What didn't? What patterns stood out across participants? Use your notes from earlier in this tool to help.</div>
      <textarea rows={5} style={sx.smallInput} value={state.keyFindings} onChange={e => setField("keyFindings", e.target.value)} placeholder="e.g. The playtest revealed that participants found the core combat system engaging and responsive. However, the inventory UI was a consistent pain point for all four participants. The tutorial section was generally well received, though two participants suggested it could be shorter." />
    </div>
  );

  const renderRecommendations = () => (
    <div>
      <div style={sx.stepMeta}><span style={sx.stepNum}>Step {stepIdx + 1}</span><span style={sx.stepTotal}>of {totalSteps}</span></div>
      <div style={sx.question}>What are your recommendations?</div>
      <div style={sx.prompt}>List the changes you'd suggest to the development team. Set a priority for each so they know what to tackle first.</div>
      {state.recommendations.map((rec, i) => (
        <div key={rec.id} style={sx.recRow}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, marginBottom: 5 }}>Recommendation {i + 1}</div>
            <textarea rows={2} style={sx.smallInput} value={rec.text} onChange={e => {
              const recs = state.recommendations.map(r => r.id === rec.id ? { ...r, text: e.target.value } : r);
              setField("recommendations", recs);
            }} placeholder="e.g. Redesign the inventory UI to reduce clutter and improve readability during gameplay." />
          </div>
          <div style={{ flexShrink: 0, paddingTop: 22, display: "flex", flexDirection: "column", gap: 4 }}>
            {PRIORITY_OPTIONS.map(p => (
              <button key={p} style={sx.priorityBtn(p, rec.priority === p)} onClick={() => {
                const recs = state.recommendations.map(r => r.id === rec.id ? { ...r, priority: p } : r);
                setField("recommendations", recs);
              }}>{p}</button>
            ))}
          </div>
          {state.recommendations.length > 1 && (
            <div style={{ flexShrink: 0, paddingTop: 22 }}>
              <button style={sx.btnDanger} onClick={() => setField("recommendations", state.recommendations.filter(r => r.id !== rec.id))}>✕</button>
            </div>
          )}
        </div>
      ))}
      <button style={sx.btnOutline} onClick={() => {
        setField("recommendations", [...state.recommendations, { id: Date.now(), text: "", priority: "Medium" }]);
      }}>+ Add recommendation</button>
    </div>
  );

  const renderReflection = () => (
    <div>
      <div style={sx.stepMeta}><span style={sx.stepNum}>Step {stepIdx + 1}</span><span style={sx.stepTotal}>of {totalSteps}</span></div>
      <div style={sx.question}>Did the session meet its objective?</div>
      <div style={sx.prompt}>Think back to what you set out to test. Did you get the information you needed? Be honest — this shows your professional judgement.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {OBJECTIVE_MET_OPTIONS.map(opt => {
          const sel = state.objectiveMet === opt.value;
          return (
            <div key={opt.value} style={{ ...sx.tile(sel), textAlign: "left", display: "flex", alignItems: "flex-start", gap: 14 }} onClick={() => setField("objectiveMet", opt.value)}>
              <div style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", border: `2px solid ${sel ? T.accent : T.border}`, background: sel ? T.accent : "none", marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{opt.value}</div>
                <div style={sx.tileDesc}>{opt.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
      {state.objectiveMet && state.objectiveMet !== "Yes" && (
        <div>
          <div style={sx.prompt}>Briefly explain, and note what you'd do differently next time.</div>
          <textarea rows={3} style={sx.smallInput} value={state.objectiveDetail} onChange={e => setField("objectiveDetail", e.target.value)} placeholder="e.g. We ran out of time to explore the crafting mechanics as planned. Next time I'd schedule an extra 15 minutes and give participants a specific task to complete in that area." />
        </div>
      )}
    </div>
  );

  const renderStep = () => {
    switch (step.type) {
      case "setup": return renderSetup();
      case "count": return renderCount();
      case "participants": return renderParticipants();
      case "area": return renderArea();
      case "enjoyed": return renderEngagement();
      case "severity": return renderSeverity();
      case "surprises": return renderSurprises();
      case "findings": return renderFindings();
      case "recommendations": return renderRecommendations();
      case "reflection": return renderReflection();
      default: return null;
    }
  };

  // ── Report ────────────────────────────────────────────────────────────────
  const allComplete = steps.every(s => isStepComplete(s, state));

  const Report = () => {
    const dateStr = state.date ? new Date(state.date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "";
    const sortedRecs = [...state.recommendations].sort((a, b) => {
      const o = { High: 0, Medium: 1, Low: 2 };
      return o[a.priority] - o[b.priority];
    });
    const ps = {
      page: { background: "#fff", color: "#111", fontFamily: "Georgia, serif", padding: "44px 52px", maxWidth: 700, margin: "0 auto", borderRadius: 12, boxShadow: "0 8px 48px rgba(0,0,0,0.4)" },
      kicker: { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4ecdc4", marginBottom: 8 },
      h1: { fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 },
      meta: { fontSize: 13, color: "#666", marginBottom: 32, paddingBottom: 20, borderBottom: "2px solid #111" },
      h2: { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", borderBottom: "1px solid #e0e0e0", paddingBottom: 6, marginBottom: 14, marginTop: 28 },
      p: { fontSize: 14, lineHeight: 1.75, color: "#222", marginBottom: 10 },
      pCard: { background: "#f7f8fc", border: "1px solid #e0e4f0", borderRadius: 8, padding: "16px 18px", marginBottom: 12 },
      pName: { fontSize: 12, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#4ecdc4", marginBottom: 10 },
      fieldLbl: { fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 },
      fieldVal: { fontSize: 14, color: "#222", lineHeight: 1.65, marginBottom: 10 },
      badge: (p) => {
        const m = { High: "#c53030", Medium: "#b7791f", Low: "#276749" };
        return { display: "inline-block", background: m[p], color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginRight: 10, flexShrink: 0 };
      },
      areaBadge: { display: "inline-block", background: "#f0f3fa", border: "1px solid #dce2f0", borderRadius: 4, padding: "3px 9px", fontSize: 12, fontWeight: 600, marginRight: 6, marginBottom: 6, color: "#333" },
      footer: { marginTop: 36, paddingTop: 16, borderTop: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa" },
      pcBox: { background: "#f0faf9", border: "1px solid #b2e8e4", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "#2a7a8c", lineHeight: 1.7, marginTop: 28 },
    };
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, overflowY: "auto", padding: "32px 20px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Evidence Report</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ background: "#4ecdc4", color: "#0d1117", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 800, cursor: "pointer", fontSize: 14 }} onClick={() => window.print()}>🖨 Print / Save PDF</button>
              <button style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13 }} onClick={() => setShowReport(false)}>Close</button>
            </div>
          </div>
          <div id="print-zone" style={ps.page}>
            <div style={ps.kicker}>Youth Options · Lead Gameplay Tester</div>
            <div style={ps.h1}>Playtest Analysis Report</div>
            <div style={ps.meta}>{state.name && `${state.name} · `}{state.game}{dateStr && ` · ${dateStr}`}{state.participantCount && ` · ${state.participantCount} participant${state.participantCount !== 1 ? "s" : ""}`}</div>

            <div style={ps.h2}>Participant Feedback</div>
            {state.participants.map((p, i) => (
              <div key={i} style={ps.pCard}>
                <div style={ps.pName}>Participant {i + 1}</div>
                <div style={ps.fieldLbl}>Enjoyed</div><div style={ps.fieldVal}>{p.enjoyed}</div>
                <div style={ps.fieldLbl}>Confused by</div><div style={ps.fieldVal}>{p.confused}</div>
                <div style={ps.fieldLbl}>Suggested improvements</div><div style={{ ...ps.fieldVal, marginBottom: 0 }}>{p.improve}</div>
              </div>
            ))}

            <div style={ps.h2}>Pattern Analysis</div>
            <div style={ps.fieldLbl}>Problem areas identified</div>
            <div style={{ marginBottom: state.problemAreaOther ? 8 : 12 }}>{state.problemArea.map(a => <span key={a} style={ps.areaBadge}>{a}</span>)}</div>
            {state.problemAreaOther && <div style={{ ...ps.fieldVal, marginBottom: 12 }}>{state.problemAreaOther}</div>}
            <div style={ps.fieldLbl}>Peak engagement moment</div>
            <div style={ps.fieldVal}>{state.mostEnjoyed}</div>
            <div style={ps.fieldLbl}>Player friction level</div>
            <div style={ps.fieldVal}>{state.severity}</div>
            {state.surprises === "Yes" && <><div style={ps.fieldLbl}>Surprises</div><div style={ps.fieldVal}>{state.surprisesDetail}</div></>}

            <div style={ps.h2}>Key Findings</div>
            <p style={ps.p}>{state.keyFindings}</p>

            <div style={ps.h2}>Recommendations</div>
            {sortedRecs.map((r, i) => (
              <div key={r.id} style={{ display: "flex", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={ps.badge(r.priority)}>{r.priority}</span>
                <p style={{ ...ps.p, margin: 0, flex: 1 }}>{r.text}</p>
              </div>
            ))}

            <div style={ps.h2}>Reflection</div>
            <div style={ps.fieldLbl}>Did the session meet its objective?</div>
            <div style={ps.fieldVal}>{state.objectiveMet}{state.objectiveDetail && ` — ${state.objectiveDetail}`}</div>

            <div style={ps.pcBox}>
              <strong>Performance Criteria covered:</strong> 4.1 Gather feedback through various methods · 4.2 Analyse feedback to identify patterns and areas for improvement · 4.3 Share findings and recommendations with the development team · 4.4 Document observations clearly
            </div>

            <div style={ps.footer}>
              <span>Youth Options — QA for Gaming Micro-credential Series</span>
              <span>Generated {new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isLastStep = stepIdx === steps.length - 1;

  return (
    <div style={sx.root}>
      <style>{`@media print { body * { visibility: hidden !important; } #print-zone, #print-zone * { visibility: visible !important; } #print-zone { position: absolute; left: 0; top: 0; width: 100%; padding: 32px; box-shadow: none !important; border-radius: 0 !important; } }`}</style>
      {showReport && <Report />}

      {/* Header */}
      <div style={sx.header}>
        <div style={sx.logoWrap}>
          <div style={sx.logoBadge}>YO · QA</div>
          <div>
            <div style={sx.logoText}>Playtest Analysis Tool</div>
            <div style={sx.logoSub}>Lead Gameplay Tester · Step 4</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button style={{ ...sx.btnDanger, fontSize: 11, padding: "5px 10px" }} onClick={reset}>Clear Form</button>
          <button style={sx.themeBtn} onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}>{theme === "dark" ? "☀ Light" : "☾ Dark"}</button>
        </div>
      </div>

      {/* Progress */}
      <div style={sx.progressWrap}><div style={sx.progressFill} /></div>

      {/* Body */}
      <div style={sx.body}>
        {renderStep()}

        <div style={sx.navRow}>
          <div>{stepIdx > 0 && <button style={sx.btnBack} onClick={back}>← Back</button>}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!done && <div style={{ fontSize: 12, color: T.textDim }}>Complete this step to continue</div>}
            {isLastStep && done
              ? <button style={sx.btnPrimary(false)} onClick={() => setShowReport(true)}>Generate Report →</button>
              : <button style={sx.btnPrimary(!done)} disabled={!done} onClick={next}>Next →</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
