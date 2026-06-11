import React, { useState, useEffect } from "react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

// Each focus angle carries a plain-language descriptor (what a session like this
// looks like) and a few starter goals the learner can add and edit. This is the
// copy reviewed for the cohort.
const FOCUS_DESCRIPTORS = {
  "Fun factor & enjoyment": {
    emoji: "🎉",
    descriptor: "A session like this watches for the moments players smile, laugh, or lean in, and the moments they get bored or check out. You're testing whether the game is actually fun to play.",
    goals: ["Where do players have the most fun?", "Is there a point where they lose interest?", "Would they want to play again?"],
  },
  "Difficulty curve & balance": {
    emoji: "⚖️",
    descriptor: "This session looks at how hard the game feels and whether that's fair. You watch where players get stuck, count how many tries a tough bit takes, and notice whether losing feels earned or cheap.",
    goals: ["Where do players get stuck?", "Does the difficulty ramp up too fast or too slow?", "Does losing feel fair?"],
  },
  "UI clarity & navigation": {
    emoji: "🧭",
    descriptor: "Here you watch whether players can find their way around: menus, buttons, icons. You're looking for the \"wait, where do I go?\" and \"what does this button do?\" moments.",
    goals: ["Can players find what they need without help?", "Are any icons or labels confusing?", "Do they ever get lost in the menus?"],
  },
  "Accessibility & inclusivity": {
    emoji: "♿",
    descriptor: "This session checks whether different kinds of players can comfortably play: text size, colour, controls, sound. You notice anything that would shut someone out.",
    goals: ["Is the text easy to read?", "Can the game be played without relying on colour or sound alone?", "Are the controls comfortable for different players?"],
  },
  "Tutorial effectiveness": {
    emoji: "🎓",
    descriptor: "You watch how players learn the game at the start. Does the tutorial actually teach them, or do they reach the real game still confused?",
    goals: ["Do players understand the controls after the tutorial?", "Do they skip or rush through it?", "What do they still get wrong afterwards?"],
  },
  "Multiplayer / social dynamics": {
    emoji: "👥",
    descriptor: "This session looks at how players behave together: cooperating, competing, talking, waiting. You watch the social side, not just the solo play.",
    goals: ["Do players enjoy playing together?", "Is anyone left waiting or left out?", "Does competition stay friendly?"],
  },
  "Pacing & session length": {
    emoji: "⏱️",
    descriptor: "Here you pay attention to the rhythm: the fast bits, the slow bits, and how long players stay engaged before they flag. You're testing whether the game holds attention for the right amount of time.",
    goals: ["When does attention start to drop?", "Are there slow patches that drag?", "Is a play session the right length?"],
  },
  "Visual / audio feedback": {
    emoji: "✨",
    descriptor: "This session checks whether the game clearly tells players what's happening: the sounds, flashes, and animations when you hit something, score, or fail. You watch for moments players miss because the game didn't signal them.",
    goals: ["Do players notice when something important happens?", "Is any feedback too quiet or easy to miss?", "Does the sound or visual match the action?"],
  },
  "Onboarding experience": {
    emoji: "👋",
    descriptor: "You watch the very first few minutes, from opening the game to actually playing. You're testing whether new players feel welcomed and oriented, or lost and overwhelmed.",
    goals: ["How do players feel in the first five minutes?", "Is anything overwhelming at the start?", "Do they know what to do first?"],
  },
  "Replayability": {
    emoji: "🔁",
    descriptor: "This session asks whether players would come back. You watch whether they want another go, and listen for what would or wouldn't pull them back in.",
    goals: ["Would players play again?", "What would make them come back?", "Does it feel different or stale the second time?"],
  },
};

const FOCUS_ANGLES = Object.keys(FOCUS_DESCRIPTORS);
const QUESTION_TYPES = ["Rating (1–5)", "Yes / No", "Multiple Choice", "Open Answer"];
const RISK_SUGGESTIONS = [
  "Participants may not be familiar with the game",
  "Session runs over time",
  "Technical issues with the game or hardware",
  "Participants may have different skill levels",
  "Some questions may be unclear or confusing",
  "Low engagement if the game isn't appealing to participants",
  "Feedback may be vague without prompting",
];

// Optional, game-like prompts that nudge learners to think about their choice and
// talk it over with a facilitator or peer. Prototype lives on the Focus step.
const FOCUS_CHALLENGES = [
  { emoji: "🔮", title: "Make a prediction", body: "Predict one bug or problem you think this focus will uncover. Jot it down now, then check at the end of your session: were you right?", write: true },
  { emoji: "🗣️", title: "One-sentence pitch", body: "Explain your focus to a teammate in a single sentence. If they get it straight away, you have nailed it." },
  { emoji: "🎯", title: "The why", body: "Tell your facilitator why this focus matters for THIS game, not just any game." },
  { emoji: "🕵️", title: "Spot the difference", body: "Compare your goals with a partner's. Did you pick different things to look for? Talk about why." },
  { emoji: "⚡", title: "Quick fire", body: "Without looking back at your goals, name the one thing you most want to find out today." },
];

const CAPTURE_METHODS = [
  { key: "questionnaire", emoji: "📝", label: "Questionnaire or survey" },
  { key: "observation", emoji: "🔍", label: "Observation notes" },
  { key: "video", emoji: "🎥", label: "Video review" },
  { key: "interview", emoji: "🗣️", label: "Interview or group chat" },
];

const INTERVIEW_STARTERS = [
  "What was the best part for you?",
  "Was anything confusing or frustrating?",
  "Would you play again? Why or why not?",
  "If you could change one thing, what would it be?",
];

const OBSERVATION_STARTERS = [
  "What do players do first?",
  "Where do players pause or hesitate?",
  "Where do players get stuck or confused?",
  "What makes players smile or react?",
  "Any moments of frustration?",
  "Do players read or skip the instructions?",
];

const SETUP_HINTS = {
  "Difficulty curve & balance": "Set the game to the difficulty or level you want to test.",
  "Multiplayer / social dynamics": "Make sure there are enough seats and devices for everyone playing at once.",
  "Accessibility & inclusivity": "Set up any assistive options before players arrive (text size, colour, audio).",
  "Tutorial effectiveness": "Start from a fresh save so players see the tutorial from the start.",
  "Onboarding experience": "Start from a fresh save so players see the very first few minutes.",
  "Pacing & session length": "Decide how long players get before a check-in or break.",
  "Visual / audio feedback": "Check the sound works, and have headphones or speakers ready.",
  "UI clarity & navigation": "Have the game open somewhere players can explore the menus.",
  "Replayability": "Allow time for a second go if you can.",
  "Fun factor & enjoyment": "Keep the space relaxed so players feel free to react honestly.",
};

