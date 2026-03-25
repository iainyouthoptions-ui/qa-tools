import { useState } from "react";

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
    id: "bug",
    title: "Bug Reporting",
    questions: [
      { id: "mc1", question: "Bug SEVERITY refers to:", options: ["How quickly the bug needs to be fixed by the development team","How many different players or testers have reported the same bug","How much the bug impacts the game's functionality or player experience","Which platform or device the bug was originally discovered on"], correct: 2 },
      { id: "mc2", question: "Bug PRIORITY refers to:", options: ["How technically serious the bug is in terms of game functionality","The order in which bugs should be addressed and fixed","Whether the bug affects the game's graphics or its gameplay systems","How long it takes a tester to reliably reproduce the bug"], correct: 1 },
      { id: "mc3", question: "Which of the following is NOT typically included in a bug report?", options: ["Step-by-step instructions showing exactly how to reproduce the bug","A description of what was expected to happen versus what actually happened","The tester's personal opinion on the quality of the game's storyline","Screenshots or video footage showing the bug occurring in the game"], correct: 2 },
    ]
  },
  {
    id: "testcase",
    title: "Test Cases",
    questions: [
      { id: "mc4", question: "What is a test case?", options: ["A document that records every bug found during testing, including reproduction steps and severity ratings","A set of instructions describing how to test a specific feature and what the expected outcome should be","A checklist completed by testers at the end of each session to confirm all assigned tasks were finished","A report submitted to developers summarising the outcomes and recommendations from a testing period"], correct: 1 },
      { id: "mc5", question: "What is the main difference between a test case and a bug report?", options: ["A test case is written after testing is done; a bug report is prepared before the session starts","A test case describes what to test and what to expect; a bug report documents something that went wrong","A bug report covers only game crashes and freezes; a test case is used for everything else","A test case is only used in large studios; a bug report is used by freelance testers"], correct: 1 },
      { id: "mc6", question: "A tester follows a test case and the game behaves exactly as expected. What is the correct outcome to record?", options: ["Fail — because something unexpected happened during the test","Blocked — because the test could not be fully completed","Pass — because the game matched the expected result","In Progress — because additional testing is still required"], correct: 2 },
    ]
  },
  {
    id: "testplan",
    title: "Test Plans",
    questions: [
      { id: "mc7", question: "What is a test plan?", options: ["A document that records every bug found during testing, including reproduction steps and severity ratings","A high-level document outlining what will be tested, how it will be tested, and what resources and schedule are required","A checklist completed by testers at the end of each session to confirm all assigned tasks were finished","A report submitted to developers summarising the outcomes and recommendations from a testing period"], correct: 1 },
      { id: "mc8", question: "How does a test plan differ from a test case?", options: ["A test plan covers the overall strategy and scope of testing; a test case describes specific steps to test one feature","A test plan is written by developers after release; a test case is written by testers before the session begins","A test plan is only used for bug testing sessions; a test case is only used during playtest sessions","A test plan lists every bug found in the game; a test case describes how to prevent those bugs from occurring"], correct: 0 },
      { id: "mc9", question: "Which of the following would you expect to find in a test plan but NOT in a test case?", options: ["The specific steps required to test whether a menu button works correctly","The expected result when a player attempts to save their progress in the game","The overall scope, schedule, and objectives for the entire testing effort","The actual versus expected result recorded after a single test is executed"], correct: 2 },
      { id: "mc10", question: "A studio needs a document describing the goals of testing, what parts of the game will be covered, and the timeline. What do they need?", options: ["A bug report, so that issues found can be tracked and assigned to developers straight away","A test case, so that testers know the exact steps to follow when playing through the game","A test plan, so that everyone understands the scope, objectives, and approach for the testing","A feedback form, so that playtesters can record their experience and rate the game after playing"], correct: 2 },
    ]
  },
  {
    id: "freelance",
    title: "Freelancing & Business",
    questions: [
      { id: "mc11", question: "Which of these is a freelance job platform where game testers can find work?", options: ["Steam","Upwork","Itch.io","Twitch"], correct: 1 },
      { id: "mc12", question: "Which of the following must always be included on a professional invoice?", options: ["Your ABN, services provided, amount due, and payment terms","Your ABN, a description of services, and your bank account details only","Client name, services provided, and your signature","Invoice number, services provided, and your LinkedIn profile"], correct: 0 },
      { id: "mc13", question: "What does ABN stand for?", options: ["Australian Business Network","Australian Business Number","Authorised Business Name","Australian Banking Node"], correct: 1 },
      { id: "mc14", question: "In Australia, once a freelancer earns more than this amount in a year, they generally need to register for GST:", options: ["$25,000","$50,000","$75,000","$100,000"], correct: 2 },
      { id: "mc15", question: "A common rule of thumb for freelancers is to set aside approximately this percentage of income for tax:", options: ["5–10%","10–15%","25–30%","50–60%"], correct: 2 },
    ]
  },
  {
    id: "tools",
    title: "Tools & Testing Types",
    questions: [
      { id: "mc16", question: "As a freelance game tester, you would be classified as:", options: ["A permanent employee of the studio you test for","A casual employee entitled to leave and superannuation","An independent contractor responsible for your own tax","A volunteer contributing to the game development process"], correct: 2 },
      { id: "mc17", question: "Usability testing focuses on:", options: ["Finding crashes, freezes, and technical error codes in the game","Testing the game across multiple platforms and hardware configurations","Evaluating how easy and intuitive the game is for players to use","Measuring the game's frame rate and memory usage under load"], correct: 2 },
    ]
  },
];

