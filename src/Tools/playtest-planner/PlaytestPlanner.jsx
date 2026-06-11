import { useState, useCallback } from "react";

const FOCUS_ANGLES = [
  "Fun factor & enjoyment",
  "Difficulty curve & balance",
  "UI clarity & navigation",
  "Accessibility & inclusivity",
  "Tutorial effectiveness",
  "Multiplayer / social dynamics",
  "Pacing & session length",
  "Visual/audio feedback",
  "Onboarding experience",
  "Replayability",
];

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

const AI_SYSTEM_PROMPT = `You are a helpful assistant for a games QA training program aimed at neurodiverse learners. 
Your job is to help participants plan a playtest session. Keep responses concise, friendly, encouraging, and practical.
Never use jargon. Use plain language. Respond in short bullet points unless asked otherwise.`;

async function callClaude(userMessage, context = "") {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: AI_SYSTEM_PROMPT,
      messages: [{ role: "user", content: context ? `${context}\n\n${userMessage}` : userMessage }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "Sorry, I couldn't generate a suggestion right now.";
}

const Section = ({ id, title, emoji, children, completed }) => (
  <div style={{
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${completed ? "rgba(134,239,172,0.4)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: "16px",
    padding: "28px",
    marginBottom: "20px",
    transition: "border-color 0.3s",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
      <span style={{ fontSize: "22px" }}>{emoji}</span>
      <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", color: "#e2e8f0", fontFamily: "'DM Mono', monospace" }}>{title}</h2>
      {completed && <span style={{ marginLeft: "auto", fontSize: "12px", color: "#86efac", fontFamily: "'DM Mono', monospace" }}>✓ DONE</span>}
    </div>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, multiline, rows = 3 }) => {
  const style = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#f1f5f9",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    resize: multiline ? "vertical" : "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  return multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={style} />
    : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />;
};

const AIButton = ({ onClick, loading, label = "✦ Get AI suggestions" }) => (
  <button onClick={onClick} disabled={loading} style={{
    background: loading ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.2)",
    border: "1px solid rgba(139,92,246,0.5)",
    borderRadius: "8px",
    color: "#c4b5fd",
    padding: "8px 16px",
    fontSize: "13px",
    fontFamily: "'DM Mono', monospace",
    cursor: loading ? "wait" : "pointer",
    marginTop: "10px",
    transition: "all 0.2s",
  }}>
    {loading ? "⟳ Thinking..." : label}
  </button>
);

const AIResponse = ({ text }) => text ? (
  <div style={{
    background: "rgba(139,92,246,0.1)",
    border: "1px solid rgba(139,92,246,0.3)",
    borderRadius: "10px",
    padding: "14px 16px",
    marginTop: "12px",
    fontSize: "13px",
    color: "#ddd6fe",
    lineHeight: "1.7",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "pre-wrap",
  }}>{text}</div>
) : null;

const Tag = ({ label, selected, onClick }) => (
  <button onClick={onClick} style={{
    background: selected ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.05)",
    border: `1px solid ${selected ? "rgba(251,191,36,0.6)" : "rgba(255,255,255,0.15)"}`,
    borderRadius: "20px",
    color: selected ? "#fbbf24" : "#94a3b8",
    padding: "6px 14px",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    margin: "4px",
    transition: "all 0.2s",
  }}>{label}</button>
);

export default function PlaytestPlanner() {
  const [game, setGame] = useState({ title: "", platform: "", genre: "", description: "" });
  const [focusAngles, setFocusAngles] = useState([]);
  const [customFocus, setCustomFocus] = useState("");
  const [goals, setGoals] = useState(["", "", ""]);
  const [session, setSession] = useState({ date: "", duration: "", players: "", environment: "" });
  const [questions, setQuestions] = useState([{ text: "", type: "Open Answer" }]);
  const [risks, setRisks] = useState([]);
  const [customRisk, setCustomRisk] = useState("");
  const [activeTab, setActiveTab] = useState("plan");

  const [aiStates, setAiStates] = useState({
    focus: { loading: false, text: "" },
    goals: { loading: false, text: "" },
    questions: { loading: false, text: "" },
    risks: { loading: false, text: "" },
  });

  const setAI = (key, updates) => setAiStates(prev => ({ ...prev, [key]: { ...prev[key], ...updates } }));

  const getAISuggestion = useCallback(async (key, prompt, context) => {
    setAI(key, { loading: true, text: "" });
    try {
      const text = await callClaude(prompt, context);
      setAI(key, { loading: false, text });
    } catch {
      setAI(key, { loading: false, text: "Couldn't connect right now. Try again!" });
    }
  }, []);

  const toggleFocus = (f) => setFocusAngles(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  const toggleRisk = (r) => setRisks(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  const updateQuestion = (i, field, val) => {
    const updated = [...questions];
    updated[i] = { ...updated[i], [field]: val };
    setQuestions(updated);
  };

  const completion = [
    game.title.trim().length > 0,
    focusAngles.length > 0 || customFocus.trim().length > 0,
    goals.some(g => g.trim().length > 0),
    session.date.trim().length > 0,
    questions.some(q => q.text.trim().length > 0),
    risks.length > 0 || customRisk.trim().length > 0,
  ];
  const completedCount = completion.filter(Boolean).length;
  const pct = Math.round((completedCount / completion.length) * 100);

  const allFocus = [...focusAngles, ...(customFocus.trim() ? [customFocus.trim()] : [])];
  const allRisks = [...risks, ...(customRisk.trim() ? [customRisk.trim()] : [])];
  const filledGoals = goals.filter(g => g.trim());
  const filledQuestions = questions.filter(q => q.text.trim());

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b2a 100%)",
      fontFamily: "'DM Sans', sans-serif",
      color: "#f1f5f9",
      padding: "0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #475569; }
        input:focus, textarea:focus { border-color: rgba(139,92,246,0.6) !important; }
        select { appearance: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "rgba(0,0,0,0.3)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
      }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#7c3aed", fontFamily: "'DM Mono', monospace", marginBottom: "4px", textTransform: "uppercase" }}>QA Training // Playtest Module</div>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700", background: "linear-gradient(90deg, #e2e8f0, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Playtest Planner
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>PLAN COMPLETE</div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: pct === 100 ? "#86efac" : "#fbbf24", fontFamily: "'DM Mono', monospace" }}>{pct}%</div>
          </div>
          <div style={{ width: "80px", height: "80px", position: "relative" }}>
            <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", width: "80px", height: "80px" }}>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke={pct === 100 ? "#86efac" : "#a78bfa"}
                strokeWidth="3"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.5s ease" }}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.2)" }}>
        {[["plan", "📋 Build Your Plan"], ["summary", "📄 Plan Summary"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === id ? "2px solid #a78bfa" : "2px solid transparent",
            color: activeTab === id ? "#a78bfa" : "#64748b",
            padding: "14px 28px",
            fontSize: "14px",
            fontWeight: "600",
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>

        {activeTab === "plan" && <>

          {/* 1. The Game */}
          <Section emoji="🎮" title="The Game" completed={completion[0]}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px", fontFamily: "'DM Mono', monospace" }}>GAME TITLE *</label>
                <Input value={game.title} onChange={v => setGame({ ...game, title: v })} placeholder="e.g. Hollow Knight" />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px", fontFamily: "'DM Mono', monospace" }}>PLATFORM</label>
                <Input value={game.platform} onChange={v => setGame({ ...game, platform: v })} placeholder="e.g. PC, PS5, Switch" />
              </div>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px", fontFamily: "'DM Mono', monospace" }}>GENRE</label>
              <Input value={game.genre} onChange={v => setGame({ ...game, genre: v })} placeholder="e.g. Action platformer, puzzle, RPG" />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px", fontFamily: "'DM Mono', monospace" }}>BRIEF DESCRIPTION</label>
              <Input multiline value={game.description} onChange={v => setGame({ ...game, description: v })} placeholder="Briefly describe the game and what kind of players it's for..." rows={2} />
            </div>
          </Section>

          {/* 2. Focus Angle */}
          <Section emoji="🎯" title="Focus Angle" completed={completion[1]}>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 14px", lineHeight: "1.6" }}>
              What aspect of the game will your playtest focus on? Pick one or more — or write your own.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "14px" }}>
              {FOCUS_ANGLES.map(f => <Tag key={f} label={f} selected={focusAngles.includes(f)} onClick={() => toggleFocus(f)} />)}
            </div>
            <Input value={customFocus} onChange={setCustomFocus} placeholder="Or describe your own focus angle..." />
            <AIButton
              loading={aiStates.focus.loading}
              label="✦ Suggest focus angles for this game"
              onClick={() => getAISuggestion("focus",
                `Suggest 3–4 good focus angles for a playtest session of this game. Keep it simple and practical.`,
                game.title ? `Game: ${game.title}. Genre: ${game.genre}. ${game.description}` : "A game chosen by the student."
              )}
            />
            <AIResponse text={aiStates.focus.text} />
          </Section>

          {/* 3. Goals */}
          <Section emoji="🏁" title="Session Goals" completed={completion[2]}>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 14px", lineHeight: "1.6" }}>
              What do you want to find out from this playtest? Write 1–3 goals.
            </p>
            {goals.map((g, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <Input value={g} onChange={v => { const u = [...goals]; u[i] = v; setGoals(u); }} placeholder={`Goal ${i + 1}...`} />
              </div>
            ))}
            <AIButton
              loading={aiStates.goals.loading}
              label="✦ Help me write my goals"
              onClick={() => getAISuggestion("goals",
                `Suggest 3 clear and simple playtest goals for this session. Each goal should be one sentence.`,
                `Game: ${game.title || "unknown"}. Focus: ${allFocus.join(", ") || "general"}.`
              )}
            />
            <AIResponse text={aiStates.goals.text} />
          </Section>

          {/* 4. Session Setup */}
          <Section emoji="📅" title="Session Setup" completed={completion[3]}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px", fontFamily: "'DM Mono', monospace" }}>DATE *</label>
                <Input value={session.date} onChange={v => setSession({ ...session, date: v })} placeholder="e.g. 15 April 2025" />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px", fontFamily: "'DM Mono', monospace" }}>DURATION</label>
                <Input value={session.duration} onChange={v => setSession({ ...session, duration: v })} placeholder="e.g. 45 minutes" />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px", fontFamily: "'DM Mono', monospace" }}>NO. OF PLAYERS</label>
                <Input value={session.players} onChange={v => setSession({ ...session, players: v })} placeholder="e.g. 3–5" />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px", fontFamily: "'DM Mono', monospace" }}>ENVIRONMENT</label>
                <Input value={session.environment} onChange={v => setSession({ ...session, environment: v })} placeholder="e.g. Classroom, casual lounge" />
              </div>
            </div>
          </Section>

          {/* 5. Questionnaire */}
          <Section emoji="📝" title="Questionnaire" completed={completion[4]}>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 14px", lineHeight: "1.6" }}>
              Add the questions you'll ask participants after the session.
            </p>
            {questions.map((q, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <Input value={q.text} onChange={v => updateQuestion(i, "text", v)} placeholder={`Question ${i + 1}...`} />
                </div>
                <div>
                  <select value={q.type} onChange={e => updateQuestion(i, "type", e.target.value)} style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    color: "#94a3b8",
                    fontSize: "13px",
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: "pointer",
                  }}>
                    {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {questions.length > 1 && (
                  <button onClick={() => setQuestions(questions.filter((_, j) => j !== i))} style={{
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: "8px", color: "#fca5a5", padding: "12px", cursor: "pointer", fontSize: "14px",
                  }}>✕</button>
                )}
              </div>
            ))}
            <button onClick={() => setQuestions([...questions, { text: "", type: "Open Answer" }])} style={{
              background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)",
              borderRadius: "10px", color: "#94a3b8", padding: "10px 20px", cursor: "pointer",
              fontSize: "13px", fontFamily: "'DM Sans', sans-serif", marginTop: "4px",
            }}>+ Add question</button>
            <AIButton
              loading={aiStates.questions.loading}
              label="✦ Generate sample questions"
              onClick={() => getAISuggestion("questions",
                `Generate 5 good playtest questionnaire questions. Mix of question types: rating scales, yes/no, and open-ended. Keep language simple and clear.`,
                `Game: ${game.title || "unknown"}. Focus: ${allFocus.join(", ") || "general"}. Goals: ${filledGoals.join("; ") || "general feedback"}.`
              )}
            />
            <AIResponse text={aiStates.questions.text} />
          </Section>

          {/* 6. Risks */}
          <Section emoji="⚠️" title="Risks & Considerations" completed={completion[5]}>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 14px", lineHeight: "1.6" }}>
              What could go wrong, or what do you need to prepare for? Select any that apply or add your own.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "14px" }}>
              {RISK_SUGGESTIONS.map(r => <Tag key={r} label={r} selected={risks.includes(r)} onClick={() => toggleRisk(r)} />)}
            </div>
            <Input value={customRisk} onChange={setCustomRisk} placeholder="Add your own risk or consideration..." />
            <AIButton
              loading={aiStates.risks.loading}
              label="✦ Suggest risks for my session"
              onClick={() => getAISuggestion("risks",
                `List 3–4 potential risks or things to prepare for in this playtest session. Keep each point brief.`,
                `Game: ${game.title || "unknown"}. Players: ${session.players || "small group"}. Environment: ${session.environment || "classroom"}.`
              )}
            />
            <AIResponse text={aiStates.risks.text} />
          </Section>

          <div style={{ textAlign: "center", paddingTop: "8px" }}>
            <button onClick={() => setActiveTab("summary")} style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              border: "none", borderRadius: "12px", color: "white",
              padding: "14px 36px", fontSize: "15px", fontWeight: "600",
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
            }}>View My Plan Summary →</button>
          </div>
        </>}

        {activeTab === "summary" && (
          <div>
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "36px",
            }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "20px", marginBottom: "28px" }}>
                <div style={{ fontSize: "11px", color: "#7c3aed", fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em", marginBottom: "6px" }}>PLAYTEST PLAN</div>
                <h2 style={{ margin: "0 0 4px", fontSize: "26px", fontWeight: "700", color: game.title ? "#f1f5f9" : "#475569" }}>
                  {game.title || "Untitled Playtest"}
                </h2>
                {session.date && <div style={{ color: "#64748b", fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>{session.date}</div>}
              </div>

              {[
                {
                  label: "THE GAME", icon: "🎮",
                  content: game.title ? (
                    <div>
                      <p style={{ margin: "0 0 6px" }}><strong style={{ color: "#e2e8f0" }}>{game.title}</strong>{game.platform ? ` — ${game.platform}` : ""}{game.genre ? ` (${game.genre})` : ""}</p>
                      {game.description && <p style={{ margin: 0, color: "#94a3b8" }}>{game.description}</p>}
                    </div>
                  ) : <span style={{ color: "#475569" }}>Not filled in yet</span>
                },
                {
                  label: "FOCUS ANGLE", icon: "🎯",
                  content: allFocus.length > 0
                    ? <p style={{ margin: 0 }}>{allFocus.join(", ")}</p>
                    : <span style={{ color: "#475569" }}>Not selected yet</span>
                },
                {
                  label: "SESSION GOALS", icon: "🏁",
                  content: filledGoals.length > 0
                    ? <ul style={{ margin: 0, paddingLeft: "20px" }}>{filledGoals.map((g, i) => <li key={i} style={{ marginBottom: "4px" }}>{g}</li>)}</ul>
                    : <span style={{ color: "#475569" }}>No goals written yet</span>
                },
                {
                  label: "SESSION SETUP", icon: "📅",
                  content: (session.date || session.duration || session.players || session.environment)
                    ? <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {session.date && <div><span style={{ color: "#64748b", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>DATE: </span>{session.date}</div>}
                      {session.duration && <div><span style={{ color: "#64748b", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>DURATION: </span>{session.duration}</div>}
                      {session.players && <div><span style={{ color: "#64748b", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>PLAYERS: </span>{session.players}</div>}
                      {session.environment && <div><span style={{ color: "#64748b", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>ENVIRONMENT: </span>{session.environment}</div>}
                    </div>
                    : <span style={{ color: "#475569" }}>Not filled in yet</span>
                },
                {
                  label: "QUESTIONNAIRE", icon: "📝",
                  content: filledQuestions.length > 0
                    ? <ol style={{ margin: 0, paddingLeft: "20px" }}>
                      {filledQuestions.map((q, i) => (
                        <li key={i} style={{ marginBottom: "6px" }}>
                          {q.text} <span style={{ fontSize: "11px", color: "#7c3aed", fontFamily: "'DM Mono', monospace", background: "rgba(124,58,237,0.15)", padding: "2px 8px", borderRadius: "4px", marginLeft: "6px" }}>{q.type}</span>
                        </li>
                      ))}
                    </ol>
                    : <span style={{ color: "#475569" }}>No questions added yet</span>
                },
                {
                  label: "RISKS & CONSIDERATIONS", icon: "⚠️",
                  content: allRisks.length > 0
                    ? <ul style={{ margin: 0, paddingLeft: "20px" }}>{allRisks.map((r, i) => <li key={i} style={{ marginBottom: "4px" }}>{r}</li>)}</ul>
                    : <span style={{ color: "#475569" }}>None noted yet</span>
                },
              ].map(({ label, icon, content }) => (
                <div key={label} style={{ marginBottom: "24px" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{icon}</span> {label}
                  </div>
                  <div style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.7" }}>{content}</div>
                </div>
              ))}

              <div style={{
                marginTop: "32px",
                paddingTop: "20px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}>
                <div style={{ fontSize: "12px", color: "#475569", fontFamily: "'DM Mono', monospace" }}>
                  {completedCount}/{completion.length} sections complete
                </div>
                {pct < 100 && (
                  <button onClick={() => setActiveTab("plan")} style={{
                    background: "none", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "8px", color: "#94a3b8", padding: "8px 20px",
                    fontSize: "13px", fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                  }}>← Back to fill in missing sections</button>
                )}
                {pct === 100 && (
                  <div style={{ fontSize: "13px", color: "#86efac", fontFamily: "'DM Mono', monospace" }}>
                    ✓ Plan complete — ready to submit!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