const STEPS = [
  { key: "game", title: "The game" },
  { key: "focus", title: "Focus & goals" },
  { key: "capture", title: "Capturing data" },
  { key: "setup", title: "Session setup" },
  { key: "risks", title: "Risks" },
  { key: "summary", title: "Summary" },
];

const STORAGE_KEY = "qa-playtest-planner-v4";

// ---------------------------------------------------------------------------
// Safe storage: wrapped so the tool still runs where localStorage is blocked
// (e.g. a sandboxed preview). Persistence works on the live deploy.
// ---------------------------------------------------------------------------
function storageAvailable() {
  try {
    const k = "__qa_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch { return false; }
}
function loadSaved() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveState(data) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* no-op */ }
}
function clearSaved() {
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* no-op */ }
}

// ---------------------------------------------------------------------------
// Small shared components (module scope so inputs never remount/lose focus)
// ---------------------------------------------------------------------------
const labelStyle = { fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" };

function TextInput({ value, onChange, placeholder, multiline, rows = 3 }) {
  const base = {
    width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "10px", padding: "12px 14px", color: "#f1f5f9", fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", resize: "vertical",
  };
  return multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={base} />
    : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />;
}

function Tag({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: selected ? "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.3))" : "rgba(255,255,255,0.05)",
      border: selected ? "1px solid rgba(167,139,250,0.6)" : "1px solid rgba(255,255,255,0.12)",
      borderRadius: "999px", color: selected ? "#e9d5ff" : "#cbd5e1", padding: "8px 16px",
      fontSize: "13px", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.15s",
    }}>{selected ? "✓ " : ""}{label}</button>
  );
}

// Optional "tester challenge" deck. Drawn state is lifted to the parent so a drawn
// card and any prediction survive step navigation and save/resume.
function ChallengeCard({ deck, drawn, idx, onDraw, prediction, onPrediction }) {
  const card = deck[idx];
  return (
    <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.10))", border: "1px solid rgba(167,139,250,0.4)", borderRadius: "16px", padding: "18px 20px", marginTop: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "12px" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", letterSpacing: "0.08em", color: "#e9d5ff" }}>🎴 TESTER CHALLENGE</span>
        <span style={{ fontSize: "11px", color: "#94a3b8" }}>optional, just for fun</span>
      </div>
      {!drawn ? (
        <button onClick={onDraw} style={{ width: "100%", background: "rgba(0,0,0,0.25)", border: "1px dashed rgba(167,139,250,0.5)", borderRadius: "12px", color: "#e9d5ff", padding: "22px", fontSize: "15px", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
          🎴 Tap to draw a card
        </button>
      ) : (
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>{card.emoji} {card.title}</div>
          <p style={{ margin: "0 0 12px", fontSize: "14px", color: "#e2e8f0", lineHeight: 1.6 }}>{card.body}</p>
          {card.write && (
            <textarea value={prediction} onChange={e => onPrediction(e.target.value)} placeholder="Jot your prediction here…" rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", padding: "10px 12px", color: "#f1f5f9", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", resize: "vertical", marginBottom: "12px" }} />
          )}
          <button onClick={onDraw} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "8px", color: "#cbd5e1", padding: "8px 16px", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>🔀 Draw another</button>
        </div>
      )}
    </div>
  );
}

// A simple plus/minus stepper for numeric fields.
function Stepper({ value, onChange, step = 1, min = 0, suffix }) {
  const btn = { width: "44px", height: "44px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)", color: "#e2e8f0", fontSize: "22px", cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <button onClick={() => onChange(Math.max(min, value - step))} aria-label="Decrease" style={btn}>−</button>
      <div style={{ minWidth: "96px", textAlign: "center", fontSize: "20px", fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#f1f5f9" }}>{value}{suffix ? ` ${suffix}` : ""}</div>
      <button onClick={() => onChange(value + step)} aria-label="Increase" style={btn}>+</button>
    </div>
  );
}

// A small coloured reflection note shown under a field.
function Reflect({ tone = "info", children }) {
  const tones = {
    good: { bg: "rgba(134,239,172,0.08)", border: "rgba(134,239,172,0.35)", color: "#86efac" },
    warn: { bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.3)", color: "#fcd34d" },
    alert: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.35)", color: "#fca5a5" },
    info: { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.3)", color: "#c4b5fd" },
  };
  const t = tones[tone] || tones.info;
  return <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: "10px", padding: "10px 14px", marginTop: "10px", fontSize: "13px", color: t.color, lineHeight: 1.6 }}>{children}</div>;
}

