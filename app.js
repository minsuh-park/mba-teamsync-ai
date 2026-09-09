/* ============================================================================
   MBA TeamSync AI — app.js
   Front-end only. No backend, no API keys. The "AI" output below is realistic
   pre-written mock content assembled in the browser with vanilla JavaScript.
   ========================================================================== */

(function () {
  "use strict";

  /* =========================================================================
     >>> REPLACE THE TWO GOOGLE FORM URLS HERE <<<
     The header and footer "Give feedback" links point at one of these two
     forms depending on the EN / 한국어 page-language toggle.
     ====================================================================== */
  const FEEDBACK_FORM_URL = {
    en: "https://forms.gle/82LGEaYbrrw4HZmV7", // English Google Form
    ko: "https://forms.gle/KFbtb62nhzojDTLD9", // Korean  Google Form
  };
  /* ==================================================================== */

  // localStorage key that remembers the chosen page language across refreshes.
  const PAGE_LANGUAGE_KEY = "mba-teamsync-ai.pageLanguage";

  /* -------------------------------------------------------------------------
     1. Sample project data
     Loaded from sample-data.json when available (e.g. served over http://),
     with this inline copy as a fallback so the page also works from file://.
     ---------------------------------------------------------------------- */
  const SAMPLE_FALLBACK = {
    courseName: "Marketing Strategy",
    projectTitle: "U.S. Market Entry Strategy for a Korean Skincare Brand",
    dueDate: "2026-10-10",
    teamMembers: "Minsuh, Jiyoon, Alex, Daniel",
    assignmentBrief:
      "Develop a market-entry strategy for a Korean skincare brand entering the U.S. market. " +
      "The final presentation should include a U.S. skincare market overview, competitor analysis, " +
      "target consumer segmentation, recommended target segment, positioning statement, go-to-market " +
      "channels, preliminary financial assumptions, risks, and a 10-slide executive presentation. " +
      "Grading emphasizes evidence-based market analysis, logical strategic recommendations, clear " +
      "positioning, feasibility, and presentation quality.",
    meetingNotes:
      "The team agreed that the brand should initially focus on one major U.S. city or region rather " +
      "than a national launch. Alex will begin competitor research, but the team has not decided on a " +
      "target customer segment. Jiyoon suggested TikTok and Sephora as possible channels. The financial " +
      "model and research sources are still unassigned.",
    outputLanguage: "both",
  };

  let sampleData = SAMPLE_FALLBACK;

  fetch("sample-data.json")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data) sampleData = data;
    })
    .catch(() => {
      /* file:// or offline — keep the inline fallback */
    });

  /* -------------------------------------------------------------------------
     2. Element references
     ---------------------------------------------------------------------- */
  const form = document.getElementById("project-form");
  const generateBtn = document.getElementById("generate-btn");
  const loadingCard = document.getElementById("loading-card");
  const loadingMsg = document.getElementById("loading-msg");
  const results = document.getElementById("results");
  const demoSection = document.getElementById("demo");

  const REQUIRED_FIELDS = [
    { name: "courseName", label: "Course name" },
    { name: "projectTitle", label: "Project title" },
    { name: "dueDate", label: "Due date" },
    { name: "teamMembers", label: "Team members" },
    { name: "assignmentBrief", label: "Assignment brief" },
  ];

  const LOADING_MESSAGES = [
    "Reading your assignment brief…",
    "Identifying deliverables and grading criteria…",
    "Building a team action plan…",
  ];

  const PRIORITIES = ["High", "Medium", "Low"];
  const STATUSES = ["Not started", "In progress", "Blocked", "Done"];
  let pageLanguage = "en";
  let currentPlan = null;
  let currentData = null;

  const PAGE_TRANSLATIONS = {
    brandTagline: "과제의 모호함을 책임 있는 팀 실행으로 바꾸세요.",
    navLabel: "주요 메뉴",
    navProduct: "제품", navHow: "사용 방법", navDemo: "데모", navAbout: "소개",
    giveFeedback: "의견 보내기",
    trySample: "샘플 프로젝트 사용",
    pageLanguage: "페이지 언어",
    heroEyebrow: "MBA 학생 팀을 위한 도구",
    heroHeadline: "복잡한 MBA 과제를 명확한 팀 실행 계획으로 바꾸세요.",
    heroSub: "MBA TeamSync AI는 과제 설명, 평가 기준 및 회의록을 편집 가능한 산출물, 작업, 리스크 및 다국어 팀 요약으로 변환합니다.",
    seeHow: "사용 방법 보기",
    proofOne: "그룹 발표, 케이스 경진대회 및 캡스톤에 적합",
    proofTwo: "영어와 한국어를 사용하는 다문화 팀에 적합",
    proofThree: "편집 가능한 결과물로 한 번의 회의에서 조율",
    howTitle: "사용 방법", howLead: "정리되지 않은 과제를 팀이 합의한 실행 계획으로 바꾸는 세 단계입니다.",
    stepOneTitle: "프로젝트 정보 입력", stepOneBody: "과제 설명, 평가 기준, 마감일, 팀원 및 선택 사항인 회의록을 입력합니다.",
    stepTwoTitle: "구조화된 계획 생성", stepTwoBody: "AI가 주요 산출물, 작업, 추천 담당자, 일정, 의존 관계 및 리스크를 정리합니다.",
    stepThreeTitle: "검토 및 조율", stepThreeBody: "추천 내용을 편집하고 책임을 합의한 뒤 다음 팀 회의에서 실행 계획을 확정합니다.",
    demoTitle: "프로젝트로 직접 사용해 보기", demoLead: "아래에 과제 정보를 입력하세요. 어떤 정보도 브라우저 밖으로 전송되지 않습니다.",
    courseName: "수업명", projectTitle: "프로젝트 제목", dueDate: "프로젝트 마감일", teamMembers: "팀원",
    commaSeparated: "쉼표로 구분", assignmentBrief: "과제 설명 또는 평가 기준", meetingNotes: "회의록", optional: "선택 사항",
    outputLanguage: "결과물 언어", english: "영어", korean: "한국어", bothLanguages: "영어와 한국어 모두",
    privacy: "포트폴리오 프로토타입입니다. 기밀 정보, 개인 민감 정보 또는 독점 정보를 입력하지 마세요.",
    generate: "팀 실행 계획 생성", loadSample: "샘플 프로젝트 불러오기", loadingSub: "몇 초 안에 편집할 수 있는 초안을 만들고 있습니다.",
    resultsTitle: "팀 실행 계획", editInputs: "입력 수정", overviewTitle: "A. 프로젝트 개요", projectGoal: "프로젝트 목표",
    executiveSummary: "임원용 요약", keyDeliverables: "주요 산출물", successCriteria: "성공 기준",
    tasksTitle: "B. 작업 및 워크스트림", addTask: "+ 작업 추가", tasksHint: "작업, 담당자, 날짜, 우선순위 및 상태를 수정할 수 있습니다. 셀을 클릭해 변경하세요.",
    task: "작업", workstream: "워크스트림", suggestedOwner: "추천 담당자", suggestedDue: "추천 마감일", priority: "우선순위", dependency: "의존 관계", status: "상태",
    risksTitle: "C. 프로젝트 리스크", agendaTitle: "D. 다음 회의 안건", summaryTitle: "E. 팀 요약", englishSummary: "영어 요약",
    disclaimerTitle: "F. 제품 고지", disclaimer: "AI가 생성한 추천은 최종 결정이 아닌 출발점입니다. 실행하기 전에 팀과 작업 담당자, 마감일, 조사 출처 및 프로젝트 요구사항을 검토하고 확인하세요.",
    aboutTitle: "이 프로젝트에 대하여", aboutBody: "MBA TeamSync AI는 제품 마케팅 포트폴리오 프로토타입입니다. 초기 단계의 B2B SaaS 도구가 MBA 학생 팀, 특히 영어와 한국어를 함께 사용하는 국제 및 다문화 팀이 모호한 과제 설명을 책임 있는 실행 계획으로 바꾸도록 돕는 모습을 보여줍니다.",
    aboutBodyTwo: "이 빌드는 프론트엔드로만 구성되어 있습니다. 'AI' 결과물은 바닐라 JavaScript로 브라우저에서 생성되는 현실적인 사전 작성 콘텐츠입니다. 계정, 업로드 및 백엔드는 없습니다.",
    footerPrototype: "MBA TeamSync AI — 포트폴리오 프로토타입", footerTech: "HTML · CSS · 바닐라 JavaScript",
    whyItMatters: "중요한 이유", recommendedAction: "권장 조치", supportingEvidence: "근거 자료",
  };

  const PAGE_ENGLISH = {
    brandTagline: "Turn assignment ambiguity into accountable team execution.", navLabel: "Primary", navProduct: "Product", navHow: "How It Works", navDemo: "Demo", navAbout: "About", giveFeedback: "Give feedback", trySample: "Try Sample Project", pageLanguage: "Page language",
    heroEyebrow: "For MBA student teams", heroHeadline: "From confusing MBA assignments to a clear team action plan.", heroSub: "MBA TeamSync AI converts assignment briefs, grading rubrics, and meeting notes into editable deliverables, tasks, risks, and bilingual team summaries.", seeHow: "See How It Works", proofOne: "Built for group presentations, case competitions & capstones", proofTwo: "Works for cross-cultural teams in English & Korean", proofThree: "Editable output — align in one meeting",
    howTitle: "How it works", howLead: "Three steps from a messy brief to an accountable plan your team agrees on.", stepOneTitle: "Add your project context", stepOneBody: "Enter an assignment brief, grading rubric, due date, team members, and optional meeting notes.", stepTwoTitle: "Generate a structured plan", stepTwoBody: "AI organizes key deliverables, tasks, suggested ownership, deadlines, dependencies, and risks.", stepThreeTitle: "Review and align", stepThreeBody: "Edit the recommendations, agree on responsibilities, and leave your next team meeting with an actionable plan.",
    demoTitle: "Try it with your project", demoLead: "Paste your assignment details below. Nothing leaves your browser.", courseName: "Course name", projectTitle: "Project title", dueDate: "Project due date", teamMembers: "Team members", commaSeparated: "comma-separated", assignmentBrief: "Assignment brief or grading rubric", meetingNotes: "Meeting notes", optional: "optional", outputLanguage: "Output language", english: "English", korean: "Korean", bothLanguages: "Both English and Korean", privacy: "Portfolio prototype. Do not enter confidential, personally sensitive, or proprietary information.", generate: "Generate Team Action Plan", loadSample: "Load Sample Project", loadingSub: "Building a draft you can edit in seconds.",
    resultsTitle: "Team action plan", editInputs: "Edit inputs", overviewTitle: "A. Project overview", projectGoal: "Project goal", executiveSummary: "Executive summary", keyDeliverables: "Key deliverables", successCriteria: "Success criteria", tasksTitle: "B. Tasks and workstreams", addTask: "+ Add Task", tasksHint: "Task, owner, date, priority, and status are editable. Click a cell to change it.", task: "Task", workstream: "Workstream", suggestedOwner: "Suggested owner", suggestedDue: "Suggested due date", priority: "Priority", dependency: "Dependency", status: "Status", risksTitle: "C. Project risks", agendaTitle: "D. Next meeting agenda", summaryTitle: "E. Team summary", englishSummary: "English summary", disclaimerTitle: "F. Product disclaimer", disclaimer: "AI-generated recommendations are starting points, not final decisions. Review and confirm task owners, due dates, research sources, and project requirements with your team before acting.", aboutTitle: "About this project", aboutBody: "MBA TeamSync AI is a product marketing portfolio prototype. It shows how an early-stage B2B SaaS tool could help MBA student teams — especially international and cross-cultural teams working in English and Korean — turn ambiguous assignment briefs into an accountable execution plan.", aboutBodyTwo: "This build is front-end only. The “AI” output is realistic pre-written content generated in the browser with vanilla JavaScript. No accounts, no uploads, no backend.", footerPrototype: "MBA TeamSync AI — portfolio prototype", footerTech: "HTML · CSS · vanilla JavaScript", whyItMatters: "Why it matters", recommendedAction: "Recommended action", supportingEvidence: "Supporting evidence",
  };

  function uiText(key) {
    return (pageLanguage === "ko" ? PAGE_TRANSLATIONS : PAGE_ENGLISH)[key] || key;
  }

  function applyPageLanguage(language) {
    pageLanguage = language;
    document.documentElement.lang = language;
    form.outputLanguage.value = language;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = uiText(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", uiText(element.dataset.i18nAriaLabel));
    });
    form.teamMembers.setAttribute("placeholder", language === "ko" ? "예: 민수, 지윤, Alex, Daniel" : "e.g. Minsuh, Jiyoon, Alex, Daniel");

    // "Give feedback" links (header + footer) follow the selected language.
    const feedbackUrl = FEEDBACK_FORM_URL[language === "ko" ? "ko" : "en"];
    document.querySelectorAll("[data-feedback-link]").forEach((link) => {
      link.href = feedbackUrl;
    });

    // Remember the choice so it survives a page refresh.
    try {
      localStorage.setItem(PAGE_LANGUAGE_KEY, language);
    } catch (e) {
      /* storage unavailable (private mode, etc.) — ignore */
    }

    document.querySelectorAll("[data-page-language]").forEach((button) => {
      const active = button.dataset.pageLanguage === language;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.title = language === "ko" ? "MBA TeamSync AI — 팀 실행 계획" : "MBA TeamSync AI — Turn assignment ambiguity into accountable team execution";
    if (currentPlan && currentData) {
      currentData.outputLanguage = language;
      renderPlan(currentPlan, currentData);
    }
  }

  document.querySelectorAll("[data-page-language]").forEach((button) => {
    button.addEventListener("click", () => applyPageLanguage(button.dataset.pageLanguage));
  });

  function readStoredLanguage() {
    try {
      const saved = localStorage.getItem(PAGE_LANGUAGE_KEY);
      return saved === "ko" || saved === "en" ? saved : "en";
    } catch (e) {
      return "en";
    }
  }

  applyPageLanguage(readStoredLanguage());

  /* -------------------------------------------------------------------------
     3. Sample project buttons  ("Try Sample Project" / "Load Sample Project")
     ---------------------------------------------------------------------- */
  document.querySelectorAll('[data-action="load-sample"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      form.courseName.value = sampleData.courseName;
      form.projectTitle.value = sampleData.projectTitle;
      form.dueDate.value = sampleData.dueDate;
      form.teamMembers.value = sampleData.teamMembers;
      form.assignmentBrief.value = sampleData.assignmentBrief;
      form.meetingNotes.value = sampleData.meetingNotes;
      form.outputLanguage.value = pageLanguage === "ko" ? "ko" : sampleData.outputLanguage || "both";
      clearAllErrors();
      demoSection.scrollIntoView({ behavior: "smooth", block: "start" });
      form.courseName.focus({ preventScroll: true });
    });
  });

  document.querySelector('[data-action="edit-inputs"]').addEventListener("click", () => {
    demoSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* -------------------------------------------------------------------------
     4. Validation
     ---------------------------------------------------------------------- */
  function clearAllErrors() {
    REQUIRED_FIELDS.forEach((f) => setFieldError(f.name, ""));
  }

  function setFieldError(name, message) {
    const input = form.elements[name];
    const errorEl = form.querySelector('[data-error-for="' + name + '"]');
    if (!input || !errorEl) return;
    errorEl.textContent = message;
    input.closest(".field").classList.toggle("field--invalid", Boolean(message));
  }

  function validate() {
    let firstInvalid = null;
    REQUIRED_FIELDS.forEach((f) => {
      const value = (form.elements[f.name].value || "").trim();
      if (!value) {
        setFieldError(f.name, f.label + " is required to build your plan.");
        if (!firstInvalid) firstInvalid = form.elements[f.name];
      } else {
        setFieldError(f.name, "");
      }
    });
    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return !firstInvalid;
  }

  /* -------------------------------------------------------------------------
     5. Submit → loading sequence → render
     ---------------------------------------------------------------------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = readForm();

    generateBtn.disabled = true;
    generateBtn.textContent = pageLanguage === "ko" ? "생성 중…" : "Generating…";
    results.hidden = true;
    loadingCard.hidden = false;
    loadingCard.scrollIntoView({ behavior: "smooth", block: "center" });

    let i = 0;
    loadingMsg.textContent = pageLanguage === "ko" ? "과제 설명을 읽는 중…" : LOADING_MESSAGES[0];
    const rotator = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      loadingMsg.textContent = pageLanguage === "ko" ? ["과제 설명을 읽는 중…", "산출물과 평가 기준을 파악하는 중…", "팀 실행 계획을 만드는 중…"][i] : LOADING_MESSAGES[i];
    }, 900);

    setTimeout(() => {
      clearInterval(rotator);
      loadingCard.hidden = true;
      generateBtn.disabled = false;
      generateBtn.textContent = uiText("generate");

      const plan = buildPlan(data);
      renderPlan(plan, data);

      results.hidden = false;
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 2600);
  });

  function readForm() {
    return {
      courseName: form.courseName.value.trim(),
      projectTitle: form.projectTitle.value.trim(),
      dueDate: form.dueDate.value.trim(),
      teamMembers: form.teamMembers.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      assignmentBrief: form.assignmentBrief.value.trim(),
      meetingNotes: form.meetingNotes.value.trim(),
      outputLanguage: form.outputLanguage.value,
    };
  }

  /* -------------------------------------------------------------------------
     6. Mock "AI" plan builder
     Returns a rich, hand-written plan for the Korean-skincare sample, and a
     reasonable generic plan for any other input.
     ---------------------------------------------------------------------- */
  function isSkincareSample(data) {
    const hay = (data.projectTitle + " " + data.assignmentBrief).toLowerCase();
    return hay.includes("skincare") || hay.includes("k-beauty") || hay.includes("market-entry") || hay.includes("market entry");
  }

  function daysBefore(dateStr, days) {
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d)) return "TBD";
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  }

  function pick(arr, i) {
    return arr[i % arr.length];
  }

  function buildPlan(data) {
    const members = data.teamMembers.length ? data.teamMembers : ["Owner TBD"];
    const owner = (i) => pick(members, i);

    if (isSkincareSample(data)) {
      return {
        goal:
          "Recommend a validated initial U.S. market-entry strategy for a Korean skincare brand, " +
          "including a target segment, positioning, channel strategy, and feasible financial assumptions.",
        summary:
          "The team will deliver an evidence-based market-entry recommendation focused on a single U.S. " +
          "metro launch. Work splits into market analysis, competitor audit, consumer segmentation, " +
          "positioning, go-to-market channels, and a preliminary financial model, converging into a " +
          "10-slide executive presentation. The two biggest open decisions — the target segment and the " +
          "channel mix — are sequenced early so downstream slides stay consistent.",
        deliverables: [
          "U.S. skincare market overview with cited sources",
          "Competitor audit of K-beauty and U.S. skincare brands",
          "Consumer segmentation and recommended target segment",
          "Positioning statement and messaging pillars",
          "Go-to-market channel plan (retail + digital)",
          "Preliminary financial assumptions and unit economics",
          "Risk register",
          "10-slide executive presentation",
        ],
        success: [
          "Every market claim is backed by a named, dated source",
          "Target segment is chosen with explicit selection criteria",
          "Positioning statement is specific and defensible in Q&A",
          "Financial assumptions are transparent and internally consistent",
          "Presentation runs in under 12 minutes with a clean narrative",
        ],
        tasks: [
          {
            task: "U.S. skincare market overview and source list",
            workstream: "Market Analysis",
            owner: owner(0),
            due: daysBefore(data.dueDate, 24),
            priority: "High",
            dependency: "None",
            status: "Not started",
          },
          {
            task: "Competitor audit of relevant K-beauty and U.S. skincare brands",
            workstream: "Competitor",
            owner: "Alex",
            due: daysBefore(data.dueDate, 22),
            priority: "High",
            dependency: "Market overview (scope)",
            status: "In progress",
          },
          {
            task: "Consumer segmentation and target-segment recommendation",
            workstream: "Segmentation",
            owner: owner(1),
            due: daysBefore(data.dueDate, 18),
            priority: "High",
            dependency: "Market overview; competitor audit",
            status: "Not started",
          },
          {
            task: "Positioning statement and 3 messaging pillars",
            workstream: "Positioning",
            owner: owner(1),
            due: daysBefore(data.dueDate, 14),
            priority: "High",
            dependency: "Target-segment decision",
            status: "Not started",
          },
          {
            task: "Go-to-market channel plan (evaluate TikTok, Sephora, DTC)",
            workstream: "Go-to-Market",
            owner: "Jiyoon",
            due: daysBefore(data.dueDate, 12),
            priority: "Medium",
            dependency: "Target-segment decision",
            status: "Not started",
          },
          {
            task: "Select launch metro and rationale",
            workstream: "Go-to-Market",
            owner: owner(3),
            due: daysBefore(data.dueDate, 16),
            priority: "Medium",
            dependency: "Segmentation",
            status: "Not started",
          },
          {
            task: "Preliminary financial assumptions and unit economics",
            workstream: "Finance",
            owner: owner(3),
            due: daysBefore(data.dueDate, 9),
            priority: "High",
            dependency: "Channel plan; launch metro",
            status: "Not started",
          },
          {
            task: "Assign and document research sources (shared tracker)",
            workstream: "Research Ops",
            owner: owner(0),
            due: daysBefore(data.dueDate, 20),
            priority: "Medium",
            dependency: "None",
            status: "Not started",
          },
          {
            task: "Build 10-slide executive presentation",
            workstream: "Presentation",
            owner: owner(2),
            due: daysBefore(data.dueDate, 4),
            priority: "High",
            dependency: "All analysis workstreams",
            status: "Not started",
          },
          {
            task: "Full dry run and Q&A rehearsal",
            workstream: "Presentation",
            owner: owner(1),
            due: daysBefore(data.dueDate, 2),
            priority: "Medium",
            dependency: "Draft deck complete",
            status: "Not started",
          },
        ],
        risks: [
          {
            level: "High",
            desc: "No target customer segment has been chosen.",
            why: "Positioning, channel choice, and the financial model all depend on the segment. Every day it stays open compounds rework downstream.",
            action: "Timebox a 30-minute decision session by the end of this week; use 3 explicit criteria (segment size, willingness to pay for K-beauty, reachability via chosen channels).",
            evidence: "Meeting notes: \"the team has not decided on a target customer segment.\"",
          },
          {
            level: "High",
            desc: "The financial model and research sources are unassigned.",
            why: "Grading emphasizes feasibility and evidence-based analysis. Unowned work tends to slip to the final week and arrives thin.",
            action: "Assign a named owner for the financial model and a source tracker today; review a first draft at the next meeting.",
            evidence: "Meeting notes: \"The financial model and research sources are still unassigned.\"",
          },
          {
            level: "Medium",
            desc: "Channel strategy may be anchored to two ideas before analysis.",
            why: "TikTok and Sephora were suggested informally. Committing early risks a weak, unsupported channel section under Q&A.",
            action: "Evaluate at least 4 channels against reach, cost, and fit with the target segment; keep TikTok/Sephora as hypotheses, not conclusions.",
            evidence: "Meeting notes: \"Jiyoon suggested TikTok and Sephora as possible channels.\"",
          },
          {
            level: "Medium",
            desc: "Single-metro launch scope is agreed but not yet defined.",
            why: "The brief expects go-to-market specifics. \"One city or region\" is directional, not a decision, and it feeds the financial model.",
            action: "Shortlist 2–3 metros with data (K-beauty demand, retail presence, media costs) and choose one by the segmentation deadline.",
            evidence: "Meeting notes: \"focus on one major U.S. city or region rather than a national launch.\"",
          },
          {
            level: "Low",
            desc: "Presentation polish is deferred to the end.",
            why: "Grading explicitly weighs presentation quality; a late deck leaves no time for a real dry run.",
            action: "Lock the slide outline once positioning is set, and hold the dry run 2 days before submission.",
            evidence: "Assignment brief: \"presentation quality\" is a stated grading criterion.",
          },
        ],
        agenda: [
          { item: "Decide the target customer segment using the 3 agreed criteria", time: "15 minutes" },
          { item: "Assign owners for the financial model and the research source tracker", time: "10 minutes" },
          { item: "Agree the channel evaluation shortlist (4+ channels, not just TikTok/Sephora)", time: "10 minutes" },
          { item: "Pick the launch metro shortlist and the decision date", time: "10 minutes" },
          { item: "Confirm deadlines against the due date and the dry-run slot", time: "5 minutes" },
        ],
        summaryEn:
          "We are building a single-metro U.S. market-entry recommendation for a Korean skincare brand. " +
          "The plan has seven workstreams feeding a 10-slide deck. Two decisions are on the critical path " +
          "and must close this week: the target segment and named owners for the financial model and " +
          "source tracker. Channels (including TikTok and Sephora) will be evaluated against criteria, not " +
          "assumed. Next meeting is a decision meeting — come ready to choose.",
        summaryKo:
          "우리 팀은 한국 스킨케어 브랜드의 미국 단일 도시(메트로) 시장 진입 전략을 준비합니다. " +
          "7개 워크스트림이 10장짜리 발표 자료로 모입니다. 이번 주에 반드시 확정해야 할 두 가지 결정은 " +
          "타깃 고객 세그먼트 선정과 재무 모델·자료 출처 담당자 지정입니다. 채널(틱톡, 세포라 포함)은 " +
          "가정하지 않고 기준에 따라 평가합니다. 다음 회의는 '결정 회의'이므로 결정을 내릴 준비를 하고 오세요.",
      };
    }

    /* ---- Generic fallback plan for arbitrary input ---------------------- */
    const title = data.projectTitle || "your project";
    return {
      goal:
        "Deliver " + title + " for " + (data.courseName || "the course") +
        " on time, meeting every requirement in the brief with clear ownership across the team.",
      summary:
        "This plan breaks the assignment into research, analysis, synthesis, and delivery workstreams. " +
        "Each task has a suggested owner and a due date working backward from " + (data.dueDate || "the deadline") +
        ". Review the recommendations as a team, adjust owners and dates, and confirm scope against the brief.",
      deliverables: [
        "Requirements checklist extracted from the brief and rubric",
        "Core research and evidence base",
        "Analysis and recommendation",
        "Draft deliverable",
        "Final reviewed deliverable",
      ],
      success: [
        "Every requirement in the brief is explicitly addressed",
        "Claims are supported by cited sources",
        "Each task has one accountable owner",
        "A full review happens before the deadline",
      ],
      tasks: [
        { task: "Extract requirements and grading criteria from the brief", workstream: "Scoping", owner: owner(0), due: daysBefore(data.dueDate, 18), priority: "High", dependency: "None", status: "Not started" },
        { task: "Collect core research and sources", workstream: "Research", owner: owner(1), due: daysBefore(data.dueDate, 14), priority: "High", dependency: "Requirements checklist", status: "Not started" },
        { task: "Analyze findings and draft the recommendation", workstream: "Analysis", owner: owner(2), due: daysBefore(data.dueDate, 9), priority: "High", dependency: "Research complete", status: "Not started" },
        { task: "Assemble the draft deliverable", workstream: "Synthesis", owner: owner(3), due: daysBefore(data.dueDate, 5), priority: "Medium", dependency: "Analysis complete", status: "Not started" },
        { task: "Team review and revisions", workstream: "Review", owner: owner(0), due: daysBefore(data.dueDate, 2), priority: "Medium", dependency: "Draft complete", status: "Not started" },
        { task: "Final proofread and submission", workstream: "Delivery", owner: owner(1), due: daysBefore(data.dueDate, 1), priority: "High", dependency: "Review complete", status: "Not started" },
      ],
      risks: [
        {
          level: "Medium",
          desc: "Task ownership is not yet confirmed by the team.",
          why: "Suggested owners are AI guesses. Unconfirmed ownership is the most common cause of missed group-work deadlines.",
          action: "Confirm or reassign every owner at the next meeting and write it down.",
          evidence: data.meetingNotes
            ? "Meeting notes provided by the team: \"" + truncate(data.meetingNotes, 140) + "\""
            : "No meeting notes were provided, so ownership assumptions are unverified.",
        },
        {
          level: "Medium",
          desc: "Scope may exceed the time available before the due date.",
          why: "Backward-planned dates are tight. Any slip in research cascades to the deliverable.",
          action: "Cut or simplify one deliverable now if the schedule looks unrealistic.",
          evidence: "Assignment brief: \"" + truncate(data.assignmentBrief, 140) + "\"",
        },
        {
          level: "Low",
          desc: "Review time is short.",
          why: "Only a couple of days are reserved for revisions before submission.",
          action: "Protect the review slot on everyone's calendar today.",
          evidence: "Derived from the due date entered: " + (data.dueDate || "not set") + ".",
        },
      ],
      agenda: [
        { item: "Walk through the requirements checklist and confirm scope", time: "15 minutes" },
        { item: "Confirm or reassign every task owner", time: "10 minutes" },
        { item: "Agree interim deadlines against the due date", time: "10 minutes" },
        { item: "Identify the single biggest risk and a mitigation", time: "5 minutes" },
      ],
      summaryEn:
        "We have a draft plan for " + title + " with " + (data.teamMembers.length || "several") +
        " contributors and tasks scheduled backward from " + (data.dueDate || "the deadline") +
        ". The next meeting is for confirming scope and ownership so work can start with no ambiguity.",
      summaryKo:
        "\"" + title + "\" 프로젝트의 초안 계획이 준비되었습니다. 마감일(" + (data.dueDate || "미정") +
        ")을 기준으로 역산하여 과제 일정을 배정했습니다. 다음 회의에서는 범위와 담당자를 확정하여 " +
        "모호함 없이 작업을 시작하는 것이 목표입니다.",
    };
  }

  function truncate(str, n) {
    if (!str) return "";
    return str.length > n ? str.slice(0, n).trim() + "…" : str;
  }

  function languageText(english, korean, language) {
    if (language === "ko") return korean;
    if (language === "both") return english + " / " + korean;
    return english;
  }

  function localizePlan(plan, data) {
    if (data.outputLanguage === "en") return plan;

    if (isSkincareSample(data)) {
      const korean = {
        goal: "한국 스킨케어 브랜드의 미국 시장 진입을 위해 타깃 세그먼트, 포지셔닝, 채널 전략 및 실행 가능한 재무 가정을 포함한 검증된 초기 전략을 제안합니다.",
        summary: "팀은 미국 단일 메트로 시장을 대상으로 근거 기반의 시장 진입 전략을 제안합니다. 시장 분석, 경쟁사 조사, 소비자 세분화, 포지셔닝, 유통 채널 및 예비 재무 모델을 10장짜리 임원용 발표 자료로 통합합니다. 타깃 세그먼트와 채널 조합을 초기에 결정하여 이후 슬라이드의 일관성을 확보합니다.",
        deliverables: ["출처가 명시된 미국 스킨케어 시장 개요", "K-뷰티 및 미국 스킨케어 브랜드 경쟁사 분석", "소비자 세분화 및 추천 타깃 세그먼트", "포지셔닝 문구 및 핵심 메시지", "시장 진입 채널 계획(리테일 및 디지털)", "예비 재무 가정 및 단위 경제성", "리스크 목록", "10장짜리 임원용 발표 자료"],
        success: ["모든 시장 주장을 날짜가 포함된 출처로 뒷받침합니다", "명확한 선정 기준으로 타깃 세그먼트를 결정합니다", "질의응답에서 방어할 수 있는 구체적인 포지셔닝 문구를 만듭니다", "재무 가정이 투명하고 서로 일관됩니다", "깔끔한 내러티브로 12분 이내에 발표합니다"],
        tasks: ["미국 스킨케어 시장 개요 및 출처 목록", "관련 K-뷰티 및 미국 스킨케어 브랜드 경쟁사 분석", "소비자 세분화 및 타깃 세그먼트 추천", "포지셔닝 문구 및 3개 메시지 기둥", "시장 진입 채널 계획(TikTok, Sephora, DTC 평가)", "출시 메트로와 선정 근거 결정", "예비 재무 가정 및 단위 경제성", "조사 출처 배정 및 문서화(공유 트래커)", "10장짜리 임원용 발표 자료 작성", "전체 리허설 및 질의응답 연습"],
        workstreams: ["시장 분석", "경쟁사", "세분화", "포지셔닝", "시장 진입", "시장 진입", "재무", "리서치 운영", "발표", "발표"],
        dependencies: ["없음", "시장 개요(범위)", "시장 개요; 경쟁사 분석", "타깃 세그먼트 결정", "타깃 세그먼트 결정", "세분화", "채널 계획; 출시 메트로", "없음", "모든 분석 워크스트림", "발표 자료 초안 완성"],
        risks: [
          ["선택된 타깃 고객 세그먼트가 없습니다.", "포지셔닝, 채널 선택 및 재무 모델이 모두 세그먼트에 달려 있습니다. 결정이 늦어질수록 후속 작업의 재작업이 커집니다.", "이번 주 말까지 30분 의사결정 회의를 정하고, 세그먼트 규모, K-뷰티 구매 의향, 선택 채널을 통한 도달 가능성의 3가지 기준을 사용합니다."],
          ["재무 모델과 조사 출처의 담당자가 정해지지 않았습니다.", "평가는 실행 가능성과 근거 기반 분석을 강조합니다. 담당자가 없는 작업은 마지막 주까지 밀리고 내용이 부실해지기 쉽습니다.", "오늘 재무 모델 담당자와 출처 트래커 담당자를 지정하고 다음 회의에서 첫 초안을 검토합니다."],
          ["분석 전에 채널 전략이 두 가지 아이디어에 고정될 수 있습니다.", "TikTok과 Sephora는 비공식적으로 제안되었습니다. 너무 일찍 결정하면 질의응답에서 근거가 약한 채널 섹션이 될 수 있습니다.", "도달 범위, 비용 및 타깃 세그먼트 적합성으로 최소 4개 채널을 평가하고 TikTok과 Sephora는 결론이 아닌 가설로 둡니다."],
          ["단일 메트로 출시 범위가 합의되었지만 아직 구체화되지 않았습니다.", "과제는 시장 진입의 구체성을 요구합니다. '한 도시 또는 지역'은 방향일 뿐 결정이 아니며 재무 모델에도 영향을 줍니다.", "K-뷰티 수요, 리테일 입점 현황 및 미디어 비용 자료로 2~3개 메트로를 추려 세분화 마감일까지 하나를 선택합니다."],
          ["발표 완성도가 마지막으로 미뤄지고 있습니다.", "평가에서 발표 품질을 명시적으로 반영하므로 늦은 발표 자료는 충분한 리허설 시간을 확보하지 못합니다.", "포지셔닝이 정해지면 슬라이드 구성을 확정하고 제출 2일 전에 리허설을 진행합니다."],
        ],
        agenda: ["합의한 3가지 기준으로 타깃 고객 세그먼트 결정", "재무 모델 및 조사 출처 트래커 담당자 지정", "채널 평가 후보 확정(TikTok/Sephora만이 아닌 4개 이상)", "출시 메트로 후보와 결정일 선정", "마감일과 리허설 일정을 확인"],
      };

      return {
        ...plan,
        goal: languageText(plan.goal, korean.goal, data.outputLanguage),
        summary: languageText(plan.summary, korean.summary, data.outputLanguage),
        deliverables: plan.deliverables.map((item, i) => languageText(item, korean.deliverables[i], data.outputLanguage)),
        success: plan.success.map((item, i) => languageText(item, korean.success[i], data.outputLanguage)),
        tasks: plan.tasks.map((task, i) => ({
          ...task,
          task: languageText(task.task, korean.tasks[i], data.outputLanguage),
          workstream: languageText(task.workstream, korean.workstreams[i], data.outputLanguage),
          dependency: languageText(task.dependency, korean.dependencies[i], data.outputLanguage),
          priority: task.priority,
          status: task.status,
        })),
        risks: plan.risks.map((risk, i) => ({
          ...risk,
          level: risk.level,
          desc: languageText(risk.desc, korean.risks[i][0], data.outputLanguage),
          why: languageText(risk.why, korean.risks[i][1], data.outputLanguage),
          action: languageText(risk.action, korean.risks[i][2], data.outputLanguage),
          evidence: languageText(risk.evidence, "회의록에 근거한 리스크입니다.", data.outputLanguage),
        })),
        agenda: plan.agenda.map((item, i) => ({
          ...item,
          item: languageText(item.item, korean.agenda[i], data.outputLanguage),
          time: languageText(item.time, item.time.replace("minutes", "분"), data.outputLanguage),
        })),
      };
    }

    const title = data.projectTitle || "프로젝트";
    const genericKorean = {
      goal: title + " 과제를 마감일까지 완성하고 과제의 모든 요구사항을 충족합니다.",
      summary: "이 계획은 과제를 조사, 분석, 종합 및 제출 작업으로 나눕니다. 팀이 권장 사항을 검토하고 담당자와 일정을 조정하여 범위를 확정합니다.",
      deliverables: ["과제 및 평가 기준 요구사항 체크리스트", "핵심 조사 및 근거 자료", "분석 및 추천안", "제출물 초안", "최종 검토가 완료된 제출물"],
      success: ["과제의 모든 요구사항을 명시적으로 다룹니다", "주장을 인용된 출처로 뒷받침합니다", "각 작업에 한 명의 책임자를 지정합니다", "마감 전에 전체 검토를 진행합니다"],
      tasks: ["과제에서 요구사항 및 평가 기준 추출", "핵심 조사 및 출처 수집", "결과 분석 및 추천안 작성", "제출물 초안 작성", "팀 검토 및 수정", "최종 교정 및 제출"],
      agenda: ["요구사항 체크리스트를 확인하고 범위 확정", "모든 작업 담당자 확인 또는 재배정", "마감일 기준 중간 일정 합의", "가장 큰 리스크와 대응책 결정"],
    };
    return {
      ...plan,
      goal: languageText(plan.goal, genericKorean.goal, data.outputLanguage),
      summary: languageText(plan.summary, genericKorean.summary, data.outputLanguage),
      deliverables: plan.deliverables.map((item, i) => languageText(item, genericKorean.deliverables[i], data.outputLanguage)),
      success: plan.success.map((item, i) => languageText(item, genericKorean.success[i], data.outputLanguage)),
      tasks: plan.tasks.map((task, i) => ({ ...task, task: languageText(task.task, genericKorean.tasks[i], data.outputLanguage) })),
      agenda: plan.agenda.map((item, i) => ({ ...item, item: languageText(item.item, genericKorean.agenda[i], data.outputLanguage), time: languageText(item.time, item.time.replace("minutes", "분"), data.outputLanguage) })),
    };
  }

  /* -------------------------------------------------------------------------
     7. Render the dashboard
     ---------------------------------------------------------------------- */
  function renderPlan(plan, data) {
    currentPlan = plan;
    currentData = data;
    plan = localizePlan(plan, data);
    document.getElementById("results-context").textContent =
      data.projectTitle + " · " + data.courseName + " · due " + (data.dueDate || "TBD");

    // A. Overview
    document.getElementById("ov-goal").textContent = plan.goal;
    document.getElementById("ov-summary").textContent = plan.summary;
    fillList("ov-deliverables", plan.deliverables);
    fillList("ov-success", plan.success);

    // B. Tasks
    const tbody = document.getElementById("task-tbody");
    tbody.innerHTML = "";
    plan.tasks.forEach((t) => tbody.appendChild(makeTaskRow(t)));

    // C. Risks
    const grid = document.getElementById("risk-grid");
    grid.innerHTML = "";
    plan.risks.forEach((r) => grid.appendChild(makeRiskCard(r)));

    // D. Agenda
    const agenda = document.getElementById("agenda-list");
    agenda.innerHTML = "";
    plan.agenda.forEach((a) => {
      const li = document.createElement("li");
      const time = document.createElement("span");
      time.className = "agenda__time";
      time.textContent = a.time;
      const text = document.createElement("span");
      text.textContent = a.item;
      li.append(time, text);
      agenda.appendChild(li);
    });

    // E. Summary + language handling
    document.getElementById("summary-en-text").textContent = plan.summaryEn;
    document.getElementById("summary-ko-text").textContent = plan.summaryKo;
    const showKo = data.outputLanguage === "ko" || data.outputLanguage === "both";
    const showEn = data.outputLanguage !== "ko";
    document.getElementById("summary-en").hidden = !showEn;
    document.getElementById("summary-ko").hidden = !showKo;
  }

  function fillList(id, items) {
    const ul = document.getElementById(id);
    ul.innerHTML = "";
    items.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      ul.appendChild(li);
    });
  }

  /* ---- Editable task row -------------------------------------------------- */
  function makeTaskRow(t) {
    const tr = document.createElement("tr");

    tr.appendChild(editableCell(t.task));           // Task
    tr.appendChild(staticCell(t.workstream));        // Workstream
    tr.appendChild(editableCell(t.owner));           // Owner
    tr.appendChild(editableCell(t.due, "date"));     // Due date
    tr.appendChild(selectCell(t.priority, PRIORITIES, true)); // Priority
    tr.appendChild(staticCell(t.dependency));        // Dependency
    tr.appendChild(selectCell(t.status, STATUSES, false));    // Status

    const actions = document.createElement("td");
    const del = document.createElement("button");
    del.type = "button";
    del.className = "btn-delete";
    del.textContent = pageLanguage === "ko" ? "삭제" : "Delete";
    del.addEventListener("click", () => tr.remove());
    actions.appendChild(del);
    tr.appendChild(actions);

    return tr;
  }

  function staticCell(text) {
    const td = document.createElement("td");
    td.textContent = text;
    return td;
  }

  function editableCell(text, type) {
    const td = document.createElement("td");
    if (type === "date") {
      const input = document.createElement("input");
      input.type = "date";
      input.className = "cell-edit";
      input.value = /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
      td.appendChild(input);
    } else {
      const span = document.createElement("span");
      span.className = "cell-edit";
      span.contentEditable = "true";
      span.spellcheck = false;
      span.textContent = text;
      td.appendChild(span);
    }
    return td;
  }

  function selectCell(value, options, asPill) {
    const td = document.createElement("td");
    const select = document.createElement("select");
    select.className = "cell-edit";
    options.forEach((opt) => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = pageLanguage === "ko" ? ({ High: "높음", Medium: "중간", Low: "낮음", "Not started": "시작 전", "In progress": "진행 중", Blocked: "차단됨", Done: "완료" }[opt] || opt) : opt;
      if (opt === value) o.selected = true;
      select.appendChild(o);
    });
    if (asPill) {
      const pill = document.createElement("span");
      pill.className = "pill pill--" + value.toLowerCase();
      pill.textContent = value;
      const sync = () => {
        pill.textContent = pageLanguage === "ko" ? ({ High: "높음", Medium: "중간", Low: "낮음" }[select.value] || select.value) : select.value;
        pill.className = "pill pill--" + select.value.toLowerCase();
      };
      select.addEventListener("change", sync);
      td.append(pill, document.createElement("br"), select);
    } else {
      td.appendChild(select);
    }
    return td;
  }

  /* ---- Add Task -------------------------------------------------------- */
  document.querySelector('[data-action="add-task"]').addEventListener("click", () => {
    const tbody = document.getElementById("task-tbody");
    const row = makeTaskRow({
      task: "New task",
      workstream: "—",
      owner: "Owner TBD",
      due: "",
      priority: "Medium",
      dependency: "—",
      status: "Not started",
    });
    tbody.appendChild(row);
    const firstEditable = row.querySelector('.cell-edit[contenteditable="true"]');
    if (firstEditable) {
      firstEditable.focus();
      document.getSelection().selectAllChildren(firstEditable);
    }
  });

  /* ---- Risk card ----------------------------------------------------- */
  function makeRiskCard(r) {
    const level = r.level.toLowerCase();
    const card = document.createElement("div");
    card.className = "risk-card risk-card--" + level;

    const label = document.createElement("span");
    label.className = "risk-card__label";
    label.textContent = pageLanguage === "ko" ? ({ High: "높음", Medium: "중간", Low: "낮음" }[r.level] || r.level) + " 리스크" : r.level + " risk";

    const desc = document.createElement("p");
    desc.className = "risk-card__desc";
    desc.textContent = r.desc;

    const dl = document.createElement("dl");
    dl.appendChild(term(uiText("whyItMatters"), r.why));
    dl.appendChild(term(uiText("recommendedAction"), r.action));

    const evTerm = document.createElement("dt");
    evTerm.textContent = uiText("supportingEvidence");
    const evDef = document.createElement("dd");
    evDef.className = "risk-card__evidence";
    evDef.textContent = r.evidence;
    dl.append(evTerm, evDef);

    card.append(label, desc, dl);
    return card;
  }

  function term(dt, dd) {
    const frag = document.createDocumentFragment();
    const t = document.createElement("dt");
    t.textContent = dt;
    const d = document.createElement("dd");
    d.textContent = dd;
    frag.append(t, d);
    return frag;
  }
})();
