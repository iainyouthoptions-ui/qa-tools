# Bug Bingo (live)

Shared Bug Bingo board for the End of Ember QA training sessions. Anyone with the link can watch the board and mark an empty square with their name. Only facilitators with the PIN can clear a square or clear a whole card.

- `public/index.html` is the page. It polls `/api/card` every 5 seconds.
- `netlify/functions/card.mjs` is the API. It stores one blob per card (`sturt-b2`, `sturt-b3`, `salisbury-b2`, `salisbury-b3`) in the `bug-bingo` Netlify Blobs store.
- The PIN lives in the `BINGO_PIN` environment variable and is checked on the server.

This folder is its own Netlify site. It is separate from the QA tools site at the repo root. Run every command below from inside `bug-bingo/`.

## First-time setup

```bash
cd "C:/SRC tools/bug-bingo"
npm install
npx netlify login
npx netlify sites:create --name bug-bingo-ember
npx netlify env:set BINGO_PIN "pick-a-pin"
npx netlify deploy --prod --no-build --dir public --functions netlify/functions
```

1. `npm install` installs the Blobs client and the Netlify CLI into this folder, so you don't need a global install.
2. `netlify login` opens a browser so you can authorise the CLI.
3. `sites:create` makes the site and links this folder to it. The link is saved in `.netlify/state.json`, which git ignores. The name must be unique across Netlify, so pick another if it's taken. It becomes `https://<name>.netlify.app`.
4. `env:set` stores the PIN. Use 6 or more characters: wrong guesses are slowed down but not locked out. If `env:set` fails with "Missing required path variable 'account_id'" (a bug in CLI 27.10), add the variable in the Netlify dashboard instead: **Project configuration → Environment variables**.
5. `deploy --prod` uploads `public/` and bundles the function.

## Running a session

Live site: https://bug-bingo-ember.netlify.app

| Card | Link |
|---|---|
| Sturt St · Build 2 | https://bug-bingo-ember.netlify.app/?site=sturt&build=b2 |
| Sturt St · Build 3 | https://bug-bingo-ember.netlify.app/?site=sturt&build=b3 |
| Salisbury · Build 2 | https://bug-bingo-ember.netlify.app/?site=salisbury&build=b2 |
| Salisbury · Build 3 | https://bug-bingo-ember.netlify.app/?site=salisbury&build=b3 |

**Before the session**

1. Open the card for your site and build and put it on the projector.
2. Click **Facilitator unlock** and enter the PIN. That browser remembers it.
3. If the card has leftover marks, click **Clear this card**.
4. Test it: mark a square with your name, then tap it again to clear it.
5. Post the card's link in Discord.

**During the session**

- Trainees tap an empty square, type their name and click **Mark found**. No PIN is needed, and their name is filled in next time.
- Every open screen updates within about 5 seconds. Nobody needs to refresh.
- If two people claim the same square, the first one keeps it.
- To fix a mistake, tap the marked square and confirm. Only facilitators can clear squares.
- Completing a line (any row, column or diagonal) plays a line animation. A full card fires confetti.

**Moving to Build 3:** click **Build 3** or open its link. Each card is separate, so Build 2 marks stay.

**After the session:** marks stay saved. On a shared computer, click **Lock editing**.

## Everyday admin

Run these from `C:\SRC tools\bug-bingo`. In Windows PowerShell, use `npm.cmd` and `npx.cmd`, because the plain `npm` and `npx` scripts are blocked there.

- **Deploy changes:** `npm.cmd run deploy`. Each deploy costs 15 Netlify credits on the Free plan (300 a month), so test locally and deploy changes together.
- **Change the PIN:** edit `BINGO_PIN` at https://app.netlify.com/projects/bug-bingo-ember/configuration/env, then deploy. The server only reads the new PIN after a deploy. Facilitators with the old PIN saved get asked for the new one.
- **Change the squares:** edit the `CARDS` list in `public/index.html`, then deploy. Marks are tied to square positions, so rewording a square keeps its mark.
- **Session cost:** about 4 credits an hour with 10 people watching.

**If something goes wrong**

| You see | What it means |
|---|---|
| "Can't reach the board. Retrying…" | Wi-Fi dropped. It reconnects on its own. |
| The PIN prompt keeps coming back | The PIN was changed. Enter the new one. |
| "Running scripts is disabled" | Use `npm.cmd` or `npx.cmd`. |
| "Multiple possible build commands" | Press Ctrl+C and use `npm.cmd run deploy`. |
| "Need to install the following packages" | You're in the wrong folder. Press Ctrl+C and `cd` into `bug-bingo`. |

## Local development

Create `bug-bingo/.env` (git ignores it) containing:

```
BINGO_PIN=local-test-pin
```

Then run `npm run dev` and open http://localhost:8888. Local data is kept in `.netlify/`, apart from production.

## API

`GET /api/card?site=sturt&build=b2` returns `{ key, marks }`, where `marks` maps a square index to `{ name }`.

`POST /api/card` takes one of these bodies. `mark` is open to anyone and fails with 409 if the square is already marked. `clear` and `reset` need the `x-bingo-pin` header.

```json
{ "site": "sturt", "build": "b2", "action": "mark", "index": 3, "name": "Ana" }
{ "site": "sturt", "build": "b2", "action": "clear", "index": 3 }
{ "site": "sturt", "build": "b2", "action": "reset" }
```

The server checks each request: site must be `sturt` or `salisbury`, build must be `b2` or `b3`, index must be a whole number from 0 to 15, and name must be 1 to 40 characters with control characters removed. Updates use an etag check, so two people saving at the same moment can't overwrite each other.