// Clean, light-themed artefact shown ONLY when printing / saving as PDF.
function PrintableArtefact({ learnerName, game, focus, goals, session, captureMethods, questions, observations, video, interview, risks, createdDate }) {
  const sectionTitle = { fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#555", fontWeight: 700, margin: "0 0 6px", borderBottom: "1px solid #ccc", paddingBottom: "3px" };
  const sectionWrap = { marginBottom: "16px", breakInside: "avoid" };
  const empty = <span style={{ color: "#999", fontStyle: "italic" }}>Not completed</span>;
  return (
    <div className="print-only" style={{ fontFamily: "'Atkinson Hyperlegible', sans-serif", color: "#1a1a1a", background: "#fff", fontSize: "13px", lineHeight: 1.55 }}>
      <div style={{ borderBottom: "2px solid #1a1a1a", paddingBottom: "10px", marginBottom: "18px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#666" }}>QA for Gaming Micro-credential · Playtest Plan</div>
        <h1 style={{ margin: "6px 0 0", fontSize: "24px", fontWeight: 700 }}>{game.title || "Untitled Playtest"}</h1>
        <div style={{ marginTop: "8px", fontSize: "13px" }}>
          <strong>Name:</strong> {learnerName || "______________________"}
          <span style={{ display: "inline-block", width: "24px" }} />
          <strong>Session date:</strong> {session.date || "____________"}
        </div>
      </div>

      <div style={sectionWrap}>
        <div style={sectionTitle}>The Game</div>
        {game.title ? (
          <div><strong>{game.title}</strong>{game.platform ? `, ${game.platform}` : ""}{game.genre ? ` (${game.genre})` : ""}
            {game.description && <div style={{ marginTop: "4px" }}>{game.description}</div>}</div>
        ) : empty}
      </div>

      <div style={sectionWrap}>
        <div style={sectionTitle}>Focus Angle</div>
        {focus.length ? focus.join(", ") : empty}
      </div>

      <div style={sectionWrap}>
        <div style={sectionTitle}>Session Goals</div>
        {goals.length ? <ul style={{ margin: "4px 0 0", paddingLeft: "20px" }}>{goals.map((g, i) => <li key={i}>{g}</li>)}</ul> : empty}
      </div>

      <div style={sectionWrap}>
        <div style={sectionTitle}>Capturing Player Data</div>
        {captureMethods && captureMethods.length ? (
          <div>
            {captureMethods.includes("questionnaire") && questions.length > 0 && (<div style={{ marginBottom: "6px" }}><em>Questionnaire</em><ol style={{ margin: "2px 0 0", paddingLeft: "20px" }}>{questions.map((q, i) => <li key={i}>{q.text} <span style={{ color: "#666" }}>[{q.type}]</span></li>)}</ol></div>)}
            {captureMethods.includes("observation") && observations.length > 0 && (<div style={{ marginBottom: "6px" }}><em>Observation notes</em><ul style={{ margin: "2px 0 0", paddingLeft: "20px" }}>{observations.map((o, i) => <li key={i}>{o}</li>)}</ul></div>)}
            {captureMethods.includes("video") && (video.record || video.moments) && (<div style={{ marginBottom: "6px" }}><em>Video review</em>{video.record && <div>Record: {video.record}</div>}{video.moments && <div>Moments: {video.moments}</div>}</div>)}
            {captureMethods.includes("interview") && interview.length > 0 && (<div style={{ marginBottom: "6px" }}><em>Interview / group chat</em><ul style={{ margin: "2px 0 0", paddingLeft: "20px" }}>{interview.map((o, i) => <li key={i}>{o}</li>)}</ul></div>)}
          </div>
        ) : empty}
      </div>

      <div style={sectionWrap}>
        <div style={sectionTitle}>Session Setup</div>
        {(session.date || session.duration || session.players || session.environment) ? (
          <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>
            {[["Date", session.date], ["Duration", session.duration ? `${session.duration} min` : ""], ["Playtest runs", session.players ? `${session.players}` : ""], ["Environment", session.environment]]
              .filter(([, v]) => v).map(([k, v]) => (
                <tr key={k}><td style={{ padding: "2px 12px 2px 0", color: "#666", width: "120px", verticalAlign: "top" }}>{k}</td><td style={{ padding: "2px 0" }}>{v}</td></tr>
              ))}
          </tbody></table>
        ) : empty}
      </div>

      <div style={sectionWrap}>
        <div style={sectionTitle}>Risks & Considerations</div>
        {risks.length ? <ul style={{ margin: "4px 0 0", paddingLeft: "20px" }}>{risks.map((r, i) => <li key={i} style={{ marginBottom: "4px" }}>{r.text}{r.plan ? <div style={{ color: "#555", fontSize: "12px" }}>Plan: {r.plan}</div> : null}</li>)}</ul> : empty}
      </div>

      <div style={{ marginTop: "24px", paddingTop: "10px", borderTop: "1px solid #ccc", fontSize: "11px", color: "#777", display: "flex", justifyContent: "space-between" }}>
        <span>Youth Options · QA for Gaming Micro-credential Series</span>
        <span>Plan created {createdDate}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function PlaytestPlanner() {
  const [initial] = useState(() => loadSaved() || {});
  const [canSave] = useState(() => storageAvailable());

  const [step, setStep] = useState(initial.step ?? 0);
  const [game, setGame] = useState(initial.game ?? { title: "", platform: "", genre: "", description: "" });
  const [focus, setFocus] = useState(initial.focus ?? []);
  const [customFocus, setCustomFocus] = useState(initial.customFocus ?? "");
  const [goals, setGoals] = useState(initial.goals ?? []);
  const [customGoal, setCustomGoal] = useState("");
  const [questions, setQuestions] = useState(initial.questions ?? [{ text: "", type: "Open Answer" }]);
  const [captureMethods, setCaptureMethods] = useState(initial.captureMethods ?? []);
  const [observations, setObservations] = useState(initial.observations ?? []);
  const [customObservation, setCustomObservation] = useState("");
  const [video, setVideo] = useState(initial.video ?? { record: "", moments: "" });
  const [interviewPrompts, setInterviewPrompts] = useState(initial.interviewPrompts ?? []);
  const [customInterview, setCustomInterview] = useState("");
  const [session, setSession] = useState({ date: "", duration: "", players: "", environment: "", locationType: "", ...(initial.session || {}) });
  const [risks, setRisks] = useState(() => (initial.risks ?? []).map(r => typeof r === "string" ? { text: r, plan: "" } : r));
  const [customRisk, setCustomRisk] = useState(initial.customRisk ?? "");
  const [learnerName, setLearnerName] = useState(initial.learnerName ?? "");
  const [prediction, setPrediction] = useState(initial.prediction ?? "");
  const [challengeDrawn, setChallengeDrawn] = useState(initial.challengeDrawn ?? false);
  const [challengeIdx, setChallengeIdx] = useState(initial.challengeIdx ?? 0);
  const [copyState, setCopyState] = useState("idle"); // idle | copied | manual
  const [manualText, setManualText] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  // Auto-save whenever the plan changes.
  useEffect(() => {
    if (!canSave) return;
    saveState({ step, game, focus, customFocus, goals, questions, captureMethods, observations, video, interviewPrompts, session, risks, learnerName, prediction, challengeDrawn, challengeIdx });
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1200);
    return () => clearTimeout(t);
  }, [step, game, focus, customFocus, goals, questions, captureMethods, observations, video, interviewPrompts, session, risks, learnerName, prediction, challengeDrawn, challengeIdx, canSave]);

  // Derived
  const allFocus = [...focus, ...(customFocus.trim() ? [customFocus.trim()] : [])];
  const filledGoals = goals.filter(g => g.trim());
  const filledQuestions = questions.filter(q => q.text.trim());
  const filledObservations = observations.filter(o => o.trim());
  const filledInterview = interviewPrompts.filter(o => o.trim());
  const hasVideo = !!(video.record.trim() || video.moments.trim());
  const captureHasContent = (captureMethods.includes("questionnaire") && filledQuestions.length > 0) || (captureMethods.includes("observation") && filledObservations.length > 0) || (captureMethods.includes("video") && hasVideo) || (captureMethods.includes("interview") && filledInterview.length > 0);
  const focusObservationSeeds = focus.flatMap(f => (FOCUS_DESCRIPTORS[f] ? FOCUS_DESCRIPTORS[f].goals : []));
  const observationSeeds = [...new Set([...focusObservationSeeds, ...OBSERVATION_STARTERS])];
  const setupHints = [...new Set(focus.map(f => SETUP_HINTS[f]).filter(Boolean))];
  const playerCount = Number(session.players) || 0;
  const durationMin = Number(session.duration) || 0;
  const methodBlock = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "18px", marginTop: "16px" };
  const methodHead = { fontSize: "15px", fontWeight: 700, marginBottom: "12px", color: "#e9d5ff" };
  const capSub = { fontSize: "12px", color: "#7c3aed", fontFamily: "'DM Mono', monospace", marginBottom: "4px", marginTop: "8px" };
  const captureNode = (
    <div>
      {captureMethods.includes("questionnaire") && filledQuestions.length > 0 && (<div><div style={capSub}>Questionnaire</div><ol style={{ margin: "0 0 6px", paddingLeft: "20px" }}>{filledQuestions.map((q, i) => <li key={i} style={{ marginBottom: "4px" }}>{q.text} <span style={{ fontSize: "11px", color: "#7c3aed", fontFamily: "'DM Mono', monospace", background: "rgba(124,58,237,0.15)", padding: "2px 8px", borderRadius: "4px" }}>{q.type}</span></li>)}</ol></div>)}
      {captureMethods.includes("observation") && filledObservations.length > 0 && (<div><div style={capSub}>Observation notes</div><ul style={{ margin: "0 0 6px", paddingLeft: "20px" }}>{filledObservations.map((o, i) => <li key={i} style={{ marginBottom: "4px" }}>{o}</li>)}</ul></div>)}
      {captureMethods.includes("video") && hasVideo && (<div><div style={capSub}>Video review</div>{video.record && <div>Record: {video.record}</div>}{video.moments && <div>Moments: {video.moments}</div>}</div>)}
      {captureMethods.includes("interview") && filledInterview.length > 0 && (<div><div style={capSub}>Interview / group chat</div><ul style={{ margin: "0 0 6px", paddingLeft: "20px" }}>{filledInterview.map((o, i) => <li key={i} style={{ marginBottom: "4px" }}>{o}</li>)}</ul></div>)}
    </div>
  );
  const createdDate = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

  const stepDone = {
    game: game.title.trim().length > 0,
    focus: allFocus.length > 0 && filledGoals.length > 0,
    capture: captureHasContent,
    setup: !!(session.date || session.duration || session.players || session.environment),
    risks: risks.length > 0,
    summary: true,
  };

  const currentKey = STEPS[step].key;

  // Handlers
  const toggleFocus = (f) => setFocus(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  const toggleRisk = (r) => setRisks(prev => prev.some(x => x.text === r) ? prev.filter(x => x.text !== r) : [...prev, { text: r, plan: "" }]);
  const updateRiskPlan = (i, val) => setRisks(prev => prev.map((r, j) => j === i ? { ...r, plan: val } : r));
  const removeRisk = (i) => setRisks(prev => prev.filter((_, j) => j !== i));
  const addCustomRisk = () => { const t = customRisk.trim(); if (t && !risks.some(r => r.text === t)) { setRisks(prev => [...prev, { text: t, plan: "" }]); setCustomRisk(""); } };
  const addGoal = (text) => { const t = text.trim(); if (t && !goals.includes(t)) setGoals(prev => [...prev, t]); };
  const updateGoal = (i, val) => setGoals(prev => prev.map((g, j) => j === i ? val : g));
  const removeGoal = (i) => setGoals(prev => prev.filter((_, j) => j !== i));
  const updateQuestion = (i, field, val) => setQuestions(prev => prev.map((q, j) => j === i ? { ...q, [field]: val } : q));
  const toggleCapture = (k) => setCaptureMethods(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  const addObservation = (text) => { const t = text.trim(); if (t && !observations.includes(t)) setObservations(prev => [...prev, t]); };
  const updateObservation = (i, val) => setObservations(prev => prev.map((o, j) => j === i ? val : o));
  const removeObservation = (i) => setObservations(prev => prev.filter((_, j) => j !== i));
  const updateVideo = (field, val) => setVideo(prev => ({ ...prev, [field]: val }));
  const addInterview = (text) => { const t = text.trim(); if (t && !interviewPrompts.includes(t)) setInterviewPrompts(prev => [...prev, t]); };
  const updateInterview = (i, val) => setInterviewPrompts(prev => prev.map((o, j) => j === i ? val : o));
  const removeInterview = (i) => setInterviewPrompts(prev => prev.filter((_, j) => j !== i));

  const drawCard = () => {
    setChallengeIdx(prev => {
      const len = FOCUS_CHALLENGES.length;
      if (len < 2) return 0;
      let n = Math.floor(Math.random() * len);
      if (challengeDrawn) { while (n === prev) n = Math.floor(Math.random() * len); }
      return n;
    });
    setChallengeDrawn(true);
  };

  const startOver = () => {
    if (!window.confirm("Start a new plan? This clears the plan saved on this device.")) return;
    clearSaved();
    setStep(0); setGame({ title: "", platform: "", genre: "", description: "" });
    setFocus([]); setCustomFocus(""); setGoals([]); setCustomGoal("");
    setQuestions([{ text: "", type: "Open Answer" }]);
    setSession({ date: "", duration: "", players: "", environment: "" });
    setRisks([]); setCustomRisk(""); setLearnerName("");
    setPrediction(""); setChallengeDrawn(false); setChallengeIdx(0);
    setCaptureMethods([]); setObservations([]); setCustomObservation(""); setVideo({ record: "", moments: "" }); setInterviewPrompts([]); setCustomInterview("");
  };

  const buildPlanText = () => {
    const L = [];
    L.push("PLAYTEST PLAN");
    L.push("QA for Gaming Micro-credential Series");
    L.push("");
    L.push(`Name: ${learnerName || "(not set)"}`);
    L.push(`Game: ${game.title || "(not set)"}${game.platform ? ` (${game.platform})` : ""}${game.genre ? `, ${game.genre}` : ""}`);
    if (game.description) L.push(`Description: ${game.description}`);
    L.push("");
    L.push(`FOCUS ANGLE: ${allFocus.length ? allFocus.join(", ") : "(none)"}`);
    L.push("");
    L.push("SESSION GOALS:");
    filledGoals.length ? filledGoals.forEach((g, i) => L.push(`  ${i + 1}. ${g}`)) : L.push("  (none)");
    L.push("");
    L.push("CAPTURING PLAYER DATA:");
    if (captureMethods.length === 0) L.push("  (no method chosen yet)");
    if (captureMethods.includes("questionnaire")) { L.push("  Questionnaire:"); filledQuestions.length ? filledQuestions.forEach((q, i) => L.push(`    ${i + 1}. ${q.text} [${q.type}]`)) : L.push("    (no questions yet)"); }
    if (captureMethods.includes("observation")) { L.push("  Observation notes:"); filledObservations.length ? filledObservations.forEach(o => L.push(`    - ${o}`)) : L.push("    (none yet)"); }
    if (captureMethods.includes("video")) { L.push("  Video review:"); if (video.record) L.push(`    Record: ${video.record}`); if (video.moments) L.push(`    Moments: ${video.moments}`); if (!hasVideo) L.push("    (none yet)"); }
    if (captureMethods.includes("interview")) { L.push("  Interview / group chat:"); filledInterview.length ? filledInterview.forEach(o => L.push(`    - ${o}`)) : L.push("    (none yet)"); }
    L.push("");
    L.push("SESSION SETUP:");
    L.push(`  Date: ${session.date || "(not set)"}`);
    L.push(`  Duration: ${session.duration ? session.duration + " min" : "(not set)"}`);
    L.push(`  Playtest runs: ${session.players ? session.players : "(not set)"}`);
    L.push(`  Environment: ${session.environment || "(not set)"}`);
    L.push("");
    L.push("RISKS & CONSIDERATIONS:");
    risks.length ? risks.forEach(r => { L.push(`  - ${r.text}`); if (r.plan) L.push(`      Plan: ${r.plan}`); }) : L.push("  (none)");
    L.push("");
    L.push(`Plan created ${createdDate} · Youth Options`);
    return L.join("\n");
  };

  const handlePrint = () => window.print();
  const handleCopy = async () => {
    const text = buildPlanText();
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      setManualText(text);
      setCopyState("manual");
    }
  };

  // Shared bits
  const card = {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px", padding: "28px",
  };
  const stepHeading = (t, sub) => (
    <div style={{ marginBottom: "20px" }}>
      <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>{t}</h2>
      {sub && <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );

  return (
    <>
    <div className="screen-only" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b2a 100%)",
      color: "#f1f5f9", fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #64748b; }
        input:focus, textarea:focus { border-color: rgba(139,92,246,0.6) !important; }
        select { appearance: none; }
        option { color: #1a1a1a; background: #ffffff; }
        a { color: #c4b5fd; }
        button:focus-visible, a:focus-visible { outline: 2px solid #a78bfa; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
        .print-only { display: none; }
        @media print {
          .screen-only { display: none !important; }
          .print-only { display: block !important; }
          @page { margin: 16mm; }
          body { background: #fff !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "18px 24px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#7c3aed", fontFamily: "'DM Mono', monospace", marginBottom: "4px", textTransform: "uppercase" }}>QA Training // Playtest Module</div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, background: "linear-gradient(90deg, #e2e8f0, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Playtest Planner</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {canSave && (
              <span style={{ fontSize: "11px", color: savedFlash ? "#86efac" : "#475569", fontFamily: "'DM Mono', monospace", transition: "color 0.3s" }}>
                {savedFlash ? "✓ Saved" : "Saved on this device"}
              </span>
            )}
            <button onClick={startOver} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#94a3b8", padding: "6px 14px", fontSize: "12px", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>Start over</button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "20px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <div style={{ fontSize: "13px", color: "#c4b5fd", fontFamily: "'DM Mono', monospace" }}>Step {step + 1} of {STEPS.length}: {STEPS[step].title}</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {STEPS.map((s, i) => {
            const done = stepDone[s.key] && i < step;
            const active = i === step;
            return (
              <button key={s.key} onClick={() => setStep(i)} title={s.title} aria-label={`Step ${i + 1}: ${s.title}`} style={{
                flex: 1, height: "8px", borderRadius: "999px", border: "none", cursor: "pointer",
                background: active ? "linear-gradient(90deg, #7c3aed, #4f46e5)" : done ? "rgba(134,239,172,0.5)" : "rgba(255,255,255,0.12)",
              }} />
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px" }}>

        {currentKey === "game" && (
          <div style={card}>
            {stepHeading("What are you testing?", "Start with the game and the part of it you'll be playtesting.")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div><label style={labelStyle}>GAME TITLE *</label><TextInput value={game.title} onChange={v => setGame({ ...game, title: v })} placeholder="e.g. Hollow Knight" /></div>
              <div><label style={labelStyle}>PLATFORM</label><TextInput value={game.platform} onChange={v => setGame({ ...game, platform: v })} placeholder="e.g. PC, Switch" /></div>
            </div>
            <div style={{ marginBottom: "12px" }}><label style={labelStyle}>GENRE</label><TextInput value={game.genre} onChange={v => setGame({ ...game, genre: v })} placeholder="e.g. Platformer" /></div>
            <div><label style={labelStyle}>WHAT PART ARE YOU TESTING?</label><TextInput multiline rows={3} value={game.description} onChange={v => setGame({ ...game, description: v })} placeholder="Which build, level, or feature is this session about?" /></div>
          </div>
        )}

        {currentKey === "focus" && (
          <div style={card}>
            {stepHeading("Focus & goals", "Pick what you're looking at this session. Each choice shows what that kind of testing looks like, then you decide what you want to find out.")}
            <label style={labelStyle}>CHOOSE YOUR FOCUS (ONE OR TWO WORKS BEST)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
              {FOCUS_ANGLES.map(f => <Tag key={f} label={`${FOCUS_DESCRIPTORS[f].emoji} ${f}`} selected={focus.includes(f)} onClick={() => toggleFocus(f)} />)}
            </div>
            <div style={{ marginBottom: "20px" }}>
              <TextInput value={customFocus} onChange={setCustomFocus} placeholder="Or add your own focus…" />
            </div>

            {/* Descriptors + starter goals for each selected focus */}
            {focus.map(f => {
              const d = FOCUS_DESCRIPTORS[f];
              return (
                <div key={f} style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "12px", padding: "16px 18px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>{d.emoji} {f}</div>
                  <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>{d.descriptor}</p>
                  <div style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "'DM Mono', monospace", marginBottom: "8px" }}>TAP TO ADD A GOAL:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {d.goals.map(g => (
                      <button key={g} onClick={() => addGoal(g)} disabled={goals.includes(g)} style={{
                        background: goals.includes(g) ? "rgba(134,239,172,0.12)" : "rgba(255,255,255,0.05)",
                        border: goals.includes(g) ? "1px solid rgba(134,239,172,0.4)" : "1px dashed rgba(255,255,255,0.25)",
                        borderRadius: "8px", color: goals.includes(g) ? "#86efac" : "#cbd5e1", padding: "8px 12px",
                        fontSize: "13px", fontFamily: "'DM Sans', sans-serif", cursor: goals.includes(g) ? "default" : "pointer", textAlign: "left",
                      }}>{goals.includes(g) ? "✓ " : "+ "}{g}</button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* The goals list */}
            <div style={{ marginTop: "8px" }}>
              <label style={labelStyle}>WHAT DO YOU WANT TO FIND OUT? *</label>
              {goals.length === 0 && <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 10px" }}>Add a goal from above, or write your own below.</p>}
              {goals.map((g, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <TextInput value={g} onChange={v => updateGoal(i, v)} placeholder="What do you want to learn?" />
                  <button onClick={() => removeGoal(i)} aria-label="Remove goal" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#fca5a5", padding: "0 14px", cursor: "pointer" }}>✕</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <TextInput value={customGoal} onChange={setCustomGoal} placeholder="Write your own goal…" />
                <button onClick={() => { addGoal(customGoal); setCustomGoal(""); }} style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(139,92,246,0.5)", borderRadius: "8px", color: "#e9d5ff", padding: "0 18px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>+ Add</button>
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "12px 0 0", lineHeight: 1.6 }}>
                Want to tackle your goals one at a time? <a href="https://goblin.tools/Taskmaster" target="_blank" rel="noopener noreferrer">goblin.tools Taskmaster</a> can help you focus.
              </p>
            </div>

            <ChallengeCard deck={FOCUS_CHALLENGES} drawn={challengeDrawn} idx={challengeIdx} onDraw={drawCard} prediction={prediction} onPrediction={setPrediction} />
          </div>
        )}

        {currentKey === "capture" && (
          <div style={card}>
            {stepHeading("Capturing player data", "How will you gather what players think and do? Pick one or more. You can mix methods.")}
            {filledGoals.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "14px 16px", marginBottom: "18px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "'DM Mono', monospace", marginBottom: "6px" }}>YOUR GOALS (CAPTURE DATA THAT ANSWERS THESE):</div>
                <ul style={{ margin: 0, paddingLeft: "18px", color: "#cbd5e1", fontSize: "13px", lineHeight: 1.7 }}>{filledGoals.map((g, i) => <li key={i}>{g}</li>)}</ul>
              </div>
            )}
            <label style={labelStyle}>HOW WILL YOU CAPTURE DATA? PICK ONE OR MORE</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
              {CAPTURE_METHODS.map(m => <Tag key={m.key} label={`${m.emoji} ${m.label}`} selected={captureMethods.includes(m.key)} onClick={() => toggleCapture(m.key)} />)}
            </div>
            {captureMethods.length === 0 && <p style={{ fontSize: "13px", color: "#64748b", margin: "6px 0 0" }}>Choose at least one way to capture what happens in your session.</p>}

            {captureMethods.includes("questionnaire") && (
              <div style={methodBlock}>
                <div style={methodHead}>📝 Questionnaire or survey</div>
                {questions.map((q, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}><TextInput value={q.text} onChange={v => updateQuestion(i, "text", v)} placeholder={`Question ${i + 1}`} /></div>
                    <select value={q.type} onChange={e => updateQuestion(i, "type", e.target.value)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", padding: "12px 10px", color: "#f1f5f9", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                      {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {questions.length > 1 && <button onClick={() => setQuestions(questions.filter((_, j) => j !== i))} aria-label="Remove question" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#fca5a5", padding: "12px", cursor: "pointer" }}>✕</button>}
                  </div>
                ))}
                <button onClick={() => setQuestions([...questions, { text: "", type: "Open Answer" }])} style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "10px", color: "#94a3b8", padding: "10px 20px", cursor: "pointer", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", marginTop: "4px" }}>+ Add question</button>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "14px 0 0", lineHeight: 1.6 }}>
                  Not sure what to ask? Break it down with <a href="https://goblin.tools/ToDo" target="_blank" rel="noopener noreferrer">goblin.tools Magic ToDo</a>.
                </p>
              </div>
            )}

            {captureMethods.includes("observation") && (
              <div style={methodBlock}>
                <div style={methodHead}>🔍 Observation notes</div>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 12px", lineHeight: 1.6 }}>What will you watch for while players play? Tap a suggestion, or add your own.{focusObservationSeeds.length > 0 ? " The first few come from your chosen focus." : ""}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  {observationSeeds.map(o => (
                    <button key={o} onClick={() => addObservation(o)} disabled={observations.includes(o)} style={{ background: observations.includes(o) ? "rgba(134,239,172,0.12)" : "rgba(255,255,255,0.05)", border: observations.includes(o) ? "1px solid rgba(134,239,172,0.4)" : "1px dashed rgba(255,255,255,0.25)", borderRadius: "8px", color: observations.includes(o) ? "#86efac" : "#cbd5e1", padding: "8px 12px", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", cursor: observations.includes(o) ? "default" : "pointer", textAlign: "left" }}>{observations.includes(o) ? "✓ " : "+ "}{o}</button>
                  ))}
                </div>
                {observations.map((o, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <TextInput value={o} onChange={v => updateObservation(i, v)} placeholder="Something to watch for…" />
                    <button onClick={() => removeObservation(i)} aria-label="Remove observation" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#fca5a5", padding: "0 14px", cursor: "pointer" }}>✕</button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <TextInput value={customObservation} onChange={setCustomObservation} placeholder="Add your own thing to watch for…" />
                  <button onClick={() => { addObservation(customObservation); setCustomObservation(""); }} style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(139,92,246,0.5)", borderRadius: "8px", color: "#e9d5ff", padding: "0 18px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>+ Add</button>
                </div>
              </div>
            )}

            {captureMethods.includes("video") && (
              <div style={methodBlock}>
                <div style={methodHead}>🎥 Video review</div>
                <div style={{ marginBottom: "12px" }}><label style={labelStyle}>WHAT WILL YOU RECORD?</label><TextInput value={video.record} onChange={v => updateVideo("record", v)} placeholder="e.g. the screen, the player's face, the audio" /></div>
                <div><label style={labelStyle}>WHICH MOMENTS WILL YOU LOOK BACK AT?</label><TextInput multiline rows={2} value={video.moments} onChange={v => updateVideo("moments", v)} placeholder="e.g. anywhere a player pauses, gets stuck, or reacts strongly" /></div>
              </div>
            )}

            {captureMethods.includes("interview") && (
              <div style={methodBlock}>
                <div style={methodHead}>🗣️ Interview or group chat</div>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 12px", lineHeight: 1.6 }}>Questions to ask out loud. Tap a starter, or add your own.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  {INTERVIEW_STARTERS.map(o => (
                    <button key={o} onClick={() => addInterview(o)} disabled={interviewPrompts.includes(o)} style={{ background: interviewPrompts.includes(o) ? "rgba(134,239,172,0.12)" : "rgba(255,255,255,0.05)", border: interviewPrompts.includes(o) ? "1px solid rgba(134,239,172,0.4)" : "1px dashed rgba(255,255,255,0.25)", borderRadius: "8px", color: interviewPrompts.includes(o) ? "#86efac" : "#cbd5e1", padding: "8px 12px", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", cursor: interviewPrompts.includes(o) ? "default" : "pointer", textAlign: "left" }}>{interviewPrompts.includes(o) ? "✓ " : "+ "}{o}</button>
                  ))}
                </div>
                {interviewPrompts.map((o, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <TextInput value={o} onChange={v => updateInterview(i, v)} placeholder="A question to ask…" />
                    <button onClick={() => removeInterview(i)} aria-label="Remove prompt" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#fca5a5", padding: "0 14px", cursor: "pointer" }}>✕</button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <TextInput value={customInterview} onChange={setCustomInterview} placeholder="Add your own question…" />
                  <button onClick={() => { addInterview(customInterview); setCustomInterview(""); }} style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(139,92,246,0.5)", borderRadius: "8px", color: "#e9d5ff", padding: "0 18px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>+ Add</button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentKey === "setup" && (
          <div style={card}>
            {stepHeading("Session setup", "The practical details: when, how long, who, and where.")}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>DATE</label>
              <TextInput value={session.date} onChange={v => setSession({ ...session, date: v })} placeholder="e.g. 14 June" />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>HOW LONG IS EACH RUN?</label>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 10px", lineHeight: 1.6 }}>How long will one player spend playing?</p>
              <Stepper value={durationMin} step={5} min={0} suffix="min" onChange={n => setSession({ ...session, duration: n })} />
              {durationMin > 0 && durationMin < 15 && <Reflect tone="warn">That might be too short for players to get into the game. Will they see enough to give useful feedback?</Reflect>}
              {durationMin >= 15 && durationMin <= 60 && <Reflect tone="good">A reasonable length for a focused run.</Reflect>}
              {durationMin > 60 && <Reflect tone="warn">That is a long stretch. Will players stay focused? Think about a break, and check it fits your session time.</Reflect>}
              {durationMin > 0 && (captureMethods.includes("questionnaire") || captureMethods.includes("interview")) && (
                <Reflect tone="info">Leave a few extra minutes at the end for players to complete your {captureMethods.includes("questionnaire") ? "questionnaire" : "interview"}.</Reflect>
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>HOW MANY PLAYTEST RUNS?</label>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 10px", lineHeight: 1.6 }}>Each player is one run of your playtest. The more runs you do, the more data you gather, and the clearer your results will be.</p>
              <Stepper value={playerCount} step={1} min={0} suffix={playerCount === 1 ? "run" : "runs"} onChange={n => setSession({ ...session, players: n })} />
              {playerCount > 0 && playerCount <= 2 && <Reflect tone="warn">Two runs or fewer is not much data. Will it be enough to spot patterns? If you can, try to fit in a few more.</Reflect>}
              {playerCount >= 3 && playerCount <= 7 && <Reflect tone="good">A solid number of runs for clearer results.</Reflect>}
              {playerCount >= 8 && playerCount <= 10 && <Reflect tone="warn">Heads up: the training room has 7 PCs, so 8 or more means running players in groups or spreading it across more time.</Reflect>}
              {playerCount > 10 && <Reflect tone="alert">That is a lot of runs. With only 7 PCs you will need groups or several sessions. Check the space and time really work.</Reflect>}
            </div>

            <label style={labelStyle}>WHERE WILL YOU TEST?</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              <button onClick={() => setSession({ ...session, locationType: "room", environment: "Training room" })} style={{ background: session.locationType === "room" ? "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.3))" : "rgba(255,255,255,0.05)", border: session.locationType === "room" ? "1px solid rgba(167,139,250,0.6)" : "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: session.locationType === "room" ? "#e9d5ff" : "#cbd5e1", padding: "12px 18px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>🏫 Training room</button>
              <button onClick={() => setSession({ ...session, locationType: "other", environment: session.environment === "Training room" ? "" : session.environment })} style={{ background: session.locationType === "other" ? "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.3))" : "rgba(255,255,255,0.05)", border: session.locationType === "other" ? "1px solid rgba(167,139,250,0.6)" : "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: session.locationType === "other" ? "#e9d5ff" : "#cbd5e1", padding: "12px 18px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>📍 Somewhere else</button>
            </div>
            {session.locationType === "room" && <p style={{ fontSize: "13px", color: "#86efac", margin: "0 0 8px" }}>✓ Your usual setup. Nothing extra to prepare.</p>}
            {session.locationType === "other" && (
              <div style={{ marginBottom: "8px" }}>
                <TextInput multiline rows={2} value={session.environment} onChange={v => setSession({ ...session, environment: v })} placeholder="Describe the space, the devices, and anything you need to set up." />
                <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "10px", padding: "12px 14px", marginTop: "10px", fontSize: "13px", color: "#fcd34d", lineHeight: 1.6 }}>
                  💡 Testing outside the training room is fine. Just capture evidence of your setup (a quick photo or a short description) so your facilitator can see it.
                </div>
              </div>
            )}

            {setupHints.length > 0 && (
              <div style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "12px", padding: "14px 16px", marginTop: "14px" }}>
                <div style={{ fontSize: "11px", color: "#c4b5fd", fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em", marginBottom: "8px" }}>BECAUSE OF YOUR FOCUS, GET READY FOR:</div>
                <ul style={{ margin: 0, paddingLeft: "18px", color: "#cbd5e1", fontSize: "13px", lineHeight: 1.7 }}>
                  {setupHints.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {currentKey === "risks" && (
          <div style={card}>
            {stepHeading("Risks & considerations", "What could get in the way? Name it, then plan what you would do about it.")}
            <label style={labelStyle}>PICK ANY THAT MIGHT APPLY</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
              {RISK_SUGGESTIONS.map(r => <Tag key={r} label={r} selected={risks.some(x => x.text === r)} onClick={() => toggleRisk(r)} />)}
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              <TextInput value={customRisk} onChange={setCustomRisk} placeholder="Add your own consideration…" />
              <button onClick={addCustomRisk} style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(139,92,246,0.5)", borderRadius: "8px", color: "#e9d5ff", padding: "0 18px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>+ Add</button>
            </div>

            {risks.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Choose or add a risk above, then say how you would handle it.</p>
            ) : (
              <div>
                <label style={labelStyle}>FOR EACH ONE, HOW WILL YOU HANDLE IT?</label>
                {risks.map((r, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "14px 16px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", color: "#f1f5f9", fontWeight: 600 }}>⚠️ {r.text}</span>
                      <button onClick={() => removeRisk(i)} aria-label="Remove risk" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#fca5a5", padding: "4px 10px", cursor: "pointer", fontSize: "12px" }}>✕</button>
                    </div>
                    <TextInput multiline rows={2} value={r.plan} onChange={v => updateRiskPlan(i, v)} placeholder="What is your plan if this happens? (your contingency)" />
                  </div>
                ))}
                <p style={{ fontSize: "12px", color: "#64748b", margin: "10px 0 0", lineHeight: 1.6 }}>
                  Not sure about a contingency? Talk it through with your facilitator or a teammate.
                </p>
              </div>
            )}
          </div>
        )}

        {currentKey === "summary" && (
          <div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
              <button onClick={handlePrint} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", border: "none", borderRadius: "10px", color: "white", padding: "12px 22px", fontSize: "14px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>🖨 Print / Save as PDF</button>
              <button onClick={handleCopy} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "10px", color: copyState === "copied" ? "#86efac" : "#cbd5e1", padding: "12px 22px", fontSize: "14px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>{copyState === "copied" ? "✓ Copied!" : "📋 Copy as text"}</button>
            </div>

            {copyState === "manual" && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "13px", color: "#fbbf24", margin: "0 0 8px" }}>Couldn't copy automatically. Select the text below and copy it (Ctrl/Cmd + C).</p>
                <textarea readOnly value={manualText} onFocus={e => e.target.select()} rows={10} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", padding: "12px 14px", color: "#f1f5f9", fontSize: "12px", fontFamily: "'DM Mono', monospace", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              </div>
            )}

            <div style={card}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "16px", marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", color: "#7c3aed", fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em", marginBottom: "6px" }}>PLAYTEST PLAN</div>
                <h2 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 700, color: game.title ? "#f1f5f9" : "#475569" }}>{game.title || "Untitled Playtest"}</h2>
                {learnerName && <div style={{ color: "#94a3b8", fontSize: "13px" }}>by {learnerName}</div>}
                {session.date && <div style={{ color: "#64748b", fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>{session.date}</div>}
              </div>

              {/* Name capture (appears on the artefact) */}
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>YOUR NAME</label>
                <TextInput value={learnerName} onChange={setLearnerName} placeholder="So your facilitator knows whose plan this is" />
              </div>

              {[
                { label: "FOCUS ANGLE", icon: "🎯", content: allFocus.length ? allFocus.join(", ") : null },
                { label: "SESSION GOALS", icon: "🎯", content: filledGoals.length ? <ul style={{ margin: 0, paddingLeft: "20px" }}>{filledGoals.map((g, i) => <li key={i} style={{ marginBottom: "4px" }}>{g}</li>)}</ul> : null },
                { label: "CAPTURING PLAYER DATA", icon: "🎣", content: captureHasContent ? captureNode : null },
                { label: "SESSION SETUP", icon: "⚙️", content: (session.date || durationMin > 0 || playerCount > 0 || session.environment) ? <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>{session.date && <div><span style={{ color: "#64748b", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>DATE: </span>{session.date}</div>}{durationMin > 0 && <div><span style={{ color: "#64748b", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>DURATION: </span>{durationMin} min</div>}{playerCount > 0 && <div><span style={{ color: "#64748b", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>RUNS: </span>{playerCount}</div>}{session.environment && <div><span style={{ color: "#64748b", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>WHERE: </span>{session.environment}</div>}</div> : null },
                { label: "RISKS & CONSIDERATIONS", icon: "⚠️", content: risks.length ? <ul style={{ margin: 0, paddingLeft: "20px" }}>{risks.map((r, i) => <li key={i} style={{ marginBottom: "8px" }}>{r.text}{r.plan ? <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "2px" }}>Plan: {r.plan}</div> : null}</li>)}</ul> : null },
              ].map(({ label, icon, content }) => (
                <div key={label} style={{ marginBottom: "22px" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}><span>{icon}</span> {label}</div>
                  <div style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.7 }}>{content || <span style={{ color: "#475569" }}>Not filled in yet</span>}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", gap: "12px" }}>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{
            background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px",
            color: step === 0 ? "#334155" : "#cbd5e1", padding: "12px 24px", fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif", cursor: step === 0 ? "default" : "pointer",
          }}>← Back</button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)", border: "none", borderRadius: "10px",
              color: "white", padding: "12px 28px", fontSize: "14px", fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
            }}>{step === STEPS.length - 2 ? "Review plan →" : "Next →"}</button>
          ) : (
            <span style={{ fontSize: "12px", color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{filledGoals.length} goals · {captureMethods.length} capture method{captureMethods.length === 1 ? "" : "s"}</span>
          )}
        </div>
      </div>
    </div>

    <PrintableArtefact learnerName={learnerName} game={game} focus={allFocus} goals={filledGoals} session={session} captureMethods={captureMethods} questions={filledQuestions} observations={filledObservations} video={video} interview={filledInterview} risks={risks} createdDate={createdDate} />
    </>
  );
}
