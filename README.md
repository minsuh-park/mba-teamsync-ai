# MBA TeamSync AI

**Turn assignment ambiguity into accountable team execution.**

MBA TeamSync AI helps MBA student teams turn confusing assignment briefs, grading
rubrics, and meeting notes into a clear, editable team action plan — deliverables,
tasks with suggested ownership, risks, a next-meeting agenda, and a bilingual
(English / Korean) team summary.

This is a **product marketing portfolio project**: a focused, front-end-only MVP
that demonstrates the product concept, not a production application.

---

## Who it's for

- MBA student teams working on group presentations, case competitions, consulting
  projects, and capstone assignments
- Especially international and cross-cultural teams working in **English and Korean**

## Core value proposition

> Turn assignment ambiguity into accountable team execution.

Teams routinely lose the first week of a project arguing about what the brief
actually asks for and who owns what. TeamSync AI produces a structured first draft
of the plan in seconds so the team's meeting time goes to *decisions*, not
*setup*.

---

## What's in this MVP

A responsive single-page web app with:

1. **Header** — product name, tagline, navigation, "Try Sample Project"
2. **Hero** — headline, supporting copy, primary CTAs
3. **How It Works** — three steps (add context → generate plan → review & align)
4. **Project input form** — course, title, due date, team members, assignment
   brief/rubric, optional meeting notes, output-language selector, with inline
   validation of required fields
5. **Loading experience** — disabled button + animated card cycling through
   realistic status messages
6. **Results dashboard** (hidden until generated):
   - **A. Project overview** — goal, executive summary, key deliverables, success criteria
   - **B. Tasks & workstreams** — editable table (task, workstream, owner, due date,
     priority, dependency, status) with **Add Task** and per-row **Delete**
   - **C. Project risks** — High/Medium/Low cards with description, why it matters,
     recommended action, and supporting evidence quoted from the user's input
   - **D. Next meeting agenda** — 3–5 items with time estimates
   - **E. Team summary** — English always; Korean when "Korean" or "Both" is selected
   - **F. Product disclaimer**

### Sample project

"Try Sample Project" / "Load Sample Project" fills the form with a worked example:
**U.S. Market Entry Strategy for a Korean Skincare Brand** (course: Marketing
Strategy). Generating it produces a full, hand-written mock plan tailored to that
brief and its meeting notes.

---

## How to run

No build step, no dependencies, no server required.

**Option A — open the file directly**

```bash
open index.html
```

(or double-click `index.html`)

**Option B — serve locally** (so `sample-data.json` loads via `fetch`; there is
also an inline fallback copy in `app.js`, so Option A works too)

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

---

## Project structure

```
index.html         Page markup and all sections
styles.css         Design system (CSS custom properties) + responsive layout
app.js             Validation, loading sequence, mock plan generation, editable table
sample-data.json   The sample project data (with an inline fallback in app.js)
README.md          This file
.gitignore         OS / editor / dependency noise
```

Built with **HTML, CSS, and vanilla JavaScript only**. No React, no framework, no
TypeScript, no Tailwind, no database, no authentication, no file uploads, no
payments, no backend, and **no AI API**. The "AI" output is realistic pre-written
content assembled in the browser.

---

## Disclaimer

This is a portfolio prototype. Do not enter confidential, personally sensitive, or
proprietary information.

AI-generated recommendations are starting points, not final decisions. Review and
confirm task owners, due dates, research sources, and project requirements with
your team before acting.

---

## Possible v2 (not built here)

- Real LLM backend that parses an uploaded brief and rubric
- Saved projects and team accounts
- Export to Notion / Google Docs / calendar
- Editable risks and agenda, not just tasks
- Team voting on task ownership
