import { useState, useEffect } from "react";

const TODAY = new Date().toISOString().split("T")[0];

const TABS = [
  { id: "about", label: "01 About Me" },
  { id: "testing", label: "02 Testing Skills" },
  { id: "freelancing", label: "03 Freelancing" },
  { id: "tax", label: "04 Tax & Business" },
  { id: "knowledge", label: "05 Knowledge Check" },
  { id: "reflection", label: "06 Reflection" },
  { id: "submit", label: "07 Submit" },
];

const MC_GROUPS = [
  {
    id: "bug", title: "Bug Reporting",
    questions: [
      { id: "mc1", question: "Bug SEVERITY refers to:", options: ["How quickly the bug needs to be fixed by the development team","How many different players or testers have reported the same bug","How much the bug impacts the game's functionality or player experience","Which platform or device the bug was originally discovered on"], correct: 2 },
      { id: "mc2", question: "Bug PRIORITY refers to:", options: ["How technically serious the bug is in terms of game functionality","The order in which bugs should be addressed and fixed","Whether the bug affects the game's graphics or its gameplay systems","How long it takes a tester to reliably reproduce the bug"], correct: 1 },
      { id: "mc3", question: "Which of the following is NOT typically included in a bug report?", options: ["Step-by-step instructions showing exactly how to reproduce the bug","A description of what was expected to happen versus what actually happened","The tester's personal opinion on the quality of the game's storyline","Screenshots or video footage showing the bug occurring in the game"], correct: 2 },
    ]
  },
  {
    id: "testcase", title: "Test Cases",
    questions: [
      { id: "mc4", question: "What is a test case?", options: ["A document that records every bug found during testing, including reproduction steps and severity ratings","A set of instructions describing how to test a specific feature and what the expected outcome should be","A checklist completed by testers at the end of each session to confirm all assigned tasks were finished","A report submitted to developers summarising the outcomes and recommendations from a testing period"], correct: 1 },
      { id: "mc5", question: "What is the main difference between a test case and a bug report?", options: ["A test case is written after testing is done; a bug report is prepared before the session starts","A test case describes what to test and what to expect; a bug report documents something that went wrong","A bug report covers only game crashes and freezes; a test case is used for everything else","A test case is only used in large studios; a bug report is used by freelance testers"], correct: 1 },
      { id: "mc6", question: "A tester follows a test case and the game behaves exactly as expected. What is the correct outcome to record?", options: ["Fail — because something unexpected happened during the test","Blocked — because the test could not be fully completed","Pass — because the game matched the expected result","In Progress — because additional testing is still required"], correct: 2 },
    ]
  },
  {
    id: "testplan", title: "Test Plans",
    questions: [
      { id: "mc7", question: "What is a test plan?", options: ["A document that records every bug found during testing, including reproduction steps and severity ratings","A high-level document outlining what will be tested, how it will be tested, and what resources and schedule are required","A checklist completed by testers at the end of each session to confirm all assigned tasks were finished","A report submitted to developers summarising the outcomes and recommendations from a testing period"], correct: 1 },
      { id: "mc8", question: "How does a test plan differ from a test case?", options: ["A test plan covers the overall strategy and scope of testing; a test case describes specific steps to test one feature","A test plan is written by developers after release; a test case is written by testers before the session begins","A test plan is only used for bug testing sessions; a test case is only used during playtest sessions","A test plan lists every bug found in the game; a test case describes how to prevent those bugs from occurring"], correct: 0 },
      { id: "mc9", question: "Which of the following would you expect to find in a test plan but NOT in a test case?", options: ["The specific steps required to test whether a menu button works correctly","The expected result when a player attempts to save their progress in the game","The overall scope, schedule, and objectives for the entire testing effort","The actual versus expected result recorded after a single test is executed"], correct: 2 },
      { id: "mc10", question: "A studio needs a document describing the goals of testing, what parts of the game will be covered, and the timeline. What do they need?", options: ["A bug report, so that issues found can be tracked and assigned to developers straight away","A test case, so that testers know the exact steps to follow when playing through the game","A test plan, so that everyone understands the scope, objectives, and approach for the testing","A feedback form, so that playtesters can record their experience and rate the game after playing"], correct: 2 },
    ]
  },
  {
    id: "freelance", title: "Freelancing & Business",
    questions: [
      { id: "mc11", question: "Which of these is a freelance job platform where game testers can find work?", options: ["Steam","Upwork","Itch.io","Twitch"], correct: 1 },
      { id: "mc12", question: "Which of the following must always be included on a professional invoice?", options: ["Your ABN, services provided, amount due, and payment terms","Your ABN, a description of services, and your bank account details only","Client name, services provided, and your signature","Invoice number, services provided, and your LinkedIn profile"], correct: 0 },
      { id: "mc13", question: "What does ABN stand for?", options: ["Australian Business Network","Australian Business Number","Authorised Business Name","Australian Banking Node"], correct: 1 },
      { id: "mc14", question: "In Australia, once a freelancer earns more than this amount in a year, they generally need to register for GST:", options: ["$25,000","$50,000","$75,000","$100,000"], correct: 2 },
      { id: "mc15", question: "A common rule of thumb for freelancers is to set aside approximately this percentage of income for tax:", options: ["5–10%","10–15%","25–30%","50–60%"], correct: 2 },
    ]
  },
  {
    id: "tools", title: "Tools & Testing Types",
    questions: [
      { id: "mc16", question: "As a freelance game tester, you would be classified as:", options: ["A permanent employee of the studio you test for","A casual employee entitled to leave and superannuation","An independent contractor responsible for your own tax","A volunteer contributing to the game development process"], correct: 2 },
      { id: "mc17", question: "Usability testing focuses on:", options: ["Finding crashes, freezes, and technical error codes in the game","Testing the game across multiple platforms and hardware configurations","Evaluating how easy and intuitive the game is for players to use","Measuring the game's frame rate and memory usage under load"], correct: 2 },
      { id: "mc18", question: "Regression testing is best described as:", options: ["Testing a game for the first time to identify initial bugs before development continues","Re-testing areas of a game after changes to confirm existing features still work correctly","Testing a game under extreme conditions to see how it performs when pushed beyond normal limits","Testing the game on a range of devices to check for compatibility issues across platforms"], correct: 1 },
    ]
  },
];

