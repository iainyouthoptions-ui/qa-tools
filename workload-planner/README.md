# Workload Planner

Delivery planner for the QA programme: Level 1–2 cohorts, Level 3 groups, ongoing activities (Work Foundations, ACE), SA public holidays and closures, and each week's workload for Iain and Neil.

**Live page:** https://claude.ai/artifact/Prw2dJ4cqjzgSjmJtmuqAg

## How it is hosted

The page is a claude.ai artifact that saves itself:

- Editors change the plan on the live page and click **Publish for team**. This publishes a new version of the page with the plan embedded in it.
- Everyone else opens the share link and gets a read-only view of the latest published version.
- Unpublished edits are kept as a draft in the editor's browser until they are published or discarded.

The live plan data lives in the artifact, not in this repo. `workload_planner.html` here is the source with an empty plan. Publishing it to the artifact URL from Claude Code replaces the page. Check the live version first, so you keep its plan data (the `plannerData` block).

## Files

- `workload_planner.html`: the planner (page, styles, script and the embedded `plannerData` JSON).
- `original_workload_planner.html`: the earlier single-browser version, kept for reference. Use its **Export** button to move old scenarios across, then **Import** them on the live page.

## Programme model

- **Level 1–2 cohort:** 40 sessions on a two-day timeslot. Level 1 is Game Playtester and Game Bug Tester (8 weeks). Level 2 is Lead Gameplay Tester, Test Case Writer and Test Plan Writer (12 weeks). Each holiday that hits a session adds a makeup session at the end. An admin week follows each cohort.
- **Level 3 group:** holds a timeslot from its start date with no set finish (an end date is optional). Intake is rolling, and each participant stays up to 6 months.
- **Holidays and closures** are edited on the page and published with the plan. Changing them recalculates every cohort's dates.
