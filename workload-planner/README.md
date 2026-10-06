# Workload Planner

Delivery planner for the QA programme: Level 1–2 cohorts, Level 3 groups, ongoing activities (Work Foundations, ACE), SA public holidays and closures, and each week's workload for Iain and Neil.

Anyone with the link can view the plan. Editors unlock editing with a PIN, make changes and click **Publish for team**.

- `public/index.html` is the page. It loads the plan from `/api/plan` and checks for a newer version when you return to the tab and every 5 minutes.
- `netlify/functions/plan.mjs` is the API. It stores the whole plan as one blob (`plan`) in the `workload-planner` Netlify Blobs store, with a version number and the time it was last published.
- The PIN lives in the `PLANNER_PIN` environment variable and is checked on the server.
- `original_workload_planner.html` is the earlier single-browser version, kept so old scenarios can be exported from it.

This folder is its own Netlify site. It is separate from the QA tools site at the repo root and from Bug Bingo. Run every command below from inside `workload-planner/`.

## First-time setup

```bash
cd "C:/SRC tools/workload-planner"
npm install
npx netlify login
npx netlify sites:create --name workload-planner-qa
npx netlify env:set PLANNER_PIN "pick-a-pin"
npx netlify deploy --prod --no-build --dir public --functions netlify/functions
```

1. `npm install` installs the Blobs client and the Netlify CLI into this folder.
2. `netlify login` opens a browser so you can authorise the CLI.
3. `sites:create` makes the site and links this folder to it (saved in `.netlify/state.json`, which git ignores). The name must be unique across Netlify. It becomes `https://<name>.netlify.app`.
4. `env:set` stores the editor PIN. Use 6 or more characters. If it fails with "Missing required path variable 'account_id'" (a bug in CLI 27.10), add the variable in the Netlify dashboard instead: **Project configuration → Environment variables**.
5. `deploy --prod` uploads `public/` and bundles the function.

In Windows PowerShell, use `npm.cmd` and `npx.cmd`, because the plain `npm` and `npx` scripts are blocked there.

## Moving the old plan across

1. Open `original_workload_planner.html` in the browser you used before. Its data is stored in that browser.
2. For each scenario, choose it and click **Export**.
3. On the live site, click **Editor unlock**, then **Import** each file.
4. Converted "QA Open Studio" entries become Level 3 groups. Click **Edit** on each and choose its timeslot.
5. Check the dates in **Holidays & closures**, then click **Publish for team**.

## Editing

- **Editor unlock** asks for the PIN. That browser remembers it until you click **Lock editing**.
- Changes stay in your browser until you click **Publish for team**. If you close the tab first, they're offered back next time.
- If someone else published while you were editing, your publish is refused and their version is loaded. Your changes are kept: **Restore** puts them back over theirs, then publish again.
- Holidays and closures are part of the plan. Changing them recalculates every cohort's dates.

## Everyday admin

- **Deploy changes:** `npm.cmd run deploy`. Each deploy costs 15 Netlify credits on the Free plan (300 a month), so test locally and deploy changes together.
- **Change the PIN:** edit `PLANNER_PIN` in the site's environment variables in the Netlify dashboard, then deploy. Editors get asked for the new PIN.
- **Back up the plan:** use **Export** for each scenario, or save the response from `https://<site>/api/plan`.

## Local development

Create `workload-planner/.env` (git ignores it) containing:

```
PLANNER_PIN=local-test-pin
```

Then run `npm run dev` and open http://localhost:8889. Local data is kept in `.netlify/`, apart from production. Opening `public/index.html` directly as a file also works: it runs as a local copy that saves only in that browser.

## API

`GET /api/plan` returns `{ plan, version, updatedAt }`. `plan` is `null` until the first publish.

`POST /api/plan` needs the `x-planner-pin` header and takes one of these bodies:

```json
{ "action": "check" }
{ "action": "save", "baseVersion": 3, "plan": { "scheduleVersion": 3, "calendar": { "holidays": [], "closures": [] }, "scenarios": { "Current state": { "cohorts": [], "ongoing": [], "overrides": {} } } } }
```

`save` fails with 409 and returns the live `{ plan, version, updatedAt }` if `baseVersion` is not the current version, so two editors can't overwrite each other without seeing it. Plans over 4 MB are refused.

## Programme model

- **Level 1–2 cohort:** 40 sessions on a two-day timeslot. Level 1 is Game Playtester and Game Bug Tester (8 weeks). Level 2 is Lead Gameplay Tester, Test Case Writer and Test Plan Writer (12 weeks). Each holiday that hits a session adds a makeup session at the end. An admin week follows each cohort.
- **Level 3 group:** holds a timeslot from its start date with no set finish (an end date is optional). Intake is rolling, and each participant stays up to 6 months.