const ALL_QUESTIONS = MC_GROUPS.flatMap(g => g.questions);

const encode = (data) =>
  Object.keys(data).map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])).join("&");

const TOOL_LABELS = { jira: "Jira", trello: "Trello", gdocs: "Google Docs", sheets: "Google Sheets", obs: "OBS", word: "Microsoft Word", excel: "Microsoft Excel", powerpoint: "Microsoft PowerPoint" };

// Theme tokens
const light = {
  bg: "#f5f4f0",
  surface: "#ffffff",
  surfaceAlt: "#fafaf8",
  border: "#d0cfc8",
  borderSoft: "#e5e3db",
  text: "#1a1a2e",
  textMuted: "#777",
  textHint: "#aaa",
  accent: "#4f46e5",
  accentText: "#ffffff",
  success: "#16a34a",
  danger: "#dc2626",
  warn: "#92400e",
  warnBg: "#fef9ec",
  warnBorder: "#fbbf24",
  headerBg: "#1a1a2e",
  headerText: "#ffffff",
  headerAccent: "#a5b4fc",
  headerWarn: "#fbbf24",
  tabActive: "#1a1a2e",
  tabDone: "#16a34a",
  tabInactive: "#999",
  dot: "#d4d2ca",
};

const dark = {
  bg: "#0f0f14",
  surface: "#1a1a26",
  surfaceAlt: "#1f1f2e",
  border: "#2e2e40",
  borderSoft: "#252535",
  text: "#e8e6f0",
  textMuted: "#9090aa",
  textHint: "#606075",
  accent: "#7c73f0",
  accentText: "#ffffff",
  success: "#22c55e",
  danger: "#f87171",
  warn: "#fcd34d",
  warnBg: "rgba(251,191,36,0.08)",
  warnBorder: "#fbbf24",
  headerBg: "#0a0a12",
  headerText: "#e8e6f0",
  headerAccent: "#a5b4fc",
  headerWarn: "#fbbf24",
  tabActive: "#e8e6f0",
  tabDone: "#22c55e",
  tabInactive: "#505065",
  dot: "#2e2e40",
};

const Field = ({ label, hint, value, onChange, rows = 3, t }) => (
  <div style={{ marginBottom: "20px" }}>
    <label style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", fontWeight: "700", color: t.text, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>{label}</label>
    {hint && <div style={{ fontSize: "12px", color: t.textMuted, fontStyle: "italic", marginBottom: "6px", lineHeight: "1.5" }}>{hint}</div>}
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} style={{ width: "100%", border: `1.5px solid ${t.border}`, borderRadius: "6px", padding: "10px 12px", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: t.text, resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: "1.6", background: t.surfaceAlt }} onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
  </div>
);

const CheckItem = ({ label, checked, onChange, disabled, t }) => (
  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px", cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: disabled ? t.textHint : t.text, lineHeight: "1.5", opacity: disabled ? 0.5 : 1 }}>
    <input type="checkbox" checked={checked} onChange={e => !disabled && onChange(e.target.checked)} disabled={disabled} style={{ marginTop: "3px", accentColor: t.accent, flexShrink: 0 }} />
    {label}
  </label>
);

