/* ============================================================================
   MBA TeamSync AI — app.js
   Front-end only. No backend, no API keys. The "AI" output below is realistic
   pre-written mock content assembled in the browser with vanilla JavaScript.
   ========================================================================== */

(function () {
  "use strict";

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
      form.outputLanguage.value = sampleData.outputLanguage || "both";
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
    generateBtn.textContent = "Generating…";
    results.hidden = true;
    loadingCard.hidden = false;
    loadingCard.scrollIntoView({ behavior: "smooth", block: "center" });

    let i = 0;
    loadingMsg.textContent = LOADING_MESSAGES[0];
    const rotator = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      loadingMsg.textContent = LOADING_MESSAGES[i];
    }, 900);

    setTimeout(() => {
      clearInterval(rotator);
      loadingCard.hidden = true;
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate Team Action Plan";

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

  /* -------------------------------------------------------------------------
     7. Render the dashboard
     ---------------------------------------------------------------------- */
  function renderPlan(plan, data) {
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
    del.textContent = "Delete";
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
      o.textContent = opt;
      if (opt === value) o.selected = true;
      select.appendChild(o);
    });
    if (asPill) {
      const pill = document.createElement("span");
      pill.className = "pill pill--" + value.toLowerCase();
      pill.textContent = value;
      const sync = () => {
        pill.textContent = select.value;
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
    label.textContent = r.level + " risk";

    const desc = document.createElement("p");
    desc.className = "risk-card__desc";
    desc.textContent = r.desc;

    const dl = document.createElement("dl");
    dl.appendChild(term("Why it matters", r.why));
    dl.appendChild(term("Recommended action", r.action));

    const evTerm = document.createElement("dt");
    evTerm.textContent = "Supporting evidence";
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