const ALL_QUESTIONS = MC_GROUPS.flatMap(g => g.questions);

const encode = (data) =>
  Object.keys(data).map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])).join("&");

const TOOL_LABELS = { jira: "Jira", trello: "Trello", gdocs: "Google Docs", sheets: "Google Sheets", obs: "OBS", word: "Microsoft Word", excel: "Microsoft Excel", powerpoint: "Microsoft PowerPoint" };

const Field = ({ label, hint, value, onChange, rows = 3 }) => (
  <div style={{ marginBottom: "20px" }}>
    <label style={{ display: "block", fontFamily: "'Courier Prime', monospace", fontSize: "12px", fontWeight: "700", color: "#1a1a2e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>{label}</label>
    {hint && <div style={{ fontSize: "12px", color: "#666", fontFamily: "'Georgia', serif", fontStyle: "italic", marginBottom: "6px", lineHeight: "1.5" }}>{hint}</div>}
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} style={{ width: "100%", border: "1.5px solid #ccc", borderRadius: "3px", padding: "10px 12px", fontFamily: "'Georgia', serif", fontSize: "14px", color: "#1a1a2e", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: "1.6", background: "#fafaf8" }} onFocus={e => e.target.style.borderColor = "#e8c547"} onBlur={e => e.target.style.borderColor = "#ccc"} />
  </div>
);

const CheckItem = ({ label, checked, onChange }) => (
  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px", cursor: "pointer", fontFamily: "'Georgia', serif", fontSize: "14px", color: "#1a1a2e", lineHeight: "1.5" }}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ marginTop: "3px", accentColor: "#1a1a2e", flexShrink: 0 }} />
    {label}
  </label>
);

const MCQuestion = ({ q, selected, onSelect, submitted }) => {
  const isCorrect = selected === q.correct;
  return (
    <div style={{ marginBottom: "16px", padding: "14px", background: submitted ? isCorrect ? "rgba(45,122,45,0.06)" : "rgba(180,40,40,0.06)" : "#fafaf8", border: `1.5px solid ${submitted ? isCorrect ? "#2d7a2d" : "#b42828" : "#ddd"}`, borderRadius: "4px" }}>
      <div style={{ fontFamily: "'Georgia', serif", fontSize: "14px", fontWeight: "bold", color: "#1a1a2e", marginBottom: "10px", lineHeight: "1.5" }}>{q.question}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isRight = submitted && i === q.correct;
          const isWrong = submitted && isSelected && i !== q.correct;
          return (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "3px", cursor: submitted ? "default" : "pointer", background: isRight ? "rgba(45,122,45,0.12)" : isWrong ? "rgba(180,40,40,0.12)" : isSelected ? "rgba(232,197,71,0.15)" : "transparent", border: `1px solid ${isRight ? "#2d7a2d" : isWrong ? "#b42828" : isSelected ? "#e8c547" : "transparent"}`, fontFamily: "'Georgia', serif", fontSize: "14px", color: "#1a1a2e" }}>
              <input type="radio" name={q.id} checked={isSelected} onChange={() => !submitted && onSelect(i)} style={{ accentColor: "#1a1a2e", flexShrink: 0 }} />
              {opt}
              {isRight && <span style={{ marginLeft: "auto", color: "#2d7a2d", fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: "700" }}>✓ CORRECT</span>}
              {isWrong && <span style={{ marginLeft: "auto", color: "#b42828", fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: "700" }}>✗</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
};

const AccordionGroup = ({ group, answers, onSelect, submitted, openGroup, setOpenGroup }) => {
  const isOpen = openGroup === group.id;
  const answered = group.questions.filter(q => answers[q.id] !== undefined).length;
  const total = group.questions.length;
  const allCorrect = submitted && group.questions.every(q => answers[q.id] === q.correct);
  const allAnswered = answered === total;
  return (
    <div style={{ marginBottom: "12px", border: `2px solid ${submitted && allCorrect ? "#2d7a2d" : allAnswered ? "#1a1a2e" : "#ddd"}`, borderRadius: "4px", overflow: "hidden" }}>
      <button onClick={() => setOpenGroup(isOpen ? null : group.id)} style={{ width: "100%", background: isOpen ? "#1a1a2e" : "#f5f0e8", border: "none", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontFamily: "'Courier Prime', monospace", fontSize: "13px", fontWeight: "700", color: isOpen ? "#fff" : "#1a1a2e", letterSpacing: "0.05em", textAlign: "left" }}>
        <span>{group.title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "11px", color: isOpen ? "#aaa" : "#666", fontWeight: "400" }}>{answered}/{total} answered</span>
          {submitted && <span style={{ fontSize: "12px", color: allCorrect ? "#2d7a2d" : "#b42828", fontWeight: "700" }}>{group.questions.filter(q => answers[q.id] === q.correct).length}/{total} correct</span>}
          <span style={{ color: isOpen ? "#e8c547" : "#666" }}>{isOpen ? "▲" : "▼"}</span>
        </div>
      </button>
      {isOpen && (
        <div style={{ padding: "20px", background: "#fff" }}>
          {group.questions.map(q => (
            <MCQuestion key={q.id} q={q} selected={answers[q.id] ?? null} onSelect={i => onSelect(q.id, i)} submitted={submitted} />
          ))}
        </div>
      )}
    </div>
  );
};

const PrintDoc = ({ name, date, gameTypes, whyTesting, bugProcess, tools, findWork, pitch, invoice, abn, taxApproach, challenge, proudOf, nextStep, mcAnswers, mcScore, totalMC }) => {
  const toolList = Object.entries(tools).filter(([k, v]) => v && k !== "other").map(([k]) => TOOL_LABELS[k]).filter(Boolean);
  const s = { marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid #eee" };
  const lbl = { fontFamily: "monospace", fontSize: "10px", fontWeight: "700", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px", display: "block", marginTop: "12px" };
  const val = { fontFamily: "Georgia, serif", fontSize: "13px", color: "#1a1a2e", lineHeight: "1.7", whiteSpace: "pre-wrap" };
  const sec = (n, t) => <div style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: "700", color: "#1a1a2e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px", borderLeft: "4px solid #e8c547", paddingLeft: "10px" }}>{n} — {t}</div>;

  return (
    <div style={{ fontFamily: "Georgia, serif", color: "#1a1a2e" }}>
      <div style={{ background: "#1a1a2e", color: "#fff", padding: "20px 28px", marginBottom: "0" }}>
        <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#e8c547", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>QA for Gaming · Freelance Game Tester</div>
        <div style={{ fontFamily: "monospace", fontSize: "18px", fontWeight: "700", marginBottom: "10px" }}>Course Reflection & Evidence Document</div>
        <div style={{ display: "flex", gap: "32px", fontSize: "12px", color: "#aaa", flexWrap: "wrap" }}>
          <span><strong style={{ color: "#fff" }}>Student:</strong> {name || "—"}</span>
          <span><strong style={{ color: "#fff" }}>Date:</strong> {date || "—"}</span>
          <span><strong style={{ color: "#fff" }}>Knowledge Check:</strong> {mcScore}/{totalMC} ({mcScore >= 12 ? "Satisfactory" : "Needs review"})</span>
          <span><strong style={{ color: "#fff" }}>Submitted:</strong> {new Date().toLocaleDateString("en-AU")}</span>
        </div>
      </div>

      <div style={{ padding: "24px 28px" }}>
        <div style={s}>
          {sec("01", "About Me as a Game Tester")}
          <span style={lbl}>Types of games I enjoy testing</span><div style={val}>{gameTypes || "—"}</div>
          <span style={lbl}>Why game testing matters</span><div style={val}>{whyTesting || "—"}</div>
        </div>
        <div style={s}>
          {sec("02", "Testing Skills & Process")}
          <span style={lbl}>How I would find and report a bug</span><div style={val}>{bugProcess || "—"}</div>
          <span style={lbl}>Tools used or learned about</span><div style={val}>{toolList.length > 0 ? toolList.join(", ") : "None selected"}</div>
        </div>
        <div style={s}>
          {sec("03", "Freelancing Basics")}
          <span style={lbl}>Where a freelance game tester might find work</span><div style={val}>{findWork || "—"}</div>
          <span style={lbl}>How I would describe my services</span><div style={val}>{pitch || "—"}</div>
          <span style={lbl}>What I would include on an invoice</span><div style={val}>{invoice || "—"}</div>
        </div>
        <div style={s}>
          {sec("04", "Tax & Business Basics")}
          <span style={lbl}>What is an ABN and why does a freelancer need one?</span><div style={val}>{abn || "—"}</div>
          <span style={lbl}>How I would manage tax as a freelancer</span><div style={val}>{taxApproach || "—"}</div>
        </div>
        <div style={s}>
          {sec("05", "Knowledge Check Results")}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "8px 0 16px" }}>
            <div style={{ fontSize: "32px", fontWeight: "700", fontFamily: "monospace", color: mcScore >= 12 ? "#2d7a2d" : "#b42828" }}>{mcScore}/{totalMC}</div>
            <div style={{ fontSize: "13px", color: "#666" }}>{mcScore >= 12 ? "✓ Satisfactory" : "Needs review"}</div>
          </div>
          {MC_GROUPS.map(group => (
            <div key={group.id} style={{ marginBottom: "10px" }}>
              <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>{group.title}</div>
              {group.questions.map(q => {
                const correct = mcAnswers[q.id] === q.correct;
                return (
                  <div key={q.id} style={{ display: "flex", gap: "8px", marginBottom: "3px", fontSize: "12px", lineHeight: "1.4" }}>
                    <span style={{ color: correct ? "#2d7a2d" : "#b42828", fontWeight: "700", flexShrink: 0 }}>{correct ? "✓" : "✗"}</span>
                    <span style={{ color: "#444" }}>{q.question}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={s}>
          {sec("06", "Reflection")}
          <span style={lbl}>Biggest challenge</span><div style={val}>{challenge || "—"}</div>
          <span style={lbl}>Something I am proud of</span><div style={val}>{proudOf || "—"}</div>
          <span style={lbl}>One thing I would do next</span><div style={val}>{nextStep || "—"}</div>
        </div>
        <div style={{ borderTop: "2px solid #1a1a2e", paddingTop: "14px", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#888", fontFamily: "monospace" }}>
          <span>QA for Gaming · Youth Options · Freelance Game Tester</span>
          <span>This document was generated on {new Date().toLocaleDateString("en-AU")}</span>
        </div>
      </div>
    </div>
  );
};

export default function FreelanceReflection() {
  const [activeTab, setActiveTab] = useState("about");
  const [name, setName] = useState("");
  const [date, setDate] = useState(TODAY);
  const [gameTypes, setGameTypes] = useState("");
  const [whyTesting, setWhyTesting] = useState("");
  const [bugProcess, setBugProcess] = useState("");
  const [tools, setTools] = useState({ jira: false, trello: false, gdocs: false, sheets: false, obs: false, word: false, excel: false, powerpoint: false, other: false });
  const [otherTool, setOtherTool] = useState("");
  const [findWork, setFindWork] = useState("");
  const [pitch, setPitch] = useState("");
  const [invoice, setInvoice] = useState("");
  const [abn, setAbn] = useState("");
  const [taxApproach, setTaxApproach] = useState("");
  const [challenge, setChallenge] = useState("");
  const [proudOf, setProudOf] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [declared, setDeclared] = useState(false);
  const [mcAnswers, setMcAnswers] = useState({});
  const [mcSubmitted, setMcSubmitted] = useState(false);
  const [openGroup, setOpenGroup] = useState("bug");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const totalMC = ALL_QUESTIONS.length;
  const answeredMC = Object.keys(mcAnswers).length;
  const mcScore = mcSubmitted ? ALL_QUESTIONS.filter(q => mcAnswers[q.id] === q.correct).length : 0;
  const toolList = Object.entries(tools).filter(([k, v]) => v && k !== "other").map(([k]) => TOOL_LABELS[k]).filter(Boolean);

  const openComplete = [gameTypes, whyTesting, bugProcess, findWork, pitch, invoice, abn, taxApproach, challenge, proudOf, nextStep].filter(v => v.trim().length > 0).length;
  const toolsSelected = Object.values(tools).some(Boolean);
  const pct = Math.round(((openComplete + (toolsSelected ? 1 : 0) + (name.trim() ? 1 : 0) + (mcSubmitted ? 1 : 0) + (declared ? 1 : 0)) / 16) * 100);

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
          <span style={{ color: "#86efac", fontFamily: "monospace", fontSize: "13px", fontWeight: "700" }}>✓ Submitted — your facilitator has been notified</span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => window.print()} style={{ background: "#e8c547", border: "none", borderRadius: "3px", color: "#1a1a2e", padding: "8px 20px", fontFamily: "monospace", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Print / Save as PDF</button>
            <button onClick={() => setFormSubmitted(false)} style={{ background: "none", border: "1px solid #555", borderRadius: "3px", color: "#aaa", padding: "8px 16px", fontFamily: "monospace", fontSize: "12px", cursor: "pointer" }}>← Back</button>
          </div>
        </div>
        <PrintDoc name={name} date={date} gameTypes={gameTypes} whyTesting={whyTesting} bugProcess={bugProcess} tools={tools} findWork={findWork} pitch={pitch} invoice={invoice} abn={abn} taxApproach={taxApproach} challenge={challenge} proudOf={proudOf} nextStep={nextStep} mcAnswers={mcAnswers} mcScore={mcScore} totalMC={totalMC} />
      </>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", fontFamily: "'Georgia', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        textarea::placeholder { color: #aaa; font-style: italic; }
        input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.6; }
        @media print { .no-print { display: none !important; } }
      `}</style>

      <div style={{ background: "#1a1a2e", padding: "24px 24px", borderBottom: "5px solid #e8c547" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: "11px", color: "#e8c547", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "6px" }}>QA for Gaming · Freelance Game Tester · Final Session</div>
          <h1 style={{ margin: "0 0 6px", color: "#fff", fontFamily: "'Courier Prime', monospace", fontSize: "22px", fontWeight: "700" }}>Course Reflection & Evidence Document</h1>
          <div style={{ color: "#e8c547", fontSize: "12px", fontFamily: "'Courier Prime', monospace", fontWeight: "700" }}>⚠ THIS IS YOUR FINAL SUBMISSION — YOU WILL NOT GET ANOTHER OPPORTUNITY</div>
        </div>
      </div>

      <div className="no-print" style={{ background: "#fff", borderBottom: "1px solid #ddd", padding: "10px 32px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ flex: 1, height: "8px", background: "#eee", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#2d7a2d" : "#e8c547", borderRadius: "4px", transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: "12px", fontWeight: "700", color: pct === 100 ? "#2d7a2d" : "#1a1a2e", whiteSpace: "nowrap" }}>{pct === 100 ? "✓ DONE" : `${pct}%`}</div>
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            {TABS.map(tab => (
              <div key={tab.id} title={tab.label} onClick={() => setActiveTab(tab.id)} style={{ width: "10px", height: "10px", borderRadius: "50%", background: tabComplete[tab.id] ? "#2d7a2d" : activeTab === tab.id ? "#e8c547" : "#ddd", cursor: "pointer", transition: "background 0.2s", flexShrink: 0, border: activeTab === tab.id ? "2px solid #1a1a2e" : "2px solid transparent" }} />
            ))}
          </div>
        </div>
      </div>

      <div className="no-print" style={{ background: "#fff", borderBottom: "2px solid #1a1a2e", overflowX: "auto" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex" }}>
          {TABS.map(tab => {
            const done = tabComplete[tab.id]; const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: "none", border: "none", borderBottom: active ? "3px solid #e8c547" : "3px solid transparent", padding: "12px 16px", fontFamily: "'Courier Prime', monospace", fontSize: "11px", fontWeight: "700", color: active ? "#1a1a2e" : done ? "#2d7a2d" : "#999", cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "6px" }}>
                {done && <span style={{ color: "#2d7a2d" }}>✓</span>}{tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 32px" }}>

        {activeTab === "about" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Courier Prime', monospace", fontSize: "16px", fontWeight: "700", color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>About Me as a Game Tester</h2>
              <div style={{ color: "#666", fontSize: "13px", fontFamily: "'Georgia', serif", fontStyle: "italic" }}>Start by filling in your details, then tell us about yourself.</div>
            </div>
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
              <div style={{ flex: 2, minWidth: "180px" }}>
                <label style={{ display: "block", fontFamily: "'Courier Prime', monospace", fontSize: "12px", fontWeight: "700", color: "#1a1a2e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>Full Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={{ width: "100%", border: "1.5px solid #ccc", borderRadius: "3px", padding: "10px 12px", fontFamily: "'Georgia', serif", fontSize: "14px", background: "#fafaf8", outline: "none" }} onFocus={e => e.target.style.borderColor = "#e8c547"} onBlur={e => e.target.style.borderColor = "#ccc"} />
              </div>
              <div style={{ flex: 1, minWidth: "140px" }}>
                <label style={{ display: "block", fontFamily: "'Courier Prime', monospace", fontSize: "12px", fontWeight: "700", color: "#1a1a2e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: "100%", border: "1.5px solid #ccc", borderRadius: "3px", padding: "10px 12px", fontFamily: "'Georgia', serif", fontSize: "14px", background: "#fafaf8", outline: "none", cursor: "pointer" }} onFocus={e => e.target.style.borderColor = "#e8c547"} onBlur={e => e.target.style.borderColor = "#ccc"} />
              </div>
            </div>
            <Field label="Types of games I enjoy testing" hint="Think about genres, platforms, or styles — what kinds of games interest you most as a tester?" value={gameTypes} onChange={setGameTypes} rows={2} />
            <Field label="Why game testing matters" hint="In your own words — what is the point of game testing? Why does it exist in the game development process?" value={whyTesting} onChange={setWhyTesting} rows={4} />
          </div>
        )}

        {activeTab === "testing" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Courier Prime', monospace", fontSize: "16px", fontWeight: "700", color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Testing Skills & Process</h2>
              <div style={{ color: "#666", fontSize: "13px", fontFamily: "'Georgia', serif", fontStyle: "italic" }}>Demonstrate your understanding of the testing process and tools.</div>
            </div>
            <Field label="How I would find and report a bug" hint="Walk through the steps — from finding something wrong in a game to submitting the report. What information would you include?" value={bugProcess} onChange={setBugProcess} rows={5} />
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", fontFamily: "'Courier Prime', monospace", fontSize: "12px", fontWeight: "700", color: "#1a1a2e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>Tools I have used or learned about during this course</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                <CheckItem label="Jira — bug tracking" checked={tools.jira} onChange={v => setTools({ ...tools, jira: v })} />
                <CheckItem label="Trello — project management" checked={tools.trello} onChange={v => setTools({ ...tools, trello: v })} />
                <CheckItem label="Google Docs — documentation" checked={tools.gdocs} onChange={v => setTools({ ...tools, gdocs: v })} />
                <CheckItem label="Google Sheets — data tracking" checked={tools.sheets} onChange={v => setTools({ ...tools, sheets: v })} />
                <CheckItem label="OBS — screen recording" checked={tools.obs} onChange={v => setTools({ ...tools, obs: v })} />
                <CheckItem label="Microsoft Word — documents" checked={tools.word} onChange={v => setTools({ ...tools, word: v })} />
                <CheckItem label="Microsoft Excel — spreadsheets" checked={tools.excel} onChange={v => setTools({ ...tools, excel: v })} />
                <CheckItem label="Microsoft PowerPoint — presentations" checked={tools.powerpoint} onChange={v => setTools({ ...tools, powerpoint: v })} />
                <CheckItem label="Other" checked={tools.other} onChange={v => setTools({ ...tools, other: v })} />
              </div>
              {tools.other && <input value={otherTool} onChange={e => setOtherTool(e.target.value)} placeholder="What other tools?" style={{ width: "100%", border: "1.5px solid #ccc", borderRadius: "3px", padding: "8px 12px", fontFamily: "'Georgia', serif", fontSize: "14px", background: "#fafaf8", outline: "none", marginTop: "8px" }} />}
            </div>
          </div>
        )}

        {activeTab === "freelancing" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Courier Prime', monospace", fontSize: "16px", fontWeight: "700", color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Freelancing Basics</h2>
              <div style={{ color: "#666", fontSize: "13px", fontFamily: "'Georgia', serif", fontStyle: "italic" }}>Show what you know about finding and managing freelance work.</div>
            </div>
            <Field label="Where a freelance game tester might find work" hint="List the platforms, communities, or methods we discussed for finding game testing jobs." value={findWork} onChange={setFindWork} rows={3} />
            <Field label="How I would describe my services to a potential client" hint="Imagine someone asks 'what do you do?' — write a short, clear description of what you could offer." value={pitch} onChange={setPitch} rows={3} />
            <Field label="What I would include on an invoice for game testing work" hint="List the key things that should appear on a professional invoice." value={invoice} onChange={setInvoice} rows={3} />
          </div>
        )}

        {activeTab === "tax" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Courier Prime', monospace", fontSize: "16px", fontWeight: "700", color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Tax & Business Basics</h2>
              <div style={{ color: "#666", fontSize: "13px", fontFamily: "'Georgia', serif", fontStyle: "italic" }}>A quick Google is fine — these are things every freelancer needs to know.</div>
            </div>
            <Field label="What is an ABN and why does a freelancer need one?" hint="ABN stands for Australian Business Number. Look it up if you need to." value={abn} onChange={setAbn} rows={3} />
            <Field label="How would you manage tax as a freelancer?" hint="Think about: setting money aside, GST registration, and keeping records of income and expenses." value={taxApproach} onChange={setTaxApproach} rows={4} />
          </div>
        )}

        {activeTab === "knowledge" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Courier Prime', monospace", fontSize: "16px", fontWeight: "700", color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Knowledge Check</h2>
              <div style={{ color: "#666", fontSize: "13px", fontFamily: "'Georgia', serif", fontStyle: "italic" }}>Open each section and answer all questions. Answers lock on submit.</div>
            </div>
            <div style={{ background: "rgba(232,197,71,0.12)", border: "1.5px solid #e8c547", borderRadius: "4px", padding: "12px 16px", marginBottom: "20px", fontFamily: "'Courier Prime', monospace", fontSize: "12px", color: "#1a1a2e" }}>
              ⚠ Answer all {totalMC} questions before submitting. You cannot change answers after submitting. · {answeredMC}/{totalMC} answered
            </div>
            {MC_GROUPS.map(group => (
              <AccordionGroup key={group.id} group={group} answers={mcAnswers} onSelect={(id, i) => !mcSubmitted && setMcAnswers({ ...mcAnswers, [id]: i })} submitted={mcSubmitted} openGroup={openGroup} setOpenGroup={setOpenGroup} />
            ))}
            {!mcSubmitted && (
              <button onClick={() => answeredMC === totalMC && setMcSubmitted(true)} disabled={answeredMC < totalMC} style={{ marginTop: "16px", background: answeredMC === totalMC ? "#1a1a2e" : "#ccc", border: "none", borderRadius: "3px", color: "#fff", padding: "12px 28px", fontFamily: "'Courier Prime', monospace", fontSize: "13px", fontWeight: "700", cursor: answeredMC === totalMC ? "pointer" : "not-allowed", letterSpacing: "0.05em" }}>
                {answeredMC === totalMC ? "Submit Knowledge Check" : `Answer all questions first (${answeredMC}/${totalMC})`}
              </button>
            )}
            {mcSubmitted && (
              <div style={{ background: mcScore >= 12 ? "rgba(45,122,45,0.08)" : "rgba(180,40,40,0.08)", border: `2px solid ${mcScore >= 12 ? "#2d7a2d" : "#b42828"}`, borderRadius: "4px", padding: "16px 20px", fontFamily: "'Courier Prime', monospace", fontSize: "14px", color: "#1a1a2e", marginTop: "16px" }}>
                <strong>You scored {mcScore}/{totalMC}</strong>{mcScore >= 12 ? " — Well done. Move on to Reflection to finish." : " — Review the highlighted answers, then move on to Reflection."}
              </div>
            )}
          </div>
        )}

        {activeTab === "reflection" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Courier Prime', monospace", fontSize: "16px", fontWeight: "700", color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Reflection</h2>
              <div style={{ color: "#666", fontSize: "13px", fontFamily: "'Georgia', serif", fontStyle: "italic" }}>Honest answers are more useful than perfect ones.</div>
            </div>
            <Field label="The biggest challenge I faced during this course" hint="Be honest — what was hard? What didn't click immediately?" value={challenge} onChange={setChallenge} rows={3} />
            <Field label="Something I am proud of from this course" hint="What did you do well, figure out, or get better at?" value={proudOf} onChange={setProudOf} rows={3} />
            <Field label="One thing I would do next if I wanted to pursue game testing" hint="What's a realistic next step — even a small one?" value={nextStep} onChange={setNextStep} rows={2} />
          </div>
        )}

        {activeTab === "submit" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Courier Prime', monospace", fontSize: "16px", fontWeight: "700", color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Declaration & Submit</h2>
              <div style={{ color: "#666", fontSize: "13px", fontFamily: "'Georgia', serif", fontStyle: "italic" }}>Review your completion status, then declare and submit.</div>
            </div>
            <div style={{ background: "#fff", border: "2px solid #1a1a2e", borderRadius: "4px", padding: "20px", marginBottom: "24px" }}>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: "12px", fontWeight: "700", color: "#1a1a2e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "14px" }}>Completion Summary</div>
              {TABS.filter(t => t.id !== "submit").map(tab => (
                <div key={tab.id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", fontFamily: "'Georgia', serif", fontSize: "14px", color: "#1a1a2e" }}>
                  <span style={{ color: tabComplete[tab.id] ? "#2d7a2d" : "#b42828", fontWeight: "700", fontSize: "16px" }}>{tabComplete[tab.id] ? "✓" : "✗"}</span>
                  {tab.label}
                  {!tabComplete[tab.id] && <button onClick={() => setActiveTab(tab.id)} style={{ marginLeft: "auto", background: "none", border: "1px solid #b42828", borderRadius: "3px", color: "#b42828", padding: "2px 10px", fontFamily: "'Courier Prime', monospace", fontSize: "11px", cursor: "pointer" }}>Go back</button>}
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", border: "2px solid #1a1a2e", borderRadius: "4px", padding: "20px", marginBottom: "24px" }}>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: "12px", fontWeight: "700", color: "#1a1a2e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "12px" }}>Declaration</div>
{!allSectionsComplete && (
  <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: "12px", color: "#b42828", marginBottom: "12px", fontWeight: "700" }}>
    ⚠ Complete all sections before declaring.
  </div>
)}
<CheckItem label="I confirm that this is my own work, completed to the best of my ability. I understand this is my final submission for the Freelance Game Tester course and I will not have another opportunity to complete or revise it." checked={declared} onChange={v => allSectionsComplete && setDeclared(v)} />            </div>
            {submitError && (
              <div style={{ background: "rgba(180,40,40,0.08)", border: "1.5px solid #b42828", borderRadius: "4px", padding: "12px 16px", marginBottom: "16px", fontFamily: "'Courier Prime', monospace", fontSize: "13px", color: "#b42828" }}>{submitError}</div>
            )}
            <button onClick={handleSubmit} disabled={!declared || submitting} style={{ background: declared && !submitting ? "#e8c547" : "#ccc", border: "none", borderRadius: "3px", color: declared && !submitting ? "#1a1a2e" : "#999", padding: "14px 32px", fontFamily: "'Courier Prime', monospace", fontSize: "14px", fontWeight: "700", cursor: declared && !submitting ? "pointer" : "not-allowed", letterSpacing: "0.05em" }}>
              {submitting ? "Submitting..." : declared ? "Submit" : "Complete declaration to submit"}
            </button>
          </div>
        )}

        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", paddingTop: "20px", borderTop: "1px solid #ddd" }}>
{activeTab !== "submit" && <button onClick={() => goTo("next")} disabled={!tabComplete[activeTab]} style={{ background: tabComplete[activeTab] ? "#1a1a2e" : "#ccc", border: "none", borderRadius: "3px", color: "#fff", padding: "10px 24px", fontFamily: "'Courier Prime', monospace", fontSize: "13px", fontWeight: "700", cursor: tabComplete[activeTab] ? "pointer" : "not-allowed" }}>Next →</button>}
      </div>
    </div>
  );
}