const MCQuestion = ({ q, selected, onSelect, submitted, t }) => {
  const isCorrect = selected === q.correct;
  return (
    <div style={{ marginBottom: "16px", padding: "14px", background: submitted ? isCorrect ? `rgba(34,197,94,0.08)` : `rgba(248,113,113,0.08)` : t.surfaceAlt, border: `1.5px solid ${submitted ? isCorrect ? t.success : t.danger : t.border}`, borderRadius: "8px" }}>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: "600", color: t.text, marginBottom: "10px", lineHeight: "1.5" }}>{q.question}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isRight = submitted && i === q.correct;
          const isWrong = submitted && isSelected && i !== q.correct;
          return (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "6px", cursor: submitted ? "default" : "pointer", background: isRight ? `rgba(34,197,94,0.1)` : isWrong ? `rgba(248,113,113,0.1)` : isSelected ? `rgba(124,115,240,0.1)` : "transparent", border: `1px solid ${isRight ? t.success : isWrong ? t.danger : isSelected ? t.accent : "transparent"}`, fontFamily: "'Inter', sans-serif", fontSize: "14px", color: t.text }}>
              <input type="radio" name={q.id} checked={isSelected} onChange={() => !submitted && onSelect(i)} style={{ accentColor: t.accent, flexShrink: 0 }} />
              {opt}
              {isRight && <span style={{ marginLeft: "auto", color: t.success, fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", fontWeight: "700" }}>✓ CORRECT</span>}
              {isWrong && <span style={{ marginLeft: "auto", color: t.danger, fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", fontWeight: "700" }}>✗</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
};

const AccordionGroup = ({ group, answers, onSelect, submitted, openGroup, setOpenGroup, t }) => {
  const isOpen = openGroup === group.id;
  const answered = group.questions.filter(q => answers[q.id] !== undefined).length;
  const total = group.questions.length;
  const allCorrect = submitted && group.questions.every(q => answers[q.id] === q.correct);
  const allAnswered = answered === total;
  const score = submitted ? group.questions.filter(q => answers[q.id] === q.correct).length : null;

  return (
    <div style={{ marginBottom: "10px", border: `2px solid ${submitted && allCorrect ? t.success : allAnswered && !submitted ? t.accent : t.border}`, borderRadius: "10px", overflow: "hidden", transition: "border-color 0.3s" }}>
      <button onClick={() => setOpenGroup(isOpen ? null : group.id)} style={{ width: "100%", background: isOpen ? t.accent : t.surface, border: "none", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "13px", fontWeight: "700", color: isOpen ? "#fff" : t.text, letterSpacing: "0.03em", textAlign: "left", transition: "background 0.25s, color 0.25s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: allAnswered ? (submitted ? allCorrect ? t.success : t.danger : t.accent) : isOpen ? "rgba(255,255,255,0.25)" : t.borderSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: allAnswered || isOpen ? "#fff" : t.textMuted, flexShrink: 0, transition: "background 0.25s" }}>
            {allAnswered && submitted ? (allCorrect ? "✓" : score) : answered > 0 ? answered : ""}
          </div>
          <span>{group.title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "11px", color: isOpen ? "rgba(255,255,255,0.65)" : t.textMuted, fontWeight: "400", transition: "color 0.25s" }}>
            {submitted ? `${score}/${total} correct` : `${answered}/${total} answered`}
          </span>
          <span style={{ fontSize: "20px", color: isOpen ? "rgba(255,255,255,0.9)" : t.textMuted, fontWeight: "300", lineHeight: 1, display: "inline-block", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.25s ease, color 0.25s" }}>+</span>
        </div>
      </button>
      <div style={{ maxHeight: isOpen ? "2000px" : "0", overflow: "hidden", transition: "max-height 0.35s ease" }}>
        <div style={{ padding: "20px", background: t.surfaceAlt, opacity: isOpen ? 1 : 0, transition: "opacity 0.25s ease 0.1s" }}>
          {group.questions.map(q => (
            <MCQuestion key={q.id} q={q} selected={answers[q.id] ?? null} onSelect={i => onSelect(q.id, i)} submitted={submitted} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
};

const PrintDoc = ({ name, date, gameTypes, whyTesting, bugProcess, tools, findWork, pitch, invoice, abn, taxApproach, challenge, proudOf, nextStep, mcAnswers, mcScore, totalMC }) => {
  const toolList = Object.entries(tools).filter(([k, v]) => v && k !== "other").map(([k]) => TOOL_LABELS[k]).filter(Boolean);
  const s = { marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid #eee" };
  const lbl = { fontFamily: "monospace", fontSize: "10px", fontWeight: "700", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px", display: "block", marginTop: "12px" };
  const val = { fontFamily: "Georgia, serif", fontSize: "13px", color: "#1a1a2e", lineHeight: "1.7", whiteSpace: "pre-wrap" };
  const sec = (n, tx) => <div style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: "700", color: "#1a1a2e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px", borderLeft: "4px solid #4f46e5", paddingLeft: "10px" }}>{n} — {tx}</div>;
  return (
    <div style={{ fontFamily: "Georgia, serif", color: "#1a1a2e" }}>
      <div style={{ background: "#1a1a2e", color: "#fff", padding: "20px 28px" }}>
        <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#a5b4fc", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>QA for Gaming · Freelance Game Tester</div>
        <div style={{ fontFamily: "monospace", fontSize: "18px", fontWeight: "700", marginBottom: "10px" }}>Course Reflection & Evidence Document</div>
        <div style={{ display: "flex", gap: "32px", fontSize: "12px", color: "#aaa", flexWrap: "wrap" }}>
          <span><strong style={{ color: "#fff" }}>Student:</strong> {name || "—"}</span>
          <span><strong style={{ color: "#fff" }}>Date:</strong> {date || "—"}</span>
          <span><strong style={{ color: "#fff" }}>Knowledge Check:</strong> {mcScore}/{totalMC} ({mcScore / totalMC >= 0.7 ? "Satisfactory" : "Needs review"})</span>
          <span><strong style={{ color: "#fff" }}>Submitted:</strong> {new Date().toLocaleDateString("en-AU")}</span>
        </div>
      </div>
      <div style={{ padding: "24px 28px" }}>
        <div style={s}>{sec("01", "About Me as a Game Tester")}<span style={lbl}>Types of games I enjoy testing</span><div style={val}>{gameTypes || "—"}</div><span style={lbl}>Why game testing matters</span><div style={val}>{whyTesting || "—"}</div></div>
        <div style={s}>{sec("02", "Testing Skills & Process")}<span style={lbl}>How I would find and report a bug</span><div style={val}>{bugProcess || "—"}</div><span style={lbl}>Tools used or learned about</span><div style={val}>{toolList.length > 0 ? toolList.join(", ") : "None selected"}</div></div>
        <div style={s}>{sec("03", "Freelancing Basics")}<span style={lbl}>Where a freelance game tester might find work</span><div style={val}>{findWork || "—"}</div><span style={lbl}>How I would describe my services</span><div style={val}>{pitch || "—"}</div><span style={lbl}>What I would include on an invoice</span><div style={val}>{invoice || "—"}</div></div>
        <div style={s}>{sec("04", "Tax & Business Basics")}<span style={lbl}>What is an ABN and why does a freelancer need one?</span><div style={val}>{abn || "—"}</div><span style={lbl}>How I would manage tax as a freelancer</span><div style={val}>{taxApproach || "—"}</div></div>
        <div style={s}>
          {sec("05", "Knowledge Check Results")}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "8px 0 16px" }}>
            <div style={{ fontSize: "32px", fontWeight: "700", fontFamily: "monospace", color: mcScore / totalMC >= 0.7 ? "#16a34a" : "#dc2626" }}>{mcScore}/{totalMC}</div>
            <div style={{ fontSize: "13px", color: "#666" }}>{mcScore / totalMC >= 0.7 ? "✓ Satisfactory" : "Needs review"}</div>
          </div>
          {MC_GROUPS.map(group => (
            <div key={group.id} style={{ marginBottom: "10px" }}>
              <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>{group.title}</div>
              {group.questions.map(q => {
                const correct = mcAnswers[q.id] === q.correct;
                const selectedAnswer = mcAnswers[q.id] !== undefined ? q.options[mcAnswers[q.id]] : "No answer"; const correctAnswer = q.options[q.correct]; return <div key={q.id} style={{ marginBottom: "10px", paddingBottom: "8px", borderBottom: "1px solid #f0eeea" }}><div style={{ display: "flex", gap: "8px", fontSize: "12px", lineHeight: "1.4", marginBottom: "3px" }}><span style={{ color: correct ? "#16a34a" : "#dc2626", fontWeight: "700", flexShrink: 0 }}>{correct ? "✓" : "✗"}</span><span style={{ color: "#1a1a2e", fontWeight: "600" }}>{q.question}</span></div><div style={{ paddingLeft: "20px", fontSize: "11px", color: correct ? "#16a34a" : "#dc2626" }}>{correct ? selectedAnswer : <><span style={{ color: "#dc2626" }}>Selected: {selectedAnswer}</span><br/><span style={{ color: "#16a34a" }}>Correct: {correctAnswer}</span></>}</div></div>;
              })}
            </div>
          ))}
        </div>
        <div style={s}>{sec("06", "Reflection")}<span style={lbl}>Biggest challenge</span><div style={val}>{challenge || "—"}</div><span style={lbl}>Something I am proud of</span><div style={val}>{proudOf || "—"}</div><span style={lbl}>One thing I would do next</span><div style={val}>{nextStep || "—"}</div></div>
        <div style={{ borderTop: "2px solid #1a1a2e", paddingTop: "14px", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#888", fontFamily: "monospace" }}>
          <span>QA for Gaming · Youth Options · Freelance Game Tester</span>
          <span>Generated on {new Date().toLocaleDateString("en-AU")}</span>
        </div>
      </div>
    </div>
  );
};

const STORAGE_KEY = "qa-reflection-draft";

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function FreelanceReflection() {
  const [darkMode, setDarkMode] = useState(() => loadDraft()?.darkMode ?? false);
  const t = darkMode ? dark : light;

  const [activeTab, setActiveTab] = useState(() => loadDraft()?.activeTab ?? "about");
  const [name, setName] = useState(() => loadDraft()?.name ?? "");
  const [date, setDate] = useState(() => loadDraft()?.date ?? TODAY);
  const [gameTypes, setGameTypes] = useState(() => loadDraft()?.gameTypes ?? "");
  const [whyTesting, setWhyTesting] = useState(() => loadDraft()?.whyTesting ?? "");
  const [bugProcess, setBugProcess] = useState(() => loadDraft()?.bugProcess ?? "");
  const [tools, setTools] = useState(() => loadDraft()?.tools ?? { jira: false, trello: false, gdocs: false, sheets: false, obs: false, word: false, excel: false, powerpoint: false, other: false });
  const [otherTool, setOtherTool] = useState(() => loadDraft()?.otherTool ?? "");
  const [findWork, setFindWork] = useState(() => loadDraft()?.findWork ?? "");
  const [pitch, setPitch] = useState(() => loadDraft()?.pitch ?? "");
  const [invoice, setInvoice] = useState(() => loadDraft()?.invoice ?? "");
  const [abn, setAbn] = useState(() => loadDraft()?.abn ?? "");
  const [taxApproach, setTaxApproach] = useState(() => loadDraft()?.taxApproach ?? "");
  const [challenge, setChallenge] = useState(() => loadDraft()?.challenge ?? "");
  const [proudOf, setProudOf] = useState(() => loadDraft()?.proudOf ?? "");
  const [nextStep, setNextStep] = useState(() => loadDraft()?.nextStep ?? "");
  const [declared, setDeclared] = useState(() => loadDraft()?.declared ?? false);
  const [mcAnswers, setMcAnswers] = useState(() => loadDraft()?.mcAnswers ?? {});
  const [mcSubmitted, setMcSubmitted] = useState(() => loadDraft()?.mcSubmitted ?? false);
  const [openGroup, setOpenGroup] = useState(() => loadDraft()?.openGroup ?? "bug");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        darkMode, activeTab, name, date, gameTypes, whyTesting, bugProcess,
        tools, otherTool, findWork, pitch, invoice, abn, taxApproach,
        challenge, proudOf, nextStep, declared, mcAnswers, mcSubmitted, openGroup,
      }));
    } catch {}
  }, [darkMode, activeTab, name, date, gameTypes, whyTesting, bugProcess,
      tools, otherTool, findWork, pitch, invoice, abn, taxApproach,
      challenge, proudOf, nextStep, declared, mcAnswers, mcSubmitted, openGroup]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const totalMC = ALL_QUESTIONS.length;
  const answeredMC = Object.keys(mcAnswers).length;
  const mcScore = mcSubmitted ? ALL_QUESTIONS.filter(q => mcAnswers[q.id] === q.correct).length : 0;
  const toolList = Object.entries(tools).filter(([k, v]) => v && k !== "other").map(([k]) => TOOL_LABELS[k]).filter(Boolean);

  const openComplete = [gameTypes, whyTesting, bugProcess, findWork, pitch, invoice, abn, taxApproach, challenge, proudOf, nextStep].filter(v => v.trim().length > 0).length;
  const toolsSelected = Object.values(tools).some(Boolean);
  const pct = Math.round(((openComplete + (toolsSelected ? 1 : 0) + (name.trim() ? 1 : 0) + (mcSubmitted ? 1 : 0) + (declared ? 1 : 0)) / 15) * 100);

  const goTo = (dir) => {
    const idx = TABS.findIndex(t => t.id === activeTab);
    if (dir === "next" && idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
    if (dir === "back" && idx > 0) setActiveTab(TABS[idx - 1].id);
  };

  const tabComplete = {
    about: name.trim() && gameTypes.trim() && whyTesting.trim(),
    testing: bugProcess.trim() && toolsSelected,
    freelancing: findWork.trim() && pitch.trim() && invoice.trim(),
    tax: abn.trim() && taxApproach.trim(),
    knowledge: mcSubmitted,
    reflection: challenge.trim() && proudOf.trim() && nextStep.trim(),
    submit: declared,
  };

  const allSectionsComplete = tabComplete.about && tabComplete.testing && tabComplete.freelancing && tabComplete.tax && tabComplete.knowledge && tabComplete.reflection;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "freelance-reflection",
          name, date, gameTypes, whyTesting, bugProcess,
          toolsUsed: toolList.join(", "),
          findWork, pitch, invoice, abn, taxApproach,
          mcScore: `${mcScore}/${totalMC}`,
          challenge, proudOf, nextStep,
        }),
      });
      localStorage.removeItem(STORAGE_KEY);
      setFormSubmitted(true);
    } catch {
      setSubmitError("Submission failed — please try again or let your facilitator know.");
    } finally {
      setSubmitting(false);
    }
  };

  if (formSubmitted) {
    return (
      <>
        <style>{`* { box-sizing: border-box; } @media print { .no-print { display: none !important; } body { margin: 0; } }`}</style>
        <div className="no-print" style={{ background: "#1a1a2e", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <span style={{ color: "#86efac", fontFamily: "'Space Grotesk', sans-serif", fontSize: "13px", fontWeight: "700" }}>✓ Submitted — your facilitator has been notified</span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => window.print()} style={{ background: "#4f46e5", border: "none", borderRadius: "6px", color: "#fff", padding: "8px 20px", fontFamily: "'Space Grotesk', sans-serif", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Print / Save as PDF</button>
            <button onClick={() => setFormSubmitted(false)} style={{ background: "none", border: "1px solid #555", borderRadius: "6px", color: "#aaa", padding: "8px 16px", fontFamily: "'Space Grotesk', sans-serif", fontSize: "12px", cursor: "pointer" }}>← Back</button>
          </div>
        </div>
        <PrintDoc name={name} date={date} gameTypes={gameTypes} whyTesting={whyTesting} bugProcess={bugProcess} tools={tools} findWork={findWork} pitch={pitch} invoice={invoice} abn={abn} taxApproach={taxApproach} challenge={challenge} proudOf={proudOf} nextStep={nextStep} mcAnswers={mcAnswers} mcScore={mcScore} totalMC={totalMC} />
      </>
    );
  }

  const inputStyle = { width: "100%", border: `1.5px solid ${t.border}`, borderRadius: "6px", padding: "10px 12px", fontFamily: "'Inter', sans-serif", fontSize: "14px", background: t.surfaceAlt, color: t.text, outline: "none" };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Inter', sans-serif", transition: "background 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        textarea::placeholder { color: ${t.textHint}; font-style: italic; }
        input::placeholder { color: ${t.textHint}; }
        input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.5; filter: ${darkMode ? "invert(1)" : "none"}; }
        textarea { color: ${t.text} !important; background: ${t.surfaceAlt} !important; }
        @media print { .no-print { display: none !important; } }
      `}</style>

      {/* Header */}
      <div style={{ background: t.headerBg, padding: "24px 32px", borderBottom: `4px solid ${t.accent}` }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", color: t.headerAccent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>QA for Gaming · Freelance Game Tester · Final Session</div>
            <h1 style={{ margin: "0 0 6px", color: t.headerText, fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", fontWeight: "700" }}>Course Reflection & Evidence Document</h1>
            <div style={{ color: t.headerWarn, fontSize: "12px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700" }}>⚠ This is your final submission — you will not get another opportunity</div>
          </div>
          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            style={{ background: darkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.08)", border: `1px solid ${darkMode ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.15)"}`, borderRadius: "20px", padding: "6px 14px", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "12px", color: "#fff", fontWeight: "600", whiteSpace: "nowrap", marginTop: "4px", flexShrink: 0 }}
          >
            {darkMode ? "☀ Light" : "◑ Dark"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="no-print" style={{ background: t.surface, borderBottom: `1px solid ${t.borderSoft}`, padding: "10px 32px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ flex: 1, height: "8px", background: t.borderSoft, borderRadius: "4px", overflow: "hidden", border: `1px solid ${t.border}` }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? t.success : t.accent, borderRadius: "3px", transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "12px", fontWeight: "700", color: pct === 100 ? t.success : t.text, whiteSpace: "nowrap" }}>{pct === 100 ? "✓ Done" : `${pct}%`}</div>
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            {TABS.map(tab => (
              <div key={tab.id} title={tab.label} onClick={() => setActiveTab(tab.id)} style={{ width: "9px", height: "9px", borderRadius: "50%", background: tabComplete[tab.id] ? t.success : activeTab === tab.id ? t.accent : t.dot, cursor: "pointer", transition: "background 0.2s", flexShrink: 0, border: activeTab === tab.id ? `2px solid ${t.text}` : "2px solid transparent" }} />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print" style={{ background: t.surface, borderBottom: `1px solid ${t.borderSoft}`, overflowX: "auto" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex" }}>
          {TABS.map(tab => {
            const done = tabComplete[tab.id]; const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: "none", border: "none", borderBottom: active ? `3px solid ${t.accent}` : "3px solid transparent", padding: "12px 16px", fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", fontWeight: "700", color: active ? t.tabActive : done ? t.tabDone : t.tabInactive, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "5px" }}>
                {done && <span style={{ color: t.tabDone, fontSize: "12px" }}>✓</span>}{tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 32px" }}>

        {activeTab === "about" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: "700", color: t.text, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>About Me as a Game Tester</h2>
              <div style={{ color: t.textMuted, fontSize: "13px", fontStyle: "italic" }}>Start by filling in your details, then tell us about yourself.</div>
            </div>
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
              <div style={{ flex: 2, minWidth: "180px" }}>
                <label style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", fontWeight: "700", color: t.text, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Full Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={inputStyle} onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
              </div>
              <div style={{ flex: 1, minWidth: "140px" }}>
                <label style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", fontWeight: "700", color: t.text, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, cursor: "pointer", colorScheme: darkMode ? "dark" : "light" }} onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
              </div>
            </div>
            <Field label="Types of games I enjoy testing" hint="Think about genres, platforms, or styles — what kinds of games interest you most as a tester?" value={gameTypes} onChange={setGameTypes} rows={2} t={t} />
            <Field label="Why game testing matters" hint="In your own words — what is the point of game testing? Why does it exist in the game development process?" value={whyTesting} onChange={setWhyTesting} rows={4} t={t} />
          </div>
        )}

        {activeTab === "testing" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: "700", color: t.text, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Testing Skills & Process</h2>
              <div style={{ color: t.textMuted, fontSize: "13px", fontStyle: "italic" }}>Demonstrate your understanding of the testing process and tools.</div>
            </div>
            <Field label="How I would find and report a bug" hint="Walk through the steps — from finding something wrong in a game to submitting the report. What information would you include?" value={bugProcess} onChange={setBugProcess} rows={5} t={t} />
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", fontWeight: "700", color: t.text, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Tools I have used or learned about during this course</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                {Object.keys(TOOL_LABELS).concat(["other"]).map(k => (
                  <CheckItem key={k} label={k === "other" ? "Other" : `${TOOL_LABELS[k]}${k === "jira" ? " — bug tracking" : k === "trello" ? " — project management" : k === "gdocs" ? " — documentation" : k === "sheets" ? " — data tracking" : k === "obs" ? " — screen recording" : k === "word" ? " — documents" : k === "excel" ? " — spreadsheets" : " — presentations"}`} checked={tools[k]} onChange={v => setTools({ ...tools, [k]: v })} t={t} />
                ))}
              </div>
              {tools.other && <input value={otherTool} onChange={e => setOtherTool(e.target.value)} placeholder="What other tools?" style={{ ...inputStyle, marginTop: "8px" }} />}
            </div>
          </div>
        )}

        {activeTab === "freelancing" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: "700", color: t.text, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Freelancing Basics</h2>
              <div style={{ color: t.textMuted, fontSize: "13px", fontStyle: "italic" }}>Show what you know about finding and managing freelance work.</div>
            </div>
            <Field label="Where a freelance game tester might find work" hint="List the platforms, communities, or methods we discussed for finding game testing jobs." value={findWork} onChange={setFindWork} rows={3} t={t} />
            <Field label="How I would describe my services to a potential client" hint="Imagine someone asks 'what do you do?' — write a short, clear description of what you could offer." value={pitch} onChange={setPitch} rows={3} t={t} />
            <Field label="What I would include on an invoice for game testing work" hint="List the key things that should appear on a professional invoice." value={invoice} onChange={setInvoice} rows={3} t={t} />
          </div>
        )}

        {activeTab === "tax" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: "700", color: t.text, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Tax & Business Basics</h2>
              <div style={{ color: t.textMuted, fontSize: "13px", fontStyle: "italic" }}>A quick Google is fine — these are things every freelancer needs to know.</div>
            </div>
            <Field label="What is an ABN and why does a freelancer need one?" hint="ABN stands for Australian Business Number. Look it up if you need to." value={abn} onChange={setAbn} rows={3} t={t} />
            <Field label="How would you manage tax as a freelancer?" hint="Think about: setting money aside, GST registration, and keeping records of income and expenses." value={taxApproach} onChange={setTaxApproach} rows={4} t={t} />
          </div>
        )}

        {activeTab === "knowledge" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: "700", color: t.text, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Knowledge Check</h2>
              <div style={{ color: t.textMuted, fontSize: "13px", fontStyle: "italic" }}>Work through each topic below. Tap a section to open it. Answers lock once you submit.</div>
            </div>
            <div style={{ background: t.warnBg, border: `1.5px solid ${t.warnBorder}`, borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontFamily: "'Space Grotesk', sans-serif", fontSize: "12px", color: t.warn }}>
              ⚠ Answer all {totalMC} questions before submitting. You cannot change answers after submitting. · {answeredMC}/{totalMC} answered
            </div>
            {MC_GROUPS.map(group => (
              <AccordionGroup key={group.id} group={group} answers={mcAnswers} onSelect={(id, i) => !mcSubmitted && setMcAnswers({ ...mcAnswers, [id]: i })} submitted={mcSubmitted} openGroup={openGroup} setOpenGroup={setOpenGroup} t={t} />
            ))}
            {!mcSubmitted && (
              <button onClick={() => answeredMC === totalMC && setMcSubmitted(true)} disabled={answeredMC < totalMC} style={{ marginTop: "16px", background: answeredMC === totalMC ? t.accent : t.borderSoft, border: "none", borderRadius: "8px", color: answeredMC === totalMC ? "#fff" : t.textMuted, padding: "12px 28px", fontFamily: "'Space Grotesk', sans-serif", fontSize: "13px", fontWeight: "700", cursor: answeredMC === totalMC ? "pointer" : "not-allowed" }}>
                {answeredMC === totalMC ? "Submit Knowledge Check" : `Answer all questions first (${answeredMC}/${totalMC})`}
              </button>
            )}
            {mcSubmitted && (
              <div style={{ background: mcScore / totalMC >= 0.7 ? `rgba(34,197,94,0.08)` : `rgba(248,113,113,0.08)`, border: `2px solid ${mcScore / totalMC >= 0.7 ? t.success : t.danger}`, borderRadius: "8px", padding: "16px 20px", fontFamily: "'Space Grotesk', sans-serif", fontSize: "14px", color: t.text, marginTop: "16px" }}>
                <strong>You scored {mcScore}/{totalMC}</strong>{mcScore / totalMC >= 0.7 ? " — Well done. Move on to Reflection to finish." : " — Review the highlighted answers, then move on to Reflection."}
              </div>
            )}
          </div>
        )}

        {activeTab === "reflection" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: "700", color: t.text, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Reflection</h2>
              <div style={{ color: t.textMuted, fontSize: "13px", fontStyle: "italic" }}>Honest answers are more useful than perfect ones.</div>
            </div>
            <Field label="The biggest challenge I faced during this course" hint="Be honest — what was hard? What didn't click immediately?" value={challenge} onChange={setChallenge} rows={3} t={t} />
            <Field label="Something I am proud of from this course" hint="What did you do well, figure out, or get better at?" value={proudOf} onChange={setProudOf} rows={3} t={t} />
            <Field label="One thing I would do next if I wanted to pursue game testing" hint="What's a realistic next step — even a small one?" value={nextStep} onChange={setNextStep} rows={2} t={t} />
          </div>
        )}

        {activeTab === "submit" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: "700", color: t.text, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Declaration & Submit</h2>
              <div style={{ color: t.textMuted, fontSize: "13px", fontStyle: "italic" }}>Review your completion status, then declare and submit.</div>
            </div>
            <div style={{ background: t.surface, border: `1.5px solid ${t.borderSoft}`, borderRadius: "10px", padding: "20px", marginBottom: "24px" }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", fontWeight: "700", color: t.text, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "14px" }}>Completion Summary</div>
              {TABS.filter(tab => tab.id !== "submit").map(tab => (
                <div key={tab.id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: t.text }}>
                  <span style={{ color: tabComplete[tab.id] ? t.success : t.danger, fontWeight: "700", fontSize: "16px" }}>{tabComplete[tab.id] ? "✓" : "✗"}</span>
                  {tab.label}
                  {!tabComplete[tab.id] && <button onClick={() => setActiveTab(tab.id)} style={{ marginLeft: "auto", background: "none", border: `1px solid ${t.danger}`, borderRadius: "6px", color: t.danger, padding: "2px 10px", fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", cursor: "pointer" }}>Go back</button>}
                </div>
              ))}
            </div>
            <div style={{ background: t.surface, border: `1.5px solid ${t.borderSoft}`, borderRadius: "10px", padding: "20px", marginBottom: "24px" }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", fontWeight: "700", color: t.text, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>Declaration</div>
              {!allSectionsComplete && (
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "12px", color: t.danger, marginBottom: "12px", fontWeight: "700" }}>
                  ⚠ Complete all sections before declaring.
                </div>
              )}
              <CheckItem label="I confirm that this is my own work, completed to the best of my ability. I understand this is my final submission for the Freelance Game Tester course and I will not have another opportunity to complete or revise it." checked={declared} onChange={v => allSectionsComplete && setDeclared(v)} disabled={!allSectionsComplete} t={t} />
            </div>
            {submitError && (
              <div style={{ background: `rgba(248,113,113,0.08)`, border: `1.5px solid ${t.danger}`, borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontFamily: "'Space Grotesk', sans-serif", fontSize: "13px", color: t.danger }}>{submitError}</div>
            )}
            <button onClick={handleSubmit} disabled={!declared || submitting} style={{ background: declared && !submitting ? t.accent : t.borderSoft, border: "none", borderRadius: "8px", color: declared && !submitting ? "#fff" : t.textMuted, padding: "14px 32px", fontFamily: "'Space Grotesk', sans-serif", fontSize: "14px", fontWeight: "700", cursor: declared && !submitting ? "pointer" : "not-allowed" }}>
              {submitting ? "Submitting..." : declared ? "Submit" : "Complete declaration to submit"}
            </button>
          </div>
        )}

        <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginTop: "32px", paddingTop: "20px", borderTop: `1px solid ${t.borderSoft}` }}>
          {activeTab !== "about" && (
            <button onClick={() => goTo("back")} style={{ background: "none", border: `1.5px solid ${t.border}`, borderRadius: "8px", color: t.textMuted, padding: "10px 20px", fontFamily: "'Space Grotesk', sans-serif", fontSize: "13px", fontWeight: "700", cursor: "pointer", marginRight: "10px" }}>← Back</button>
          )}
          {activeTab !== "submit" && (
            <button onClick={() => goTo("next")} disabled={!tabComplete[activeTab]} style={{ background: tabComplete[activeTab] ? t.accent : t.borderSoft, border: "none", borderRadius: "8px", color: tabComplete[activeTab] ? "#fff" : t.textMuted, padding: "10px 24px", fontFamily: "'Space Grotesk', sans-serif", fontSize: "13px", fontWeight: "700", cursor: tabComplete[activeTab] ? "pointer" : "not-allowed" }}>Next →</button>
          )}
        </div>

      </div>
    </div>
  );
}
