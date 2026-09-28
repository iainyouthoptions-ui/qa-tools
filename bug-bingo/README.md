# Bug Bingo (live)

Shared Bug Bingo board for the End of Ember QA training sessions. Anyone with the link can watch the board. Only facilitators with the PIN can mark or clear squares.

- `public/index.html` is the page. It polls `/api/card` every 4 seconds.
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
npx netlify deploy --prod
```

1. `npm install` installs the Blobs client and the Netlify CLI into this folder, so you don't need a global install.
2. `netlify login` opens a browser so you can authorise the CLI.
3. `sites:create` makes the site and links this folder to it. The link is saved in `.netlify/state.json`, which git ignores. The name must be unique across Netlify, so pick another if it's taken. It becomes `https://<name>.netlify.app`.
4. `env:set` stores the PIN. Use 6 or more characters: wrong guesses are slowed down but not locked out.
5. `deploy --prod` uploads `public/` and bundles the function.

## Everyday use

- Deploy changes: `npm run deploy`
- Change the PIN: run `npx netlify env:set BINGO_PIN "new-pin"`, then `npm run deploy`. Functions only pick up env changes on the next deploy. Facilitators whose saved PIN is now wrong get asked again.
- Deep link to a card: `https://<name>.netlify.app/?site=salisbury&build=b3`
- Facilitators: tap **Facilitator unlock**, or just mark a square and enter the PIN when asked. The PIN is saved in that browser once the server accepts it. **Lock editing** removes it.

## Local development

Create `bug-bingo/.env` (git ignores it) containing:

```
BINGO_PIN=local-test-pin
```

Then run `npm run dev` and open http://localhost:8888. Local data is kept in `.netlify/`, apart from production.

## API

`GET /api/card?site=sturt&build=b2` returns `{ key, marks }`, where `marks` maps a square index to `{ name }`.

`POST /api/card` needs the `x-bingo-pin` header. The body is one of:

```json
{ "site": "sturt", "build": "b2", "action": "mark", "index": 3, "name": "Ana" }
{ "site": "sturt", "build": "b2", "action": "clear", "index": 3 }
{ "site": "sturt", "build": "b2", "action": "reset" }
```

The server checks each request: site must be `sturt` or `salisbury`, build must be `b2` or `b3`, index must be a whole number from 0 to 15, and name must be 1 to 40 characters with control characters removed. Updates use an etag check, so two facilitators saving at the same moment can't overwrite each other.
